const { randomString, uuid4 } = randomStringGeneratorFactory();
export { randomString as default, randomString, uuid4 };

function randomStringGeneratorFactory() {
  const getRandomValue = () => window.crypto
    ? [...crypto.getRandomValues(new Uint32Array(1))].shift() / 2**32
    : Math.random();
  const randomNr = ({min = 0, max = Number.MAX_SAFE_INTEGER} = {}) =>
     Math.floor( getRandomValue() * (max - min + 1) + min );
  const [range, map2Chrs, symRE] = [
    (start = 0, len = 10, reMap) => reMap && reMap instanceof Function
      ? [...Array(len)].map((_, i) => start + i).map(reMap)
      : [...Array(len)].map((_, i) => start + i),
    v => String.fromCharCode(v),
    /[!?@#$%^&*=+_;\-]/g,
  ];
  const shuffle = array => {
    let i = array.length;
    while (i--) {
      const ri = randomNr( { max: i } );
      [array[i], array[ri]] = [array[ri], array[i]];
    }

    return array;
  };
  const [UC, LC] = [shuffle(range(65, 26, map2Chrs)), shuffle(range(97, 26, map2Chrs))];
  const UCLC = shuffle(UC.concat(LC));
  const allChars = {
    UCLC,
    UC,
    LC,
    Nrs: shuffle(range()),
    Sym: shuffle(`!@#$%^&+*=-_;?`.split(``)),
    getChars2Use(use) {
      return Object.entries(use).reduce( (acc, [key, value]) =>
        value ? [...acc, ...this[key]] : acc, LC );
    }
  };

  function uuid4() {
    return [...new Uint8Array(16)].map(_ => randomNr({max: 255}))
      .map( (v, i) => `${
        (i === 8 ? v & 0b00111111 | 0b10000000 : i === 6  ? v & 0b00001111 | 0b01000000 : v)
          .toString(16).padStart(2, `0`)}${~[3,5,7,9].indexOf(i) ? `-` : ``}` )
      .join(``);
  }

  return {
    randomString: function( {
        length = 12,
        includeUppercase = true,
        includeNumbers = false,
        includeSymbols = false,
        startAlphabetic = false } = {} ) {
      let chrs2Use = shuffle( allChars.getChars2Use( { UC: includeUppercase, Nrs: includeNumbers, Sym: includeSymbols } ) );
      const rRange = shuffle(range(1, length-1));
      while (chrs2Use.length < length) { chrs2Use = [...chrs2Use, ...shuffle(chrs2Use)]; }
      const initial = chrs2Use.slice(0, length);

      if (includeNumbers && !initial.find(v => !isNaN(parseInt(v)))) { // at least 1 number
        initial.splice(rRange.shift(), 1, allChars.Nrs[randomNr({max: allChars.Nrs.length})]);
      }

      if (includeSymbols && !symRE.test(initial.join(``))) { // at least 1 special char
        initial.splice(rRange.shift(), 1, allChars.Sym[randomNr({max: allChars.Sym.length})]);
      }

      if (startAlphabetic && !/^[a-z]/i.test(initial[0])) { // first alphabetic
        initial.splice(0, 1, allChars.UCLC[randomNr({max: allChars.UCLC.length})]);
      }

      return `${initial.join(``)}`;
    },
    uuid4,
  };
}