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
  const symbols = `!?@#$%^&*=+_;-`.split(``);
  const symRE = RegExp(`[${symbols.map(v => `\\${v}`).join(``)}]`, `g`);
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
  const allChars = { UCLC, UC, LC, Nrs: shuffle(range()), Sym: shuffle(symbols), };
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
  
  function strTest(strFound, numbers, symbols) {
    return /[a-z]/i.test(strFound) && (
      numbers && symbols ? /\d/.test(strFound) && symRE.test(strFound)
        : numbers ? /\d/.test(strFound)
          : symbols ? symRE.test(strFound)
            : true);
  }
  
  function alphaSwap(strFound) {
    const chars = [...strFound];
    const idx = chars.findIndex(v => /[a-z]/i.test(v));
    [chars[0], chars[idx]] = [chars[idx], chars[0]];
    return chars.join(``);
  }
  
  function randomString( {
      len = 12,
      includeUppercase = true,
      includeNumbers = false,
      includeSymbols = false,
      startAlphabetic = false } = {} ) {
    len = len < 6 ? 6 : len;
    let strFound;
    let chrs2Use = shuffle( getChars2Use( { UC: includeUppercase, Nrs: includeNumbers, Sym: includeSymbols } ) );
    
    while (chrs2Use.length < len) { chrs2Use = [...chrs2Use, ...shuffle(chrs2Use)]; }
    
    if (!(includeNumbers || includeSymbols)) { return chrs2Use.slice(0, len).join(``); }
    
    for (let i = 0; i < chrs2Use.length; i += 1) {
      strFound = chrs2Use.slice(i, i + len).join(``);
      
      if (strTest(strFound, includeNumbers, includeSymbols)) {
        return startAlphabetic && !/^[a-z]/i.test(strFound) ? alphaSwap(strFound) : strFound;
      }
    }
    
    return randomString({len, includeUppercase, includeNumbers, includeSymbols, startAlphabetic});
  }
  
  return { randomString, uuid4 };
}
