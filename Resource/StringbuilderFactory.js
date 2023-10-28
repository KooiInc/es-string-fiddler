export default createDefaultStringBuilder;

const nonMutables = allNonStringReturns();
const [casing, quoting] = initFactories();
const proxyHandler = initProxyHandler();

function createDefaultStringBuilder($SInitial) {
  return stringBuilderFactory;
  
  function stringBuilderFactory({sanitizeHTML = false, $S = $SInitial} = {}) {
    const $XS = retrieve$XS($S, sanitizeHTML);
    
    return function Create(theString, ...args) {
      theString = $XS(theString, ...args);
      
      const strObj = {
        toString() { return String(theString.value); },
        valueOf() { return theString.value.toString(); },
        get clear() { return Create(``); },
        set value(val) { theString = $XS(val); },
        get value() { return theString; },
        get clone() { return Create(theString.value); },
        is(val, ...args) {
          theString = $XS(val, ...args);
          
          return proxify(strObj, proxyHandler);
        }
      };
      
      return proxify(strObj, proxyHandler)
    }
  }
}

function proxify(actualStrObj, proxyHandler) {
  return new Proxy(actualStrObj, proxyHandler);
}

function retrieve$XS($S, sanitize) {
  return (str, ...args) => sanitize ? $S(str, ...args) : $S.rawHTML(str, ...args);
}

function initProxyHandler() {
  return {
    get(target, key) {
      key = String(key).trim();
      
      if (!/^symbol/i.test(key)) {
        if (/^case|^quot/i.test(key)) {
          return /^case/i.test(key)
            ? casing(target)[key.slice(4)] ?? target
            : quoting(target)[key.slice(4)] ?? target;
        }
        
        if (key in target) {
          return target[key];
        }
        
        if (target.value[key] && canMutate(key, target.value[key])) {
          return (...args) => { return target.is(target.value[key](...args)) };
        }
        
        if (target.value[key] && !canMutate(key, target.value[key])) {
          return target.value[key];
        }
      }
    },
  };
}

function checkReturnValue(key, v) {
  return v.value instanceof Function ? typeof `abc`[key]() : `n/a`;
}

function allNonStringReturns() {
  return Object.entries(Object.getOwnPropertyDescriptors(String.prototype))
    .filter( ([key, v]) => key === `at` || checkReturnValue(key, v) !== `string` )
    .map( ([key,]) => key );
}

function canMutate(key, obj) {
  return obj instanceof Function && !nonMutables.find(v => v === key);
}

// we can't use the internal $S case/quote internal methods, so
// here are the mutating casing and quoting getters for the stringbuilder
// [instance].case[casing method] or [instance].quot[quoting method]
// e.g. [SB instance].caseFirstup or [SB instance].quotSingle
function initFactories() {
  const casing = thatsMe => ({
    get Up() { return thatsMe.is(thatsMe.value.case.upper); },
    get Low() { return thatsMe.is(thatsMe.value.case.lower) },
    get WordsFirstup() { return thatsMe.is(thatsMe.value.case.wordsFirstUC); },
    get Firstup() { return thatsMe.is(thatsMe.value.case.firstUC); },
    get Camel() {  return thatsMe.is(thatsMe.value.case.camel); },
    get Dashed() { return thatsMe.is(thatsMe.value.case.dashed); },
  });
  const quoting = thatsMe => ({
    get Double() { return thatsMe.is(thatsMe.value.quote.double); },
    get Single() { return thatsMe.is(thatsMe.value.quote.single); },
    get Backtick() { return thatsMe.is(thatsMe.value.quote.backtick); },
  });
  
  return [casing, quoting];
}


