export default extensions;
import interpolate from "https://cdn.jsdelivr.net/gh/KooiInc/StringInterpolator@latest/Interpolate.module.min.js";

function extensions(proxify, resolveTemplateString, {sanitize, sanitizer, silentFail,} = {}) {
  const format = str => (...tokens) => proxify`${interpolate(str, ...tokens)}`;
  const ucFirst = ([first, ...theRest]) => `${first.toUpperCase()}${theRest.join(``)}`;
  const toDashedNotation = str2Convert =>
    str2Convert.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`).replace(/^-|-$/, ``);
  const wordsFirstUp = str => [...str.toLowerCase()].slice(1).reduce( (acc, v, i) =>
    acc + ( !/\p{L}|[-']/u.test(acc.at(-1)) ? v.toUpperCase() : v.toLowerCase() ),
    str[0].toUpperCase()
  );
  const toCamelcase = str2Convert => str2Convert.toLowerCase()
    .trim()
    .split(/[- ]/)
    .map( (str, i) => i && `${ucFirst(str)}` || str )
    .join(``);
  const truncate = str => ( {at, html = false, wordBoundary = false} = {} ) => {
    if (str.length <= at) { return proxify(str); }
    const subString = str.slice(0, at - 1);
    const endwith = html ? " &hellip;" : ` ...`;
    return proxify( ( wordBoundary
      ? subString.slice(0, subString.lastIndexOf(" "))
      : subString) + endwith );
  };
  const extract = str => (start, end) => str.slice(start || 0, end || str.length-1);
  const trimAll = str => keepLines =>
    proxify( keepLines
      ? str.trim().replace(/\n/g, `#!#`).replace(/\s{2,}/g, ` `).replace(/#!#/g, `\n`)
      : str.trim().replace(/\s{2,}/g, ` `));
  const escHTML = str => proxify(str.replace(/</g, `&lt;`));
  const sanitizeHTML = str => {
    const elemTest = sanitizer(
      Object.assign(document.createElement(`div`),
        { innerHTML: String(str) } )
    );
    
    if (elemTest.innerHTML.trim().length) {
      return proxify(elemTest.innerHTML);
    }
    
    const invalidHTML = truncate(str)({at: 40, html: true});
    
    return silentFail ?
      proxify(escHTML(str)) :
      proxify`${escHTML(invalidHTML)} is not valid (see console)`;
  };
  const toTag = str => (tag, props) => {
    if (!tag) { return proxify(string); }
    const doSanitize = props?.dontSanitize ?? true;
    delete props?.dontSanitize;
    
    const propsStr = props && Object.entries(props).reduce( (acc, [k, v]) => {
      return [...acc, `${k}="${v.replace(/"/g, `'`)}"`];
    }, []).join(` `) || ``;
    const tagStr = `<${tag} ${propsStr}>${str}</${tag}>`;
    
    if (!sanitize || !doSanitize) {
      return proxify(tagStr.replace(/<?\s+>/g, `>`));
    }
    
    return sanitizeHTML(tagStr);
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
      return {hits: `n/a`, result: `please provide valid search terms`};
    }
    
    const xCase = termsIsRE && `${terms.flags ?? ``}` || (!caseSensitive ? `` : `i`);
    const re = RegExp(termsIsRE ? terms : terms.join(`|`), `g${xCase}`);
    let result = [...str.matchAll(re)];
    const hits = result.length;
    const foundAny = hits > 0;
    
    result = foundAny
      ? result.reduce( (acc, v) =>
        ({...acc, ...{ [v[0]]: { at: ( acc[v[0]]?.at || []).concat(v.index) } } } ),{})
      : {};
    return { searched4: termsIsRE ? terms.toString() : terms.join(`, `), foundAny, hits, result };
  };
  // SEE https://youtu.be/99Zacm7SsWQ?t=2101
  const indexOf = str => (findMe, fromIndex) => {
    const index = str.indexOf(findMe, fromIndex);
    return index < 0 ? undefined : index;
  };
  const lastIndexOf = str => (findMe, beforeIndex) => {
    const index = str.lastIndexOf(findMe, beforeIndex);
    return index < 0 ? undefined : index;
  };
  const compressHTML = str => proxify(str.replace(/[\n\r]/g, ``)
    .replace(/\s{2,}/g, ` `)
    .replace(/(>\s+<)/g, `><`)
    .replace(/>\s+(\w)/g, (_, b) => `>${b}`)
    .replace(/(\w)\s+</g, (_, b) => `${b}<`)
    .replace(/ +>/g, `>`)
    .replace(/^\s+|\s+$/, ``));
  const insert = str => (str2Insert, at = 0) => proxify(`${str.slice(0, at > 0 ? at : at)}${str2Insert}${str.slice(at)}`);
  const append = str => (str2Append, ...args) => proxify(`${str}${resolveTemplateString(str2Append, ...args)}`);
  const removeCustom = str => ({start, end}) => proxify(str.trim().replace(RegExp(`^${start}|${end}$`, `g`), ``));
  const casingFactory = str => ({
    get lower() { return proxify(str.toLowerCase()); },
    get upper() { return proxify(str.toUpperCase()); },
    get camel() { return proxify`${toCamelcase(str)}`; },
    get wordsFirstUC() { return proxify`${wordsFirstUp(str)}`; },
    get dashed() { return proxify`${toDashedNotation(str)}`; },
    get firstUC() { return proxify(ucFirst(str)); },
  });
  const quoteFactory = str => ({
    get single() { return proxify(`'${str}'`); },
    get double() { return proxify(`"${str}"`); },
    get backtick() { return proxify(`\`${str}\``); },
    get curlyDouble() { return proxify(`“${str}”`); },
    get curlyDoubleUni() { return proxify(`“${str}“`); },
    get curlySingle() { return proxify(`❛${str}❜`); },
    get curlySingleUni() { return proxify(`❛${str}❛`); },
    get pointyDouble() { return proxify(`«${str}»`); },
    get pointySingle() { return proxify(`‹${str}›`); },
    get curlyLHDouble() { return proxify(`„${str}”`); },
    get curlyLHSingle() { return proxify(`‚${str}’`); },
    get curlyLHDoubleUni() { return proxify(`„${str}“`); },
    get curlyLHSingleUni() { return proxify(`‚${str}❛`); },
    get remove() { return proxify(`${str.trim().replace(/^[^a-z0-9]|[^a-z0-9]$/gi, ``)}`); },
  });
  
  return {
    isProxied: true,
    wordsFirstUC: str => casingFactory(str).wordsFirstUC,
    capitalizeWords: str => casingFactory(str).wordsFirstUC,
    toCamelCase: str => casingFactory(str).camel,
    toDashedNotation: str => casingFactory(str).dashed,
    ucFirst: str => casingFactory(str).firstUC,
    capitalizeFirst: str => casingFactory(str).firstUC,
    lower: str => casingFactory(str).lower,
    upper: str => casingFactory(str).upper,
    value: str => `${str}`,
    sanitizeHTML,
    extract,
    append,
    insert,
    prepend: insert,
    case: casingFactory,
    quote: quoteFactory,
    format,
    toTag,
    truncate,
    replaceWords,
    escHTML,
    compressHTML,
    trimAll,
    find,
    indexOf,
    lastIndexOf,
  }
}