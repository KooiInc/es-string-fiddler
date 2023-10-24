import { randomString, uuid4 } from "./RandomStringFactory.js";

export default Helpers;

function Helpers(proxify, sanitizer, stringExtensions, resolveTemplateString) {
  const {truncate, escHTML} = stringExtensions;
  
  return {
    sanitizeHTML,
    initProxy,
    byContract,
    initNativeOverrides,
    addDefaults,
    initStaticGetters,
    extendWithFactory,
    initAllExtensionMethods,
  };
  
  function initAllExtensionMethods() {
    return {
      ...stringExtensions,
      ...addDefaults(),
      ...initNativeOverrides()
    };
  }
  
  function regExp(regexStr, ...args) {
    const flags = args.length && Array.isArray(args.slice(-1)) ? args.pop().join(``) : ``;
    
    return new RegExp(
      (args.length &&
        regexStr.raw.reduce( (a, v, i ) => a.concat(args[i-1] || ``).concat(v), ``) ||
        regexStr.raw.join(``))
        .split(`\n`)
        .map( line => line.replace(/\s|\/\/.*$/g, ``).trim().replace(/(@s!)/g, ` `) )
        .join(``), flags);
  }
  
  function sanitizeHTML(str, omitProxy = false) {
    const sane = sanitizer(
      Object.assign(document.createElement(`div`), { innerHTML: str } )
    );
    
    if (sane.innerHTML.trim().length) {
      return omitProxy ? sane.innerHTML : proxify(sane.innerHTML);
    }
    
    return omitProxy
      ? `Sanitatition failed (likely unsafe html) for '${truncate(escHTML(str))({at: 40})}`
      : proxify(str);
  }
  
  function createRegExp(str, ...args) {
    try {
      return regExp(str, ...args);
    } catch (err) {
      return `Error creating Regular Expression from string "${resolveTemplateString(str, ...args)}" (modifiers: ${
        args.join(``).trim() || `none`})\nRegExp error message: ${err.message}`;
    }
  }
  
  function isStringOrTemplate(str) {
    return str?.isProxied || str?.constructor === String || str?.raw;
  }
  
  function byContract(str, ...args) {
    const isMet = isStringOrTemplate(str);
    if (!isMet) { console.info(`✘ String contract not met: input [${String(str)?.slice(0, 15)}] is not a (template) string`) };
    return !isMet ? `` : resolveTemplateString(str, ...args);
  }
  
  function addDefaults() {
    const clone = (str, ...args) => proxify(resolveTemplateString(str, ...args));
    const cloneTo = () => (nwValue, ...args) => clone(nwValue, ...args);
    const defaultXs = {
      clone,
      cloneTo,
      set: cloneTo,
    };
    return defaultXs;
  }
  
  function extendWithFactory(proxiedGetters) {
    return function extendWith(name, fn, isMethod = false) {
      proxiedGetters[name] = str => isMethod
        ? (...args) => proxify(fn(str, ...args))
        : proxify(fn(str));
    };
  }
  
  function initStaticGetters(proxiedGetters) {
    return {
      extendWith: extendWithFactory(proxiedGetters),
      regExp: createRegExp,
      randomString: str => proxify(randomString(str)),
      get currentMethods() {
        return Object.getOwnPropertyNames(proxiedGetters)
          .sort( (a, b) => a.localeCompare(b)); },
      get uuid4() { return proxify(uuid4()); },
    };
  }
  
  function initNativeOverrides() {
    return [
      "concat", "padEnd", "padStart", "repeat", "replace", "replaceAll",
      "slice", "toLocaleLowerCase", "toLocaleUpperCase", "toLowerCase",
      "toUpperCase", "toWellFormed", "trim", "trimEnd", "trimLeft",
      "trimRight", "trimStart", "substring"]
      .reduce( (acc, val) => {
        return {
          ...acc,
          [val]: str => (...args) => {
            if (args.length && args[0].raw) {
              args = [resolveTemplateString(args[0], args.slice(1))];
            }
            
            return proxify( str[val](...args) )
          }
        };
      }, {} );
  }
  
  function initProxy(proxiedGetters) {
    return {
      get(target, key) {
        if (proxiedGetters[key] && !/object|tostring|valueof/i.test(key)) {
          return proxiedGetters[key] instanceof Function ? proxiedGetters[key](target) : proxiedGetters[key];
        }
        
        if (target[key]) {
          return target[key] instanceof Function ? target[key].bind(target) : target[key];
        }
      },
      has(target, key) {
        return key in proxiedGetters || key in target;
      },
      ownKeys(target) {
        return [...Reflect.ownKeys(proxiedGetters), ...Reflect.ownKeys(target)];
      },
      getOwnPropertyDescriptor(target, prop) {
        return Object.getOwnPropertyDescriptor(proxiedGetters, prop) ?? Object.getOwnPropertyDescriptor(target, prop);
      },
    };
  }
}