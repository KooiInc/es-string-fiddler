export default createDefaultStringBuilder;

const nonMutables = allNonStringReturns();
const proxyHandler = initProxyHandler();
let $CaseAndQuote;

function createDefaultStringBuilder($SInitial) {
  $CaseAndQuote = [...$SCaseQuotKeys($SInitial), ...$SCaseQuotKeys($SInitial, true)];
  
  return stringBuilderFactory;
  
  function stringBuilderFactory({sanitizeHTML = false, $S = $SInitial} = {}) {
    const $XS = retrieve$XS($S, sanitizeHTML);
    
    return function Create(theString, ...args) {
      theString = $XS(theString, ...args);
      
      const strX = {
        toString() { return String(theString.value); },
        valueOf() { return theString.value.toString(); },
        get clear() { return Create(``); },
        set value(val) { theString = $XS(val); },
        get value() { return theString; },
        get clone() { return Create(theString.value); },
        is(val, ...args) {
          theString = $XS(val, ...args);
          return me;
        }
      };
      
      const me = new Proxy(strX, proxyHandler);
      return me;
    }
  }
}

function retrieve$XS($S, sanitize) {
  return (str, ...args) => sanitize ? $S(str, ...args) : $S.rawHTML(str, ...args);
}

function getCQKey(key) {
  return `${key.slice(1,2).toLowerCase()}${key.slice(2)}`;
}

function cleanupKey(key) {
  return String(key).trim().replace(/^case|^quot/i, v => v[0].toLowerCase());
}

function initProxyHandler() {
  return {
    get(target, key) {
      key = cleanupKey(key);
      
      if (!/^symbol/i.test(key)) {
        const fromInternalStringValue = target.value[key];
        const fromOwnValue = target[key];
        
        if ($CaseAndQuote.find(k => k === key)) {
          const realKey = getCQKey(key);
          return key.startsWith(`c`)
            ? target.is(target.value.case[realKey])
            : target.is(target.value.quote[realKey])
        }
        
        return fromOwnValue
          ? fromOwnValue
          : fromInternalStringValue
            ? canMutate(key, fromInternalStringValue)
              ? (...args) => { return target.is(fromInternalStringValue(...args)); }
              : fromInternalStringValue
          : target
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

function $SCaseQuotKeys($S, quot) {
  return Object.keys($S``[quot ? `quote` : `case`])
    .map(v => `${quot ? `q` : `c`}${$S(v).case.firstUC}`);
}


