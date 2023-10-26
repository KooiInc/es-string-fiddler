import xtensions from "./Resource/Extensions.js";
import sanitizerDefault from "./Resource/SanitizerFactory.js";
import helperLib from "./Resource/ProxyHelpers.js";
import createDefaultStringBuilder from "./Resource/StringbuilderFactory.js";

const $SRaw = XStringFactory({sanitize: false, sanitizer: undefined});
const $S = XStringFactory();
const stringBuilderFactory = createDefaultStringBuilder($S);

export { $S as default, $SRaw as $SNoHTML, XStringFactory as $SFactory, stringBuilderFactory };

function XStringFactory({sanitize = true, silentFail = false, sanitizer = sanitizerDefault} = {}) {
  const stringExtensions = xtensions(proxify, resolveTemplateString, {sanitize, sanitizer, silentFail} );
  const proxyHelpers = helperLib(proxify, sanitizer, stringExtensions, resolveTemplateString);
  const proxiedGetters = proxyHelpers.initAllExtensionMethods(stringExtensions);
  initStaticProxifierMethods().forEach( ([key, descriptor]) => Object.defineProperty(proxify, key, descriptor) );
  const proxy = proxyHelpers.initProxy(proxiedGetters);
  
  return proxify;
  
  function initStaticProxifierMethods() {
    const fromHelpers = Object.entries(
      Object.getOwnPropertyDescriptors(proxyHelpers.initStaticGetters(proxiedGetters)));
    return Object.entries(Object.getOwnPropertyDescriptors({
      get rawHTML() { return (str, ...args) => $SRaw(str, ...args); },
      set sanitize(value) { sanitize = value; },
      get sanitize() { return sanitize; },
    })).concat(fromHelpers);
  }
  
  function proxify(someStr, ...args) {
    let str = proxyHelpers.byContract(someStr, ...args);
    const shouldSanitize = sanitize && sanitizer && /<.+?>/gi.test(str);
    str = shouldSanitize ? proxyHelpers.sanitizeHTML(str, true) : str;
    
    return new Proxy(new String(str), proxy);
  }
  
  function resolveTemplateString(str, ...args) {
    return str.raw ?  String.raw({ raw: str }, ...args) : str;
  }
}