import {$, logFactory} from "https://cdn.jsdelivr.net/gh/KooiInc/SBHelpers@main/index.browser.min.js";
import $S from "../Bundle/index.esm.min.js";
window.$S = $S; // try things yourself in the console ...
demo();

function demo() {
  const { log } = logFactory();
  const toJSON = obj => `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
  setStyling();

  log(`!!<a target="_top" href="https://github.com/KooiInc/es-string-fiddler"><b>Back to repository</b></a>`);
  log(`!!<h2 id="inits">EcmaScript (ES) <code>String</code> manipulation using ES <code>Proxy</code></h2>`);

  const basic = $S``;
  const hi = basic.set(`hello`).ucFirst;
  const hi1 = hi.set`hithere and ${hi.toLowerCase()}`;
  const tokens = [{world: `you`}, {world: `world`}, {world: `galaxy`}, {world: `universe`}];
  basic.addProp(`rQuot`, str => { return `=&gt; ${$S(str).quote.double}`; });
  basic.addProp(`wrapESComments`, str => {
    str = str.replace(/(?<![https:|http:])\/\/.+/gm, a => `<span class="comment">${a}</span>`);
    return str; });
  log(`!!<b id="initiate">Initiate, assign some variables</b></h3>`);
  log( basic.set`!!<code class="codeBlock">import $S from "./StringFiddlerFactory.js";
// a basic empty string can be used as template
const basic = $S\`\`;
const hi = basic.set\`hello\`.ucFirst;
const hi1 = hi.set\`hithere and \${hi.case.lower}\`;
// tokens to use with .format
const tokens = [
  {world: \`you\`}, 
  {world: \`world\`}, 
  {world: \`galaxy\`}, 
  {world: \`universe\`}, ];</code>
  <div><b>Note</b>: you can call <code>$S</code> either as a tagged template function or as a normal function.
  <br><b>Note 2</b>: properties/methods (also native (String.prototype)) returning a string 
    can be <a target="_blank" href="https://www.tutorialspoint.com/method-chaining-in-javascript">chained</a>.
  <br><b>Note 3</b>: like regular ES-strings $S-strings are 
    <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Glossary/Immutable">immutable</a>
  </div`.wrapESComments );

  log(`!!<b>Initial values</b>`);
  log(`<code>basic</code> ${basic.rQuot}<br>
      <code>hi</code> ${hi.rQuot}<br>
      <code>hi1</code> ${hi1.rQuot}<br>
      <code>basic.isProxied</code> ${basic.isProxied}`);

  log(`!!<b id="manipulate">Manipulate strings</b></h3>`);
  log(`<code class="codeBlock">hi1
  .insert( $S\`there you have it &amp;hellip; \`
    .ucFirst
    .insert(\`"\`) )
  .append( \` and  also: that's folks"\`)
  .insert( $S\` IT \`
    .toTag( \`b\`, {style:\`color:blue;background:#eee\`,title:\`post hoc insertion\` })
    .toTag( \`i\`), -7 );</code> =&gt; ${
    hi1
      .insert( $S`there you have it &hellip; `
        .ucFirst
        .insert(`"`) )
      .append(` and also: that's folks"`)
      .insert($S` IT `
        .toTag(`b`, { style:`color:blue;background:#eee`, title: `post hoc insertion` })
        .toTag(`i`), -7)}`);
  const camelCased = $S`bla-bla and again bla`.toCamelCase;
  log(`<code>const camelCased = $S\`bla-bla and again bla\`.toCamelCase;</code><div>${
    camelCased.rQuot}</div>`);
  log(`<code>camelCased.toDashedNotation</code><div>${camelCased.toDashedNotation.rQuot}</div>`);
  log(`<code>$S(\`regular function call can do? - {yes}\`).format({yes: \`That's right\`}).ucFirst</code>
    <div>${$S(`regular function call can do? - {yes}`).format({yes: `That's right`}).ucFirst.rQuot}`);

  log(`<code>$S\`nice\`.ucFirst.toTag(\`b\`, {style: \`color: red;\`}).quote.backtick</code><div>=&gt; ${
    $S`nice`.ucFirst.toTag(`b`, {style: `color: red;`}).quote.backtick}</div>`);

  log(`<code>$S\`Hello world, o cruel world\`.replaceWords('world', 'universe')</code><div>${
    $S`Hello world, o cruel world`.replaceWords('world', 'universe').rQuot}`);
  const yada2 = $S`yada `.repeat(14).ucFirst;
  log(`<code>const yada2 = $S\`yada \`.repeat(14).ucFirst;</code><div>${yada2.trim().rQuot}</div>`,
      `<code>yada2.truncate({at: 38}).toTag(\`i\)</code><div>${
        yada2.truncate({at: 38}).toTag(`i`).rQuot}`);
  log(`<code>yada2.truncate({at: 38, html: true, wordBoundary: true}).toTag(\`b\)</code><div>${
    yada2.truncate({at: 38, html: true, wordBoundary: true}).toTag(`b`).rQuot}`);

  log(`!!<b id="format">Format with tokens</b> 
  (see <a target="_blank" href="https://github.com/KooiInc/StringInterpolator">Github</a>)</div>`);
  const escaped4Log = $S`$S\`<li>\${hi\} {world}</li>\\n\``.escHTML;
  log(`<div><code>${escaped4Log}.format(...tokens).toTag(\`ul\`, {class: \`sub\`})</code></div>
    ${$S`<li> ${hi} {world} </li>\n`.format(...tokens).toTag(`ul`, {class: `sub`})}`);

  log(`!!<b id="escHtml">Html (escape/compress)</b>`);
  log(`<code>$S(document.querySelector('ul.sub').outerHTML).escHTML.quote.double</code> =&gt;
  <pre class="ws">${$S($(`ul.sub`).HTML.get(1)).escHTML.quote.double}</pre>`,
  `<code>$S(document.querySelector('ul.sub').outerHTML).compressHTML.escHTML.quote.double</code> =&gt;
    <pre class="ws">${$S($(`ul.sub`).HTML.get(1)).compressHTML.escHTML.quote.double}</pre>`);

  log(`!!<b id="chainEtc">Use/chain/combine native/custom methods`, `<code>yada2.isWellFormed()</code> =&gt; ${yada2.isWellFormed()}</b>`);
  log(`<code>yada2.trim().slice(-4).case.upper.toTag(\`i\`, {style: \`color: orange\`})</code> ${
    yada2.trim().slice(-4).case.upper.toTag( `i`, { style: `color: orange` }).rQuot }`);
  log(`<code>yada2.trim().toUpperCase().case.camel.toTag(\`div\`, {style:\`text-indent:1rem\`})</code> ${
      yada2.trim().toUpperCase().case.camel.rQuot.toTag(`div`, {style:`text-indent:1rem`})}`)

  log(`!!<b id="addMethOrProp">Create extra methods and properties</b>
  <div><b>Note</b>: make sure the added method or property lambda returns the resulting string</div>`);
  basic.addProp(`log`, str => { log(str); return str; })
  log(`<code class="codeBlock">basic.addProp(\`log\`, str => { 
  log(str); 
  return str; 
} );
basic.set(\`Hello\`).log.append\` world\`.toTag(\`b\`).toTag(\`i\`).log;</code>`);
  basic.set`Hello`.log.append` world`.toTag(`b`).toTag(`i`).log;

  basic.addMethod(`logPlus`, (str, ...args) => { log(str + args.join(``)); return str; })
  log(`<code class="codeBlock">basic.addMethod( \`logPlus\`, (str, ...args) => { 
  log(str + args.join(\`\`)); 
  return str; 
} );
basic.set\`Hello {wrld}\`
  .logPlus\` (unformatted)\`
  .format({wrld: \`world\`})
  .toTag(\`b\`)
  .toTag(\`i\`)
  .logPlus(\`( \`, \`formatted with \`, \`{wrld: "world"}\`, \`)\`)</code>`);
  basic.set`Hello {wrld}`.logPlus` (unformatted)`.format({wrld: `world`})
  .toTag(`b`).toTag(`i`).logPlus(` (`, `formatted with `, `{wrld: "world"})`), `)`;

  log(`!!<b id="find">Find</b>`);
  log(`!!<div><code>[xstring].find</code> receives an object with keys <code>terms</code> 
  (a string, an Array of strings or a regular expression) and <code>caseSensitive</code> 
  (a boolean, default false).</div>`);
  log(`<code>$S\`Hello world, bye world, oh world!\`.find({ terms:['world', 'oh'] })</code>${
    toJSON($S`Hello world, bye world, oh world!`.find({terms: ['world', 'oh']}))}`);
  log(`<code>$S\`Hello world, bye world, oh world!\`.find({ terms: 'world' })</code>
    ${toJSON($S`Hello world, bye world, oh world!`.find({terms: 'world'}))}` );
  log(`<code>$S\`Hello World, bye world, oh World!\`.find({ terms: 'World,', caseSensitive: true })</code>${
      toJSON($S`Hello World, bye world, oh World!`.find({terms: 'World,', caseSensitive: true}))}`);
  log(`<code>$S\`Hello World, bye world, oh World!\`.find({ terms: 'helo' })</code>${
    toJSON($S`Hello World, bye world, oh World!`.find({terms: 'helo'}))}`);
  log(`<code>$S\`Hello World, bye world, oh World!\`.find({ terms: /^hello/i })</code>${
    toJSON($S`Hello World, bye world, oh World!`.find({ terms: /^hello/i }))}`);
  log(`<code>$S\`Hello World, bye world, oh World!\`.find({ terms: /^hello/ })</code>${
    toJSON($S`Hello World, bye world, oh World!`.find({ terms: /^hello/ }))}`);
  log(`<code>${$S`Hello World, bye world, oh World!`.wordsFirstUC}.find({ terms: [{}, \`hello\`] })</code>${
    toJSON($S`Hello World, bye world, oh World!`.wordsFirstUC.find({ terms: [{}, `Hello`] }))}`);

  log(`!!<b id="regex">RegExp</b>
    <div>Create a regular expression from a multiline string 
    (see <a target="_blank" href="https://github.com/KooiInc/RegexHelper/tree/main">Github</a>)</div>`);
  const re = $S``.createRegExp`
    // A 'readable' regular expression
    (?<=N)(?<matchNumber>\d{3})
    | (?<=DSC)(?<matchSeconds>\d{2})
    | (?<=MC)(?<matchMinutes>\d{2})
    | (?<=HC)(?<matchHours>\d{2})
    | (?<=DD)(?<matchDay>\d{2})
    | (?<=MD)(?<matchMonth>\d{2})
    | (?<=NOTHING)(?<matchNoMatch>\d{2})
    | (?<=YD)(?<matchYear>\d{2})
    ${[`g`]}
    //  ^ flags`;
  const demoStr = $S`// A 'readable' regular expression
    (?<=N)(?<matchNumber>\d{3})
  | (?<=DSC)(?<matchSeconds>\d{2})
  | (?<=MC)(?<matchMinutes>\d{2})
  | (?<=HC)(?<matchHours>\d{2})
  | (?<=DD)(?<matchDay>\d{2})
  | (?<=MD)(?<matchMonth>\d{2})
  | (?<=NOTHING)(?<matchNoMatch>\d{2})
  | (?<=YD)(?<matchYear>\d{2})
  \${[\`g\`]}
  //  ^ flags`.escHTML.wrapESComments;
  log(`<code class="codeBlock">basic.createRegExp\`
  ${demoStr}\`</code>`)
  log(`${$S(re.toString()).escHTML}`);
  createContent();
}

function createContent() {
  $.delegate(`click`, `b[id]`, () => {
    $.node(`#log2screen`).scrollIntoView();
  });
  $.delegate(`click`, `.content li .linkLike`, evt => {
    const origin = $.node(evt.target.dataset.target);
    origin.scrollIntoView();
    document.documentElement.scrollTop -= 15;
  });

  const contentDiv = $.virtual(
    `<div class="content" id="content"><h3>Content</h3><ul></ul></div>`, $.node(`#inits`), `afterend`);

  const ul = contentDiv.find$(`ul`);
  $(`b[id]`).each( chapter => {
      chapter = $(chapter);
      const header = chapter.duplicate();
      const doQuote = header.hasClass(`quoted`) ? ` class="linkLike quoted"` : `class="linkLike"`;
      const headerText = header.HTML.get();
      ul.append(`<li><div ${doQuote} data-target="b#${chapter.prop(`id`)}">${headerText.replace(/\(.+\)/, ``)}</div></li>`);
      chapter.prop(`title`, `Back to top`);
  } );
  $.editCssRule(`.bottomSpace { height: ${document.body.scrollHeight}px; }`);
  $(`#log2screen`).afterMe(`<div class="bottomSpace">`);
}

function setStyling() {
  $.editCssRules(
    `.head div, .head pre, pre {font-weight: normal; color: #777}`,
    `.head b[id] {
      cursor: pointer;
      font-size: 1.2em; 
      line-height: 1.5rem;
      display: inline-block; 
      margin-top: 0.5rem
    }`,
    `@media (width > 1600px) {
      code.codeblock {
        width: 40vw;
      }
      ul#log2screen, #log2screen .content { max-width: 40vw; }
    }`,
    `@media (width < 1600px) {
      code.codeblock {
        width: 70vw;
      }
      ul#log2screen, #log2screen .content { max-width: 70vw; }
    }`,
    `@media (width < 1024px) {
      code.codeblock {
        width: 90vw;
      }
      ul#log2screen, #log2screen .content { max-width: 90vw; }
    }`,
    `#log2screen h2 { line-height: 1.7rem; }`,
    `#log2screen li pre { margin-top: 0.2rem; }`,
    `.ws { white-space: pre-line; }`,
    `code.codeBlock {
      display: block;
      background-color: rgb(255, 255, 248);
      border: 1px dotted rgb(153, 153, 153);
      color: rgb(81, 76, 125);
      margin: 1rem 0 0.5rem 0;
      font-weight: normal;
      white-space: pre-wrap;
      padding: 2px 6px;
    }`,
    `code.codeBlock .comment { color: rgb(169 156 156); }`,
    `ul#log2screen li {margin-top: 0.8rem;}`,
    `ul#log2screen ul.sub li { margin-top: 0.3rem; }`,
    `#log2screen .content ul {
      margin-left: initial;
      margin-top: -0.7rem;
    }`,
    `#log2screen .content {
      margin-top: -1rem;
      color: #000;
    }`,
    `#log2screen .content ul li div[data-target]:hover {
      color: blue;
    }`,
    `#log2screen .content {
      padding: 0.5rem;
      border-radius: 7px;
      box-shadow: -2px 1px 12px #aaa;
      margin-top: 1rem;
    }`,
    `#log2screen .content h3 { 
      margin-top: 0;
      padding-left: 24px;
      color: red;
    }`,
    `#log2screen .content ul li {
      margin-left: -1.4rem;
      margin-top: auto;
      list-style: '\\27A4';
      cursor: pointer;
    }`,
    `b[id]:before {
      content: "↺";
      color: blue;
      padding-right: 3px;
    }`,
  );
}