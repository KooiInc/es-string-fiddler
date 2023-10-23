import xtensions from "./Resource/Extensions.js";
import defaultHTMLSanitizer from "./Resource/SanitizerFactory.js";
import { randomString, uuid4 } from "./Resource/RandomStringFactory.js"
import proxyHelpers from "./Resource/ProxyHelpers.js";

const $SRaw = XStringFactory({sanitize: false, sanitizer: undefined});
const $S = XStringFactory();

export {$S as default, $SRaw as $SNoHTML, XStringFactory as $SFactory};

function XStringFactory({sanitize = true, silentFail = false, sanitizer = defaultHTMLSanitizer} = {}) {
  /* region extensions */
  const stringExtensions = xtensions(proxify, resolveTemplateString, {sanitize, sanitizer, silentFail} );
  const proxiedGetters = {
    ...stringExtensions,
    ...addDefaults(),
    ...initNativeOverrides()
  };
  /* endregion extensions */

  /* region core proxifier */
  const { regExp, sanitizeHTML, createRegExp, initProxy, byContract} =
    proxyHelpers(proxify, sanitizer, stringExtensions, resolveTemplateString);
  const proxy = initProxy(proxiedGetters);
  Object.entries(Object.getOwnPropertyDescriptors(initStaticGetters()))
    .forEach( ([key, descriptor]) => { Object.defineProperty(proxify, key, descriptor); } );

  function proxify(someStr, ...args) {
    let str = byContract(someStr, ...args);
    const shouldSanitize = sanitize && sanitizer && /<.+?>/gi.test(str);
    str = shouldSanitize ? sanitizeHTML(str, true) : str;
    
    return new Proxy(new String(str), proxy);
  }

  return proxify;
  /* endregion core proxifier */
  
  /* region local helpers */
  function extendWith(name, fn, isMethod = false) {
    proxiedGetters[name] = str => isMethod
      ? (...args) => proxify(fn(str, ...args))
      : proxify(fn(str));
  }
  
  function resolveTemplateString(str, ...args) {
    return str.raw ?  String.raw({ raw: str }, ...args) : str;
  }
  
  function addDefaults(extensions) {
    const clone = (str, ...args) => proxify(resolveTemplateString(str, ...args));
    const cloneTo = () => (nwValue, ...args) => clone(nwValue, ...args);
    const defaultXs = {
      clone,
      cloneTo,
      set: cloneTo,
    };
    return {...defaultXs, ...extensions};
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
            // enable method as tagged template (only applicable for concat, actually)
            if (args.length && args[0].raw) {
              args = [resolveTemplateString(args[0], args.slice(1))];
            }

            return proxify( str[val](...args) )
          }
        };
      }, {} );
  }
  
  function initStaticGetters() {
    return {
      extendWith,
      regExp: createRegExp,
      randomString: str => proxify(randomString(str)),
      rawHTML: (str, ...args) => $SRaw(str, ...args),
      get currentMethods() {
        return Object.getOwnPropertyNames(proxiedGetters)
          .sort( (a, b) => a.localeCompare(b)); },
      get uuid4() { return proxify(uuid4()); },
      set sanitize(value) { sanitize = value; },
    };
  }
  
  /* endregion local helpers */
}