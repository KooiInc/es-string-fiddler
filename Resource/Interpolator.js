const interpolateDefault = interpolateFactory(null);
const interpolateClear = interpolateFactory(``);

Object.defineProperties(String.prototype, {
  [Symbol.for(`interpolate`)]: { value(...args) { return interpolateDefault(this, ...args); } },
  [Symbol.for(`interpolate$`)]: { value(...args) { return interpolateClear(this, ...args); } },
} );

export {
  interpolateDefault as default,
  interpolateClear,
  interpolateFactory,
};

function interpolateFactory(defaultReplacer = "") {
  return function(str, ...tokens) {
    if (!tokens?.length) {
      tokens = [{"@!": defaultReplacer}];
    }
    
    return interpolate(str, processTokens(tokens));
  }
  
  function isStringOrNumber(v) {
    return [String, Number].includes(v?.constructor);
  }
  
  function isObject(v) {
    return v?.constructor === Object;
  }
  
  function invalidate(key) {
    switch(true) {
      case isStringOrNumber(defaultReplacer):
        return String(defaultReplacer);
      default:
        return `{${key}}`;
    }
  }
  
  function replacement(key, token) {
    return isStringOrNumber(token[key]) ? String(token[key]) : invalidate(key);
  }
  
  function getReplacerLambda(token) {
    return (...args) => {
      const keyArg = args.find(a => a.key);
      return replacement(keyArg ? keyArg.key : `_`, token);
    };
  }
  
  function replace(str, token) {
    return str.replace(/\{(?<key>[a-z_\d]+)}/gim, getReplacerLambda(token));
  }
  
  function mergeTokensFromArrayValues(obj) {
    const merged = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      value.forEach((v, i) => {
        merged[i] = merged[i] ?? {};
        merged[i][key] = v;
      });
    });
    
    return merged;
  }
  
  function isMultiLineWithArrays(tokens) {
    return tokens.length === 1 && Object.values(tokens[0]).every(Array.isArray);
  }
  
  function processTokens(tokens) {
    return isMultiLineWithArrays(tokens) ? mergeTokensFromArrayValues(tokens[0]) : tokens;
  }
  
  function interpolate(str, tokens) {
    return tokens.flat()
      .map(token => isObject(token) ? replace(str, token) : ``)
      .join(``);
  }
}