export default createDefaultStringBuilder;

const nonMutables = allNonStringReturns();
const proxyHandler = initProxyHandler();
let $CaseAndQuote;

function createDefaultStringBuilder($SInitial) {
  $CaseAndQuote = $SCaseQuotKeys($SInitial);
  
  return stringBuilderFactory;
  
  function stringBuilderFactory({sanitizeHTML = false, $S = $SInitial} = {}) {
    const $XS = retrieve$XS($S, sanitizeHTML);
    return Create;
    
    function Create(internalStringValue, ...args) {
      internalStringValue = $XS(internalStringValue, ...args);
      let currentCustomQuotes = null;
      const strX = {
        toString() { return String(internalStringValue.value); },
        valueOf() { return internalStringValue.value.toString(); },
        get clear() { internalStringValue = $XS``; return me; },
        set value(val) { internalStringValue = $XS(val); },
        get value() { return internalStringValue; },
        get clone() { return Create(internalStringValue.value); },
        get allKeys() { return retrieveAllMethodNames(me); },
        is(val, ...args) { return (internalStringValue = $XS(val, ...args), me); }
      };
      Object.defineProperty(
        strX,
        `currentCustomQuotes`, {
          get() { return currentCustomQuotes; },
          set(val) { currentCustomQuotes = val; },
          enumerable: false } );
      const me = new Proxy(strX, proxyHandler);
      
      return me;
    }
  }
}

function retrieveAllMethodNames(forMe) {
  const noNr = v => isNaN(+v);
  const inInstanceValue = Object.keys(forMe.value).filter(noNr);
  const inInstance = Object.keys(forMe).filter(noNr);
  return {inInstance, inInstanceValue, all: inInstance.concat(inInstanceValue), };
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

function escape4RegExp(str) {
  return str.replace(/([*\[\]()-+{}.$?\\])/g, v => `\\${v}`);
}

function removeCustomQuotes(str, {start, end}) {
  const reStr = escape4RegExp(`${start}_!_${end}`).replace(`_!_`, `|`);
  return str.trim().replace(RegExp(`^${reStr}$`, `g`), ``);
}

function handleQuoting(target, realKey) {
  if (realKey === `remove`) {
    if (target.currentCustomQuotes !== null) {
      const quotCopy = {...target.currentCustomQuotes};
      target.currentCustomQuotes = null;
      return target.is(removeCustomQuotes(target.value, quotCopy));
    }
    
    return target.is(target.value.quote.remove);
  }
  
  if (realKey === `custom`) {
    return ({start, end} = {}) => {
      if (start && end) {
        target.currentCustomQuotes = {start, end};
        return target.is(target.value.quote.remove)
          .is(target.value.prepend(start).append(end));
      }
      
      return target.is(target.value);
    }
  }
  
  if (target.currentCustomQuotes !== null) {
    const quotCopy = {...target.currentCustomQuotes};
    target.currentCustomQuotes = null;
    return target.is(removeCustomQuotes(target.value, quotCopy)).is(target.value.quote[realKey]);
  }
  
  return target.is(target.value.quote.remove).is(target.value.quote[realKey]);
}

function initProxyHandler() {
  return {
    get(target, key) {
      key = cleanupKey(key);
      
      if (!/^symbol/i.test(key)) {
        let fromInternalStringValue = target.value[key];
        let fromOwnValue = target[key];
        
        if ($CaseAndQuote.find(k => k === key)) {
          const realKey = getCQKey(key);
          return key.startsWith(`c`)
            ? target.is(target.value.case[realKey])
            : handleQuoting(target, realKey);
        }
        
        return fromOwnValue !== undefined
          ? fromOwnValue
          : fromInternalStringValue !== undefined
            ? isFunctionAndMutable(key, fromInternalStringValue)
              ? (...args) => { return target.is(fromInternalStringValue(...args)); }
              : fromInternalStringValue
          : target
      }
    },
    has(target, key) {
      return key in target.value || key in target;
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

function isFunctionAndMutable(key, obj) {
  return obj instanceof Function && !nonMutables.find(v => v === key);
}

function $SCaseQuotKeys($S) {
  const $SInstance = $S``;
  const caseKeys = Object.keys($SInstance.case).map(v =>`c${$S(v).case.firstUC}`);
  const quotKeys = Object.keys($SInstance.quote).map(v =>`q${$S(v).case.firstUC}`)
    .concat(`qCustom`, `quotCustom`, `quoteCustom`);
  return [...caseKeys, ...quotKeys];
}