export default XStringFactory();

function XStringFactory() {
  const nativeOverrides = [
    "concat", "padEnd", "padStart", "repeat", "replace", "replaceAll",
    "slice", "toLocaleLowerCase", "toLocaleUpperCase", "toLowerCase",
    "toUpperCase", "toWellFormed", "trim", "trimEnd", "trimLeft",
    "trimRight", "trimStart", "substring", ]
    .reduce( (acc, val) => ({...acc, [val]: str => (...args) =>
        proxify(str[val](...args))}), {});
  const interpolator = interpolateFactory();
  const interpolate = str => (...tokens) => proxify`${interpolator(str, ...tokens)}`;
  const ucFirst = ([first, ...theRest]) => `${first.toUpperCase()}${theRest.join(``)}`;
  const toDashedNotation = str2Convert =>
    str2Convert.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`).replace(/^-|-$/, ``);
  const wordsFirstUp = str => str.split(` `).map(s => s.replace(/[a-z]/i, a => ucFirst(a))).join(` `);
  const toCamelcase = str2Convert => str2Convert.toLowerCase()
    .trim()
    .split(/[- ]/)
    .map( (str, i) => i && `${ucFirst(str)}` || str )
    .join(``);
  const toTag = str => (tag, props) => {
    const propsStr = props && Object.entries(props).reduce( (acc, [k, v]) => {
      return [...acc, `${k}="${v}"`];
    }, []).join(``) || ``;
    return proxify`<${tag} ${propsStr}>${str}</${tag}>`; };
  const truncate = str => ( {at, html = false, wordBoundary = false} = {} ) => {
    if (str.length <= at) { return proxify(str); }
    const subString = str.slice(0, at - 1);
    const endwith = html ? "&hellip;" : `...`;
    return proxify( ( wordBoundary
      ? subString.slice(0, subString.lastIndexOf(" "))
      : subString) + endwith );
  };
  const replaceWords = str => (initial, replacement) => {
    const cando = [initial, replacement].filter( v =>
      Object.getPrototypeOf( v ?? -1)?.constructor === String).length === 2;

    if (cando) {
      const re = RegExp(initial, `g`);
      return proxify(str.replace(re, replacement));
    }

    return proxify(str);
  };
  const find = str => ({terms = [], caseSensitive = false} = {}) => {
    const termsIsRE = terms.constructor === RegExp;
    terms = terms && !termsIsRE && !Array.isArray(terms) ? [terms] : terms;
    const termsOk = !termsIsRE && !terms.find(t => t.constructor !== String);

    if (!termsIsRE && (!termsOk || !terms.length)) {
      return {hits: `n/a`, result: `please provide valid terms`};
    }

    const xCase = termsIsRE && `${terms.flags ?? ``}` || (!caseSensitive ? `` : `i`);
    const re = RegExp(termsIsRE ? terms : terms.join(`|`), `g${xCase}`);
    let result = [...str.matchAll(re)];
    const hits = result.length;

    result = hits > 0
      ? result.reduce( (acc, v) =>
        ({...acc, ...{ [v[0]]: { at: ( acc[v[0]]?.at || []).concat(v.index) } } } ),{})
      : {};

    return { searched4: termsIsRE ? terms.toString() : terms.join(`, `), hits, result };
  };
  const escHTML = str => proxify(str.replace(/</g, `&lt;`));
  const compressHTML = str =>
    proxify(str.replace(/[\n\r]/g, ``)
      .replace(/\s{2,}/g, ` `)
      .replace(/(>\s+<)/g, `><`)
      .replace(/>\s+(\w)/g, (_, b) => `>${b}`)
      .replace(/(\w)\s+</g, (_, b) => `${b}<`)
      .replace(/ +>/g, `>`)
      .replace(/^\s+|\s+$/, ``));
  const insert = str => (str2Insert, at = 0) => {
    return proxify(`${str.slice(0, at > 0 ? at : at)}${str2Insert}${str.slice(at)}`);
  };
  const casingFactory = str => ({
    get lower() { return proxify(str.toLowerCase()); },
    get upper() { return proxify(str.toUpperCase()); },
    get camel() { return proxify`${toCamelcase(str)}`; },
    get wordFirstUC() { return proxify`${wordsFirstUp(str)}`; },
    get dashed() { return proxify`${toDashedNotation(str)}`; },
    get firstUC() { return proxify(ucFirst(str)); },
  });
  const value = str => str.valueOf();

  let proxiedGetters = {
    ...addDefaults({
      isProxied: () => true,
      wordsFirstUC: str => casingFactory(str).wordFirstUC,
      toCamelCase: str => casingFactory(str).camel,
      toDashedNotation: str => casingFactory(str).dashed,
      ucFirst: str => casingFactory(str).firstUC,
      append: str => str2Append => proxify(str.concat(str2Append)),
      lower: str => casingFactory(str).lower,
      upper: str => casingFactory(str).upper,
      interpolate,
      case: casingFactory,
      value,
      insert,
      format: interpolate,
      toTag,
      truncate,
      replaceWords,
      escHTML,
      compressHTML,
      find,
    }),
    ...nativeOverrides
  };

  proxiedGetters.addFN = () => (name, fn) =>
    proxiedGetters[name] = str => (...args) => proxify(fn(str, ...args));

  proxiedGetters.addProp = () => (name, fn) =>
    proxiedGetters[name] = str => proxify(fn(str));

  const proxy = {
    get: ( target, key ) => {
      // native String methods overrides and extension methods
      // Note: 'object' test is when a key is a symbol (not likely, but possible)
      if (proxiedGetters[key] && !/valueof|tostring|object/i.test(key)) {
        return proxiedGetters[key]?.(target);
      }

      // native string methods that don't return a string
      // Note: not chainable
      if (target[key]) {
        return target[key] instanceof Function ? target[key].bind(target) : target[key];
      }
    },
  };

  function resolveTemplateString(str, ...args) {
    return new String(args.length
      ? str.reduce( (acc, v, i) => acc.concat(`${v}${args[i] ?? ``}`), ``)
      : str);
  }

  // Can be used either as tagged template function or a regular function receiving a string
  // So, best of both worlds ...
  function proxify(someStr, ...args) {
    let str = resolveTemplateString(someStr, ...args);

    return new Proxy(str, proxy);
  }

  return proxify;

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

  function interpolateFactory() {
    const {isStringOrNumber, isObject, invalidate, replacement, replacer, replace} = {
      isStringOrNumber: v => [String, Number].find(type => Object.getPrototypeOf( v ?? ``)?.constructor === type),
      isObject: v => Object.getPrototypeOf( v ?? ``)?.constructor === Object,
      invalidate: (defaultReplacer, key) => defaultReplacer ?? `{${key}}`,
      replacement: (key, t, defaultReplacer) =>
        !isStringOrNumber(t[key]) || (!defaultReplacer && `${t[key]}`.trim() === ``)
          ? invalidate(defaultReplacer, key) : t[key] ?? invalidate(defaultReplacer, key),
      replacer: (token, defaultReplacer) => (...args) =>
        replacement( args.find(a => a.key).key ?? `_`, token, defaultReplacer ),
      replace: (str, token, defaultReplacer) =>
        str.replace( /\{(?<key>[a-z_\d]+)}/gim, replacer(token, defaultReplacer) ),
    };
    const interpolate = (str, defaultReplacer = undefined, ...tokens) => tokens.flat()
      .reduce( (acc, token) => acc.concat(!isObject(token) ? `` : replace(str, token, defaultReplacer )), ``);

    return (str, ...tokens) => interpolate(...[str,undefined,...tokens])
  }
}