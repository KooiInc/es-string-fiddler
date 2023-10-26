export default createDefaultStringBuilder;

const nonMutables = allNonStringReturns();

function createDefaultStringBuilder($SInitial) {
  return stringBuilderFactory;
  
  function stringBuilderFactory({sanitizeHTML = false, $S = $SInitial} = {}) {
    if (!$S) { return console.error(`Please provide $S (the es-string-fiddler constructor to use)`); }
    
    const $XS = (str, ...args) => sanitizeHTML ? $S(str, ...args) : $S.rawHTML(str, ...args);
    
    // Create can be called as tagged template
    return function Create(theString, ...args) {
      theString = $XS(Array.isArray(args) ? resolveTemplateString(theString, ...args) : theString);
      const strObj = {
        toString() { return me.value; },
        valueOf() { return  String(me.value); },
        // empty the string
        get clear() { return me.is``; },
        set value(val) { theString = $XS(val); },
        // the value getter delivers a $S instance
        get value() { return theString; },
        // clone current mutable string including its history
        get clone() { return Create(String(me)); },
        // Set the value of the instance.
        // [instance].is Can be called as tagged template
        is(val, ...args) {
          theString = $XS(resolveTemplateString(val, ...args));
          return me;
        },
      };
      
      // note: [instance].case/-.quote are not propagated from the $S instance (the value):
      // [instance].value.case/-.quote can be used, but will not mutate the instance.
      // for mutating quote/case operations, see the 'factories' function below
      const proxyHandler = {
        get(target, key) {
          key = String(key);
          if (key.startsWith(`case`) && key.slice(4) in casing) {
            return casing[key.slice(4)];
          }
          if (key.startsWith(`quot`) && key.slice(4) in quoting) {
            return quoting[key.slice(4)];
          }
          if (key in target) {
            return target[key];
          }
          if (key in target.value && canMutate(key, target.value[key])) {
            
            return (...args) => {
              return target.is(target.value[key](...args));
            }
          }
          if (target.value[key] && canMutate(key, target.value[key])) {
            return target.is(target.value[key]);
          }
          if (target.value[key] && !canMutate(key, target.value[key])) {
            return target.value[key];
          }
        }
      };
      
      function proxify(obj) { return new Proxy(obj, proxyHandler); }
      const me = proxify(strObj);
      const [casing, quoting] = factories(me);
      return me;
    }
  }
}



// enclosed helpers

// all String methods not returning a string are treated as non mutable instance methods
// e.g. [instance].split(...) or [instance].indexOf(...)
function allNonStringReturns() {
  const checkType = key => typeof `abc`?.[key]();
  return Object.entries(Object.getOwnPropertyDescriptors(String.prototype))
    .map( ([key, v]) => [key, v.value instanceof Function && checkType(key) || `zip`])
    .filter( ([, type]) => type !== `string` )
    .map( ([key,]) => key );
}

function canMutate(key, obj) {
  return obj instanceof Function && !nonMutables.find(v => v === key);
}

// process tagged templates if applicable
function resolveTemplateString(str, ...args) {
  return str.raw ?  String.raw({ raw: str }, ...args) : str;
}

// mutating casing and quoting getters
// [instance].case[casing method] or [instance].quot[quoting method]
// e.g. [instance].caseFirstup or [instance].quotSingle
function factories(thatsMe) {
  const casing = {
    get Up() { thatsMe.is(thatsMe.value.case.upper); return thatsMe; },
    get Low() { return thatsMe.is(thatsMe.value.case.lower) },
    get WordsFirstup() { return thatsMe.is(thatsMe.value.case.wordsFirstUC); },
    get Firstup() { return thatsMe.is(thatsMe.value.case.firstUC); },
    get Camel() {  return thatsMe.is(thatsMe.value.case.camel); },
    get Dashed() { return thatsMe.is(thatsMe.value.case.dashed); },
  };
  const quoting = {
    get Double() { return thatsMe.is(thatsMe.value.quote.double); },
    get Single() { return thatsMe.is(thatsMe.value.quote.single); },
    get Backtick() { return thatsMe.is(thatsMe.value.quote.backtick); },
  };
  return [casing, quoting];
}


