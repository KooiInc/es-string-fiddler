const { randomString, uuid4 } = randomStringGeneratorFactory();
export { randomString as default, randomString, uuid4 };

function randomStringGeneratorFactory() {
  const hasCrypto = checkBrowserCrypto();
  const getRandomValue = () => hasCrypto
    ? [...crypto.getRandomValues(new Uint32Array(1))].shift() / 2**32
    : Math.random();
  const randomNr = ({min = 0, max = Number.MAX_SAFE_INTEGER} = {}) =>
     Math.floor( getRandomValue() * (max - min + 1) + min );
  const range = (start = 0, len = 10, reMap) => (reMap || []) instanceof Function
    ? [...Array(len)].map((_, i) => start + i).map(reMap)
    : [...Array(len)].map((_, i) => start + i);
  const map2Chrs = v => String.fromCharCode(v);
  const symRE = /[!?@#$%^&*=+_;\-]/g;
  const shuffle = array => {
    let i = array.length;
    while (i--) {
      const ri = randomNr( { max: i } );
      [array[i], array[ri]] = [array[ri], array[i]];
    }

    return array;
  };
  const UC = shuffle(range(65, 26, map2Chrs));
  const LC = shuffle(range(97, 26, map2Chrs));
  const UCLC = shuffle(UC.concat(LC));
  const allChars = { UCLC, UC, LC, Nrs: shuffle(range()), Sym: shuffle(`!@#$%^&+*=-_;?`.split(``)), };
  const getChars2Use =  use => Object.entries(use)
    .reduce( (acc, [key, value]) => value ? [...acc, ...allChars[key]] : acc, LC );

  function checkBrowserCrypto() {
    try { return window && `crypto` in window }
    catch(_) { return false; }
  }

  function uuid4() {
    // Note: randomUUID only in secure context (https)
    return hasCrypto && crypto.randomUUID
      ? crypto.randomUUID()
      : [...new Uint8Array(16)]
          .map(_ => randomNr({max: 255}))
          .map( (v, i) => `${
            (i === 8 ? v & 0b00111111 | 0b10000000 : i === 6  ? v & 0b00001111 | 0b01000000 : v)
              .toString(16).padStart(2, `0`)}${~[3,5,7,9].indexOf(i) ? `-` : ``}` )
          .join(``);
  }

  function randomString( {
      len = 12,
      includeUppercase = true,
      includeNumbers = false,
      includeSymbols = false,
      startAlphabetic = false } = {} ) {
    let chrs2Use = shuffle( getChars2Use( { UC: includeUppercase, Nrs: includeNumbers, Sym: includeSymbols } ) );
    const rRange = shuffle(range(1, len-1));
    do { chrs2Use = [...chrs2Use, ...shuffle(chrs2Use)]; } while (chrs2Use.length < len);
    let initial = chrs2Use.slice(0, len).join(``);
    const randomPos = randomNr({max: initial.length-1});

    if (includeNumbers && !/\d/g.test(initial)) { // at least 1 number
      initial = initial.slice(0, randomPos - 1) + allChars.Nrs[randomNr({max: allChars.Nrs.length-1})] + initial.slice(randomPos);
    }

    if (includeSymbols && !symRE.test(initial)) { // at least 1 special char
      initial = initial.slice(0, randomPos - 1) + allChars.Sym[randomNr({max: allChars.Sym.length-1})] + initial.slice(randomPos);
    }

    if (startAlphabetic && !/^[a-z]/i.test(initial[0])) { // first alphabetic
      const letters = allChars[includeUppercase ? `UCLC` : `LC`];
      initial = letters[randomNr({max: letters.length-1})] + initial.slice(1);
    }

    return initial;
  }

  return { randomString, uuid4, };
}