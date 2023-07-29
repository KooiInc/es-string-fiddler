export default XStringFactory();

function XStringFactory() {
  const sanitizeTag = sanitizeHTMLFactory();
  const nativeOverrides = [
    "concat", "padEnd", "padStart", "repeat", "replace", "replaceAll",
    "slice", "toLocaleLowerCase", "toLocaleUpperCase", "toLowerCase",
    "toUpperCase", "toWellFormed", "trim", "trimEnd", "trimLeft",
    "trimRight", "trimStart", "substring", ]
    .reduce( (acc, val) => {
      return {
        ...acc,
        [val]: str => (...args) => {
          // enable concat tagged template function
          if (val === `concat` && args.length && args[0].raw) {
            args = [resolveTemplateString(args[0], args.slice(1))];
          }

          return proxify( str[val](...args) )
        }
      };
    }, {} );
  const interpolator = interpolateFactory();
  const format = str => (...tokens) => proxify`${interpolator(str, ...tokens)}`;
  const ucFirst = ([first, ...theRest]) => `${first.toUpperCase()}${theRest.join(``)}`;
  const toDashedNotation = str2Convert =>
    str2Convert.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`).replace(/^-|-$/, ``);
  const wordsFirstUp = str => str.split(` `).map(s => s.replace(/[a-z]/i, a => ucFirst(a))).join(` `);
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
  const escHTML = str => proxify(str.replace(/</g, `&lt;`));
  const toTag = str => (tag, props) => {
    const propsStr = props && Object.entries(props).reduce( (acc, [k, v]) => {
      return [...acc, `${k}="${v}"`];
    }, []).join(``) || ``;
    const elemTest = sanitizeTag(
      Object.assign(document.createElement(`div`),
        { innerHTML: `<${tag} ${propsStr}>${str}</${tag}>` } )
    );

    if (elemTest.firstChild) { return proxify(elemTest.firstChild.outerHTML); }

    const invalidTag = truncate(`<${tag} ${propsStr}>${str}</${tag}>`)({at: 40, html: true});

    return proxify`<span style="color:red">${escHTML(invalidTag)} is not valid (see console)</span>`;
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
    get wordsFirstUC() { return proxify`${wordsFirstUp(str)}`; },
    get dashed() { return proxify`${toDashedNotation(str)}`; },
    get firstUC() { return proxify(ucFirst(str)); },
  });
  const quoteFactory = str => ({
    get single() { return proxify(`'${str}'`)},
    get double() { return proxify(`"${str}"`)},
    get backtick() { return proxify(`\`${str}\``)},
  });
  const value = str => str.valueOf();
  const createRegExp = str => (str, ...args) => {
    try {
      return regExp(str, ...args);
    } catch (err) {
      return `Can't do this: ${err.message}`;
    }
  }

  const proxiedGetters = {
    ...addDefaults({
      isProxied: true,
      wordsFirstUC: str => casingFactory(str).wordsFirstUC,
      toCamelCase: str => casingFactory(str).camel,
      toDashedNotation: str => casingFactory(str).dashed,
      ucFirst: str => casingFactory(str).firstUC,
      append: str => str2Append => proxify(`${str}${str2Append}`),
      lower: str => casingFactory(str).lower,
      upper: str => casingFactory(str).upper,
      createRegExp,
      case: casingFactory,
      quote: quoteFactory,
      value,
      insert,
      format,
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

  proxiedGetters.addMethod = proxiedGetters.addFN;

  proxiedGetters.addProp = () => (name, fn) =>
    proxiedGetters[name] = str => proxify(fn(str));

  proxiedGetters.methods = Object.getOwnPropertyNames(proxiedGetters);

  const proxy = {
    get: ( target, key ) => {
      // native String methods overrides and extension methods
      // Note: 'object' test is when a key is a symbol (not likely, but possible)
      if (proxiedGetters[key] && !/valueof|tostring|object/i.test(key)) {
        return proxiedGetters[key] instanceof Function ? proxiedGetters[key](target) : proxiedGetters[key];
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
      ? str.reduce( (acc, v, i) => acc.concat(`${v}${args[i] ?? ``}`), ``).trim().replace(/^,|,$/, ``)
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

function sanitizeHTMLFactory() {
  const cleanupTagInfo = HTMLTagsFactory();
  const ATTRS = getAttrs();
  const attrRegExpStore = {
    data: /data-[\-\w.\p{L}]/ui, // data-* minimal 1 character after dash
    validURL: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    whiteSpace: /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g,
    notAllowedValues: /javascript|injected|noreferrer|alert|DataURL/gi
  };

  return sanitize;

  function sanitize(el2Clean) {
    const elCreationInfo = {
      rawHTML: el2Clean.outerHTML,
      removed: { },
    };

    if (el2Clean instanceof HTMLElement) {
      [...el2Clean.childNodes].forEach(child => {
        if (child?.attributes) {
          const attrStore = child instanceof SVGElement ? ATTRS.svg : ATTRS.html;

          [...(child ?? {attributes: []}).attributes]
            .forEach(attr => {
              const name = attr.name.trim().toLowerCase();
              const value = attr.value.trim().toLowerCase().replace(attrRegExpStore.whiteSpace, ``);
              const evilValue = name === "href"
                ? !attrRegExpStore.validURL.test(value) : attrRegExpStore.notAllowedValues.test(value);
              const evilAttrib = name.startsWith(`data`) ? !attrRegExpStore.data.test(name) : !!attrStore[name];

              if (evilValue || evilAttrib) {
                let val = attr.value || `none`;
                val += val.length === 60 ? `...` : ``;
                elCreationInfo.removed[`${attr.name}`] = `attribute/property (-value) not allowed, removed. Value: ${
                  val}`;
                child.removeAttribute(attr.name);
              }
            });
        }
        const allowed = cleanupTagInfo.isAllowed(child);
        if (!allowed) {
          const tag = (child?.outerHTML || child?.textContent).trim();
          let tagValue = tag ?? `EMPTY`;
          tagValue += tagValue.length === 60 ? `...` : ``;
          elCreationInfo.removed[`<${child.nodeName?.toLowerCase()}>`] = `not allowed, not rendered. Value: ${
            tagValue}`;
          child.remove();
        }
      });
    }

    if (Object.keys(elCreationInfo.removed).length) {
      Object.entries(elCreationInfo.removed).forEach( ([k, v]) => console.error(`${k}: ${v}`));
    }

    return el2Clean;
  };

  function HTMLTagsFactory() {
    let lenient = false;
    const allTags = getPermissions();
    const allowUnknownHtmlTags = {
      on: () => lenient = true,
      off: () => lenient = false,
    };
    return {
      tagsRaw: allTags,
      allowUnknownHtmlTags,
      isAllowed(elem) {
        if (lenient) { return true; }
        const nodeName = elem?.nodeName.toLowerCase() || `none`;
        return nodeName === `#text` || !!allTags[nodeName];
      },
      allowTag: tag2Allow => allTags[tag2Allow.toLowerCase()] = true,
      prohibitTag: tag2Prohibit => allTags[tag2Prohibit.toLowerCase()] = false,
    };
  }

  function getAttrs() {
    return {
      html: `accept,action,align,alt,autocapitalize,autocomplete,autopictureinpicture,autoplay,background,bgcolor,border,capture,cellpadding,cellspacing,checked,cite,class,clear,contenteditable,color,cols,colspan,controls,controlslist,coords,crossorigin,datetime,decoding,default,dir,disabled,disablepictureinpicture,disableremoteplayback,download,draggable,enctype,enterkeyhint,face,for,headers,height,hidden,high,href,hreflang,id,inputmode,integrity,ismap,kind,label,lang,list,loading,loop,low,max,maxlength,media,method,min,minlength,multiple,muted,name,nonce,noshade,novalidate,nowrap,open,optimum,pattern,placeholder,playsinline,poster,preload,pubdate,radiogroup,readonly,rel,required,rev,reversed,role,rows,rowspan,spellcheck,scope,selected,shape,size,sizes,span,srclang,start,src,srcset,step,style,summary,tabindex,target,title,translate,type,usemap,valign,value,width,xmlns,slot`
        .split(`,`),
      svg:`accent-height,accumulate,additive,alignment-baseline,ascent,attributename,attributetype,azimuth,basefrequency,baseline-shift,begin,bias,by,class,clip,clippathunits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,cx,cy,d,dx,dy,diffuseconstant,direction,display,divisor,dur,edgemode,elevation,end,fill,fill-opacity,fill-rule,filter,filterunits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,fx,fy,g1,g2,glyph-name,glyphref,gradientunits,gradienttransform,height,href,id,image-rendering,in,in2,k,k1,k2,k3,k4,kerning,keypoints,keysplines,keytimes,lang,lengthadjust,letter-spacing,kernelmatrix,kernelunitlength,lighting-color,local,marker-end,marker-mid,marker-start,markerheight,markerunits,markerwidth,maskcontentunits,maskunits,max,mask,media,method,mode,min,name,numoctaves,offset,operator,opacity,order,orient,orientation,origin,overflow,paint-order,path,pathlength,patterncontentunits,patterntransform,patternunits,points,preservealpha,preserveaspectratio,primitiveunits,r,rx,ry,radius,refx,refy,repeatcount,repeatdur,restart,result,rotate,scale,seed,shape-rendering,specularconstant,specularexponent,spreadmethod,startoffset,stddeviation,stitchtiles,stop-color,stop-opacity,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke,stroke-width,style,surfacescale,systemlanguage,tabindex,targetx,targety,transform,text-anchor,text-decoration,text-rendering,textlength,type,u1,u2,unicode,values,viewbox,visibility,version,vert-adv-y,vert-origin-x,vert-origin-y,width,word-spacing,wrap,writing-mode,xchannelselector,ychannelselector,x,x1,x2,xmlns,y,y1,y2,z,zoomandpan`
        .split(`,`),
    };
  }

  function getPermissions() {
    return {a:true,area:true,audio:false,br:true,base:true,body:true,button:true,canvas:true,dl:true,data:true,datalist:true,div:true,em:true, embed:false,fieldset:true,font:true,footer:true,form:false,hr:true,head:true,header:true,output:true,iframe:false,frameset:false,img:true,input:true,li:true,label:true,legend:true,link:true,map:true,mark:true,menu:true,media:true,meta:true,nav:true,meter:true,ol:true,object:false,optgroup:true,option:true,p:true,param:true,picture:true,pre:true,progress:false,quote:true,script:false,select:true,source:true,span:true,style:true,caption:true,td:true,col:true,table:true,tr:true,template:false,textarea:true,time:true,title:true,track:true,details:true,ul:true,video:true,del:true,ins:true,slot:true,blockquote:true,svg:true,dialog:true,summary:true,main:true,address:true,colgroup:true,tbody:true,tfoot:true,thead:true,th:true,dd:true,dt:true,figcaption:true,figure:true,i:true,b:true,code:true,h1:true,h2:true,h3:true,h4:true,abbr:true,bdo:true,dfn:true,kbd:true,q:true,rb:true,rp:true,rt:true,ruby:true,s:true,strike:true,samp:true,small:true,strong:true,sup:true,sub:true,u:true,var:true,wbr:true,nobr:true,tt:true,noscript:true};
  }
}