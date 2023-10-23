export default Helpers;

function Helpers(proxify, sanitizer, stringExtensions, resolveTemplateString) {
  return {
    regExp,
    sanitizeHTML,
    createRegExp,
    initProxy,
    byContract,
  };
  
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
      ? `Sanitatition failed (likely unsafe html) for '${
        stringExtensions.truncate(str => stringExtensions.escHTML(str))({at: 40})}'`
      : proxify(str);
  }
  
  function createRegExp(str, ...args) {
    try {
      return regExp(str, ...args);
    } catch (err) {
      return `Error creating Regular Expression from "${str}" (modifiers: ${
        args.join(``).trim() || `none`})\n${err.message}`;
    }
  }
  
  function isStringOrArrayOfStrings(str) {
    return str?.isProxied || str?.constructor === String || str?.raw;
  }
  
  function byContract(str, ...args) {
    const isMet = isStringOrArrayOfStrings(str);
    if (!isMet) { console.info(`✘ String contract not met: input [${String(str)?.slice(0, 15)}] is not a (template) string`)};
    return !isMet ? `` : resolveTemplateString(str, ...args);
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