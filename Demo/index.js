const now = performance.now();
import {$, logFactory} from "https://cdn.jsdelivr.net/gh/KooiInc/SBHelpers@main/index.browser.bundled.js";
const importUrl = /^dev\./i.test(location.host) ? `../index.esm.js` : `../Bundle/index.esm.min.js`;
const importX = `import from "${importUrl}" `;
// ***
const $S = (await import(importUrl)).default;
window.$S = $S; // try things yourself in the console ...
demo();

function demo() {
  /* region initialize constructor*/
  //  remove stackblitz message from sbhelpers module
  console.clear();
  $.log(`demo started`);
  $.log(`You can use $S in the console to test things`);
  const { log } = logFactory();
  const toJSON = obj => `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
  setStyling();

  log(`!!<a target="_top" href="https://github.com/KooiInc/es-string-fiddler"><b>Back to repository</b></a>`);
  log(`!!<h3>Play with the demo code <a target="_blank" href="https://stackblitz.com/edit/web-platform-gxttr1?file=index.js"
    >@StackBlitz</a></h3>`);
  log(`!!<h2 id="inits">EcmaScript (ES) <code>String</code> manipulation using ES <code>Proxy</code></h2>`);

  $(`<div class="container">`).append($(`#log2screen`));
  const basic = $S``;
  const hi = basic.set(`hello`).ucFirst;
  const hi1 = hi.set`hithere and ${hi.toLowerCase()}`;
  const tokens = [{world: `you`}, {world: `world`}, {world: `galaxy`}, {world: `universe`}];
  $S.extendWith(`rQuot`, str => { return `=&gt; ${$S(str).quote.double}`; });
  $S.extendWith(`wrapESComments`, str =>
    str.replace(/(?<!(http)|(https):)\/\/.+/gm, a => `<span class="comment">${a}</span>`)
  );
  $S.extendWith(`toCode`, str => `<code>${str}</code>`);
  $S.extendWith(`toCodeBlock`, str => `<code class="codeBlock">${str}</code>`);
  /* endregion initialize */

  /* region initiate variables*/
  log(`!!<b id="initiate">Initiate, assign some variables</b></h3>`);
  log( $S`import $S from "${importUrl}";
// a basic empty string can be used as template
const basic = $S\`\`;
const hi = basic.set\`hello\`.ucFirst;
const hi1 = hi.set\`hithere and \${hi.case.lower}\`;
// tokens to use with .format
const tokens = [
  {world: \`you\`}, 
  {world: \`world\`}, 
  {world: \`galaxy\`}, 
  {world: \`universe\`}, ];`
    .toCodeBlock
    .wrapESComments
    .insert(`!!`)
    .concat`
      <div>
        <b>Note</b>: you can call <code>$S</code> either as a tagged template function or as a normal function.
        <br><b>Note 2</b>: properties/methods (also native (String.prototype)) returning a string
          can be <a target="_blank" href="https://www.tutorialspoint.com/method-chaining-in-javascript">chained</a>.
        <br><b>Note 3</b>: like regular ES-strings $S-strings are
          <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Glossary/Immutable">immutable</a>
        <br><b>Note 4</b>: for this example <code>$S</code> is also available in the developer console
          (when loaded in stackblitz, first click 'Open in New Tab' above the preview frame).
      </div` );

  log(`!!<b>Initial values</b>`);
  log(`<code>basic</code> ${basic.rQuot}<br>
      <code>hi</code> ${hi.rQuot}<br>
      <code>hi1</code> ${hi1.rQuot}<br>
      <code>basic.isProxied</code> ${basic.isProxied}`);
  /* endregion initiate */

  /* region manipulate instances */
  log(`!!<b id="manipulate">Manipulate strings</b></h3>`);
  log( $S`hi1
  .insert( $S\`there you have it &amp;hellip; \` // <= parameter $S-string
    .ucFirst
    .insert(\`"\`) )
  .append( \` and  also: that's folks"\`)
  .insert( $S\` IT \` // <= oops, forgotten 'it'. So let's insert that.
    .toTag( \`b\`, {style:\`color:blue;background:#eee\`,title:\`post hoc insertion\` })
    .toTag( \`i\`), -7 );`.toCodeBlock.wrapESComments.concat`=&gt; ${
    hi1
      .insert( $S`there you have it &hellip; `
        .ucFirst
        .insert(`"`) )
      .append(` and also: that's folks"`)
      .insert($S` IT `
        .toTag(`b`, { style:`color:blue;background:#eee`, title: `post hoc insertion` })
        .toTag(`i`), -7)}` );
  const camelCased = $S`bla-bla and AGAIN bla`.toCamelCase;
  log(`<code>const camelCased = $S\`bla-bla and AGAIN bla\`.toCamelCase;</code><div>${
    camelCased.rQuot}</div>`);
  log(`<code>camelCased.toDashedNotation</code><div>${camelCased.toDashedNotation.rQuot}</div>`);
  log(`<code>$S(\`$S called as {rf}\`).format({rf: \`regular function (&lt;code>$S([string])&lt;/code>)\`})</code>
    <div>${$S(`$S called as {rf}`).format({rf: `regular function (<code>$S([string])</code>)`}).rQuot}`);

  log(`<code>$S\`nice\`.ucFirst.toTag(\`b\`, {style: \`color: red;\`}).quote.backtick</code><div>=&gt; ${
    $S`nice`.ucFirst.toTag(`b`, {style: `color: red;`}).quote.backtick}</div>`);

  log(`<code>$S\`Hello world, o cruel world\`.replaceWords('world', 'universe')</code><div>${
    $S`Hello world, o cruel world`.replaceWords('world', 'universe').rQuot}`);
  const yada2 = $S`yada `.repeat(14).ucFirst.trimEnd();
  log(`<code>const yada2 = $S\`yada \`.repeat(14).ucFirst;</code><div>${yada2.trim().rQuot}</div>`,
    `<code>yada2.truncate({at: 38}).toTag(\`i\)</code><div>${
      yada2.truncate({at: 38}).toTag(`i`).rQuot}`);
  log(`<code>yada2.truncate({at: 38, html: true, wordBoundary: true}).toTag(\`b\)</code><div>${
    yada2.truncate({at: 38, html: true, wordBoundary: true}).toTag(`b`).rQuot}`);
  /* endregion manipulate */

  /* region combine native methods with extensions */
  log(`!!<b id="chainEtc">Use/chain/combine native/custom methods</b>`,
    `<code>const yada2 = $S\`yada \`.repeat(14).ucFirst.trimEnd();</code><div>${yada2.rQuot}</div>`,
    `<code>yada2.isWellFormed()</code> =&gt; ${
      yada2.isWellFormed()}`);
  log(`<code>yada2.trim().slice(-4).concat\` \${hi}\`.toUpperCase().toTag(\`i\`, {style: \`color: orange\`})</code>
    <div>${yada2.slice(-4).concat` ${hi}`.toUpperCase().toTag( `i`, { style: `color: orange` }).rQuot }</div>`);
  log(`<code>yada2.trim().toUpperCase().case.camel.toTag(\`div\`, {style:\`text-indent:1rem\`})</code> ${
    yada2.trim().toUpperCase().case.camel.rQuot.toTag(`div`, {style:`text-indent:1rem`})}`)
  /* endregion useCombine */

  /* region format (aka interpolate)*/
  log(`!!<b id="format">Format with tokens</b>
  (see <a target="_blank" href="https://github.com/KooiInc/StringInterpolator">Github</a>)</div>`);
  const escaped4Log = $S`$S\`<li>\${hi\} {world}</li>\\n\``.escHTML;
  log(`<div><code>${escaped4Log}.format(...tokens).toTag(\`ul\`, {class: \`sub\`})</code></div>
    ${$S`<li> ${hi} {world} </li>\n`.format(...tokens).toTag(`ul`, {class: `sub`})}`);
  /* endregion format */

  /* region html Escape/Compress */
  log(`!!<b id="escHtml">HTML (escape/compress)</b>`);
  log(`<code>$S(document.querySelector('ul.sub').outerHTML).escHTML.quote.double</code> =&gt;
  <pre class="ws">${$S($(`ul.sub`).HTML.get(1)).escHTML.quote.double}</pre>`,
    `<code>$S(document.querySelector('ul.sub').outerHTML).compressHTML.escHTML.quote.double</code> =&gt;
    <pre class="ws">${$S($(`ul.sub`).HTML.get(1)).compressHTML.escHTML.quote.double}</pre>`);
  /* endregion htmlEscCompress */

  /* region HTML Sanitizer */
  log(`!!<b id="sanitation">HTML (sanitation)</b> (<code>toTag</code> or directly).
      <p><i style="color:red">All <code>$S</code> instances</i> are checked for HTML inside it, and if so sanitized.
      Tags/attributes/attribute values deemed insecure will be removed from the html.
      Sanitation problems are logged to the console.</p>
      <p>It goes without saying that <code>toTag</code> will deliver a sanitized html string.
      When trying to wrap a string into an insecure tag (e.g. <code>script</code>),
      the resulting <code>$S</code>-instance will be an error message.</p>
      <p>To <i>prevent automatic sanitation</i>, put <code>!!!</code> before the string to instantiate.</p>`);

  log(`!!<b class="header">Sanitition when using the <code>toTag</code> method</b>`);
  const niceStr = $S`nice`.ucFirst.toTag(`b`, {onclick: "alert('hi')", style: `color: red;`}).quote.backtick;
  log(`<code>$S\`nice\`.ucFirst.toTag(\`b\`, {onclick: "alert('hi')",style: \`color: red;\`}).quote.backtick</code><div>=&gt; ${
    niceStr} Sanitized: <code>onclick</code> removed =&gt; ${niceStr.escHTML}</div>`);

  const src = URL.createObjectURL(
    new Blob(
      [`alert("hithere!")`],
      { type: `application/javascript` } ) );

  log(`<code class="codeBlock">const src = URL.createObjectURL(
  new Blob(
    [\`alert("hithere!")\`],
    { type: \`application/javascript\` } ) );
basic.toTag( \`script\`, { src });</code>
  <div>Sanitized with error message:<br>=&gt; ${basic.toTag(`script`, {src})}</div>`);

  const blockToLog = basic.set`<script>function runMe() { alert("hi!"); }</script><b onclick="javascript:runMe()">Hello!</b>`.toTag(`span`);
  log(`<code>basic.set\`&lt;script>function runMe() { alert("hi!"); }&lt;/script>&lt;b onclick="javascript:runMe()">Hello!&lt;/b>\`.toTag( \`span\`);</code>
    <div>Sanitized (script tag/onclick removed): ${blockToLog} =&gt; ${blockToLog.escHTML}</div>`);

  log(`!!<b class="header">Default sanitation of <code>$S</code>-instances</b>`);
  const sane = $S`<span mytag="removed" onclick="alert('removed')" class="xyz"><b style="color: red">Hello!</b></span>`;
  log(`<code class="codeBlock">\$S\`
&lt;span mytag="removed" onclick="alert('removed')" class="xyz">
  &lt;b style="color: red">Hello!&lt;/b>
&lt;/span>\`</code>
    ${sane} Sanitized ${sane.escHTML.rQuot}`);

  const xcript = $S`<span style="color:steelblue"><script></script>Hithere!</span>`;
  log(`<code>$S\`&lt;span style="color:steelblue">&lt;script>&lt;/script>Hithere&lt;/span>\`</code>
    <div>${xcript} Sanitized ${xcript.escHTML.rQuot}</div>`);

  const tagsWithin = $S`A string <i>containing <b>tags</b></i> <span onclick="javascript:sayHi()">will be sanitized</span>`;
  log(`!!<b>* Sanitizing a string with some html within</b>`);
  log(`<code>$S\`A string &lt;i>containing &lt;b>tags&lt;/b>&lt;/i> &lt;span onclick="javascript:sayHi()">will be sanitized&lt;/span>\`</code>
    <div>${tagsWithin}<br>Sanitized: ${tagsWithin.escHTML.rQuot}</div>`);

  log(`!!<b>* Error message when creating an single invalid (root level) tag</b>`);
  const scriptTag = $S`<script src="${src}"></script>`;
  log(`<code>$S\`&lt;script src="\${src}">&lt;/script>\`</code><div>${$S(scriptTag).rQuot}</div>`);

  log(`!!<b>* With mix of invalid and valid tags, the valid tags are preserved</b>`);
  const scriptTag2 = $S`<script src="${src}"></script><span>But this will show up</span>`;
  log(`<code>$S\`&lt;script src="\${src}">&lt;/script>&lt;span>But this will show up&lt/span>\`</code><div>${scriptTag2.rQuot}</div>`);

  log(`!!<b>* <i>Prevent</i> automatic sanitation</b><div><b>Note</b>: adding unsanitized html strings
    to the DOM may end up in security breaches.</div>`);
  const rawScriptTag = $S`!!!<script src="${src}"></script>`;
  log(`<code>$S\`!!!&lt;script src="\${src}">&lt;/script>\`</code><div>${$S(rawScriptTag.escHTML).rQuot}</div>`);

  log(`!!<b>* A <code>$S</code>-string returns, well ... the string (a <code>$S</code> instance that is)</b>`);
  const noSanity = $S`This is just a plain old fashioned string`;
  log(`<code>$S${noSanity.escHTML.quote.backtick}</code>
    <div>${noSanity.rQuot}</div>`);
  /* endregion HTMLSanitize */

  /* region find */
  log(`!!<b id="find">Find in string</b>`);
  log(`!!<div><code>[xstring].find</code> receives an object with keys <code>terms</code>
  (a string, an Array of strings or a regular expression) and <code>caseSensitive</code>
  (a boolean, default false). It returns an object: 
  ${$S`{ searched4: string // the term searched for,
  hits: Number, // the number of hits,
  result: Object {
    term: string,  // found term
    at: Array, // position(s) of term found in string
  },  
}`.toCodeBlock.wrapESComments}</div>`);
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
  /* endregion find */

  /* region extra methods/props creation */
  log(`!!<b id="addMethOrProp">Create extra methods and properties utility</b> <code>$S.extendWith</code>
  <div>Add extensions or properties to the <code>$S</code> constructor.
    <br>Syntax: ${$S`$S.extendWith(name: string, fn: Function, isMethod: boolean)`.toCode}</div>
  <div><b>Note</b>: for chaining: make sure the added method or property lambda returns the resulting string.</div>`);
  $S.extendWith(`log`, str => { log(str); return str; });
  $S.extendWith(`logAdd`, (str, ...args) => { log(str + args.join(``)); return str; }, true);

  log($S`<code class="codeBlock">$S.extendWith(\`log\`, str => {
  log(str);
  return str;
} );
// apply
basic.set\`\${hi}\`.log.append\` world\`.toTag(\`b\`).toTag(\`i\`).log;</code>`.wrapESComments);
  basic.set`${hi}`.log.append` world`.toTag(`b`).toTag(`i`).log;

  log($S`<code class="codeBlock">$S.extendWith( \`logAdd\`, (str, ...args) => {
  log(str + args.join(\`\`));
  return str;
}, true );
// apply
basic.set\`Hello {wrld}\`
  .logAdd\` (unformatted)\`
  .format({wrld: \`world\`})
  .toTag(\`b\`)
  .toTag(\`i\`)
  .logAdd(\`( \`, \`formatted with \`, \`{wrld: "world"}\`, \`)\`)</code>`.wrapESComments);
  basic.set`Hello {wrld}`.logAdd` (unformatted)`.format({wrld: `world`})
    .toTag(`b`).toTag(`i`).logAdd(` (`, `formatted with `, `{wrld: "world"}`, `)` );

  /* endregion xtraMethods */

  /* region regex */
  log(`!!<b id="regex">Regular Expression utility</b> (<code>$S.regExp</code>)
    <div>Create a regular expression from a multiline string
    (see <a target="_blank" href="https://github.com/KooiInc/RegexHelper/tree/main">Github</a>)</div>
    <div><b>Note</b>: regular expressions can only be created using a tagged template (so, don't call as a function)</div>`);

  const reDirect = $S.regExp`
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
  const demoStr = $S`!!!
  // A 'readable' regular expression
    (?<=N)(?<matchNumber>\d{3})
  | (?<=DSC)(?<matchSeconds>\d{2})
  | (?<=MC)(?<matchMinutes>\d{2})
  | (?<=HC)(?<matchHours>\d{2})
  | (?<=DD)(?<matchDay>\d{2})
  | (?<=MD)(?<matchMonth>\d{2})
  | (?<=NOTHING)(?<matchNoMatch>\d{2})
  | (?<=YD)(?<matchYear>\d{2})
  \${[\`g\`]}
  //  ^ flags`;

  log(`<code class="codeBlock">$S.regExp\`${demoStr.escHTML.wrapESComments}\`</code>
    <div>=&gt; ${$S`!!!${reDirect}`.escHTML.wrapESComments}`);

  log(`!!<b>* Invalid result returns error message`);
  log(`<code>$S.regExp\`[a-zA-Z](error \${[\`a\`, \`g\`]}\`</code><pre>=&gt; ${
    $S.regExp`[a-zA-Z](error ${[`a`, `g`]}`}</pre>`);
  /* endregion regex */

  /* region theEndMyFriend */
  log(`!!<b id="Performance">Performance</b>
    <div><b>Note</b>: also dependent on your hardware</div>`);
  createContent();
  log(`Demo creation (including imports/content generation) done in ${
    ((performance.now() - now)/1000).toFixed(3)} seconds`);
  testPerf(log);
  /* endregion theEndMyFriend */
}

/* region testPerformance */
function testPerf(log) {
  let tmpArr = [];
  const nTests = 20_000;
  const strings = [
    `Hello world`,
    `<div>Hello world</div>`,
    `Hello <b>world</b>`,
    `<div>Hello <div><b><i><!--3 levels nesting-->world</i></b></div>`,];
  const len = strings.length;
  const now = performance.now();
  for (let i = 0; i < nTests; i += 1) {
    tmpArr.push($S`${strings[Math.floor(Math.random()*len)]}`);
  }
  const lasted = (performance.now() - now)/1000;
  log(`Created ${(nTests).toLocaleString(`nl`)} <code>$S</code> instances using 4 random string values
    and pushed to a temporary Array.<br>Including overhead for pushing and random string selection that took ${
      lasted.toFixed(3)} seconds (${(lasted/nTests).toFixed(7)} seconds/instance).`);
  log(`!!<b>* Random string values used</b><pre>${strings.map(v => $S(v).escHTML).join(`\n`)}</pre>`);
}
/* endregion testPerformance */

/* region indexCreatr */
function createContent() {
  const container = $.node(`.container`)
  $.delegate(`click`, `b[id]`, () => {
    container.scrollTo(0,0);
  });
  $.delegate(`click`, `.content li .linkLike`, evt => {
    const origin = $(evt.target.dataset.target);
    container.scrollTo(0, origin.dimensions.top - 12);
  });

  const contentDiv = $.virtual(
    `<div class="content" id="content"><h3>Content</h3><ul></ul></div>`, $.node(`#inits`), `afterend`);

  const ul = contentDiv.find$(`ul`);
  $(`b[id]`).each( chapter => {
    chapter = $(chapter);
    const header = chapter.duplicate();
    const doQuote = header.hasClass(`quoted`) ? ` class="linkLike quoted"` : `class="linkLike"`;
    const headerText = header.HTML.get();
    ul.append(`<li><div ${doQuote} data-target="b#${chapter.prop(`id`)}">${headerText}</div></li>`);
    chapter.prop(`title`, `Back to top`);
  } );
  $.editCssRule(`.bottomSpace { height: ${$.node(`.container`).clientHeight}px; }`);
  $(`#log2screen`).afterMe(`<div class="bottomSpace">`);
}
/* endregion indexCreatr */

/* region styling */
function setStyling() {
  $.editCssRules(
    `body { margin: 0; }`,
    `.container { position: absolute; inset: 0; overflow-y: auto; }`,
    `.head div, .head pre, pre {font-weight: normal; color: #777}`,
    `.head b[id], .head b.header {
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
    `ul#log2screen {margin: 0 auto;}`,
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
      content: "🔝";
      font-size: 1.2rem;
      color: blue;
      padding-right: 3px;
    }`,
  );
}
/* endregion styling */
