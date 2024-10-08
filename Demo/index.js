const now = performance.now();
import {$, logFactory} from "https://cdn.jsdelivr.net/gh/KooiInc/SBHelpers@main/index.browser.bundled.js";
const importUrl = /^dev\./i.test(location.host) ? `../index.esm.js` : `../Bundle/index.esm.min.js`;
const importX = `import from "${importUrl}" `;
// ***
const {$S, stringBuilderFactory} = (await import(importUrl).then(r => ({...{$S: r.default}, ...r})));
// try things yourself in the console ...
window.$S = $S;
window.$SB = stringBuilderFactory({sanitizeHTML: false, $S});

demo();

function demo() {
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
  
  /* region initialize */
  $(`<div class="container">`).append($(`#log2screen`));
  const basic = $S``;
  const basicRefusedFromContract1 = $S({});
  const basicRefusedFromContract2 = $S(undefined);
  const hi = basic.set(`hello`).ucFirst;
  const hi1 = hi.set`hithere and ${hi.toLowerCase()}`;
  const tokens = [ {world: [`you`, `world`, `galaxy`, `universe`] } ];
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
const basicRefusedFromContract1 = $S({});
const basicRefusedFromContract2 = $S(undefined);
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
    <div><b>Notes</b>:</div>
    <ul class="sub">
      <li>you can call <code>$S</code> either as a tagged template function or as a normal function.</li>
      <li>properties/methods (also native (String.prototype)) returning a string
        can be <a target="_blank" href="https://www.tutorialspoint.com/method-chaining-in-javascript">chained</a></li>
      <li>like regular ES-strings $S-strings are
        <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Glossary/Immutable">immutable</a>
        (but check the <span class="inline" data-target="b#Stringbuilder">string builder</span> utility
        this library provides)</li>
      <li>for this example <code>$S</code> is also available in the developer console
        (when loaded in stackblitz, first click 'Open in New Tab' above the preview frame).</li>
    </ul>` );
  
  log(`!!<b>Initial values</b>`);
  log(`<code>basic</code> ${basic.rQuot}<br>
    <code>basicRefusedFromContract1</code> ${basicRefusedFromContract1.rQuot} (see console)<br>
    <code>basicRefusedFromContract2</code> ${basicRefusedFromContract2.rQuot} (see console)<br>
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
    `<code>yada2.truncate({at: 38}).toTag(\`i\`)</code><div>${
      yada2.truncate({at: 38}).toTag(`i`).rQuot}`);
  log(`<code>yada2.truncate({at: 38, html: true, wordBoundary: true}).toTag(\`b\`)</code><div>${
    yada2.truncate({at: 38, html: true, wordBoundary: true}).toTag(`b`).rQuot}`);
  log(`<code>$S\`HELLO WORLDS\`.capitalizeWords</code><div>${
    $S`HELLO WORLDS`.capitalizeWords.rQuot}</div>`);
  log(`<code>$S\`HELLO home @ WORLDS@Milky way|ûniverSE, yes it's me all-right\`.capitalizeWords</code><div>${
    $S`HELLO home @ WORLDS@Milky way|ûniverSE, yes it's me all-right`.capitalizeWords.rQuot}</div>`);
  
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
  const escaped4Log = $S`$S\`\\n  <li>\${hi\} {world}</li>\\n\``.escHTML;
  log(`<code>tokens</code>: <pre>${JSON.stringify(tokens[0])}</pre>
  <code class="codeBlock">${escaped4Log}
.format(...tokens)
.toTag(\`ul\`, {class: \`sub\`, id: \`formatted\`})</code>${
    $S`\n  <li> ${hi} {world} </li>`.format(...tokens).toTag(`ul`, {class: `sub`, id: `formatted`}) }`);
  /* endregion format */
  
  /* region html Escape/Compress */
  log(`!!<b id="escHtml">HTML (escape/compress)</b>`);
  log(`!!* <code>escHTML</code>`,
    `<code>$S(document.querySelector('ul#formatted').outerHTML).escHTML.quote.double</code> =&gt;
      <pre>${$S($(`ul#formatted`).HTML.get(1)).escHTML.quote.double}</pre>`,
    `!!* <code>compressHTML</code>`,
    `<code>$S(document.querySelector('ul#formatted').outerHTML).compressHTML.escHTML.quote.double</code> =&gt;
      <pre class="ws">${$S($(`ul#formatted`).HTML.get(1)).compressHTML.escHTML.quote.double}</pre>`);
  /* endregion htmlEscCompress */
  
  /* region HTML Sanitizer */
  log(`!!<b id="sanitation">HTML (sanitation)</b> (<code>toTag</code> or directly).
    <p><i class="red">All <code>$S</code> instances</i> are checked for HTML inside it. If a string
     contains HTML, the HTML is sanitized:
    tags/attributes/attribute values deemed insecure will be removed from it.
    Sanitation problems are logged to the console.</p>
    <p>It goes without saying that <code>toTag</code> will deliver a sanitized html string.
    When trying to wrap a string into an insecure tag (e.g. <code>script</code>),
    the resulting <code>$S</code>-instance will be an error message.</p>
    <p>To <i>prevent automatic sanitation</i> use <span class="inline" data-target="#sanitizeSetter">
      <code>$S.sanitize</code> setter</span>, <b><i>or</i></b> the static method <code>$S.rawHTML</code></p>`);
  
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
  
  log(`!!<b>* <i>Prevent</i> automatic sanitation using the <code>$S.sanitize</code> setter</b>
  <div>&nbsp;&nbsp;<b>Notes</b>:<ul class="sub">
    <li><div class="inline" data-target="#sanitizeSetter">See also <code>$S.sanitize</code></div></li>
    <li>adding unsanitized html strings to the DOM may end up in security breaches.</li>
  </ul>`);
  $S.sanitize = false;
  const rawScriptTag2 = $S`<script src="${src}"></script>`;
  $S.sanitize = true;
  log(`<code class="codeBlock">$S.sanitize = false;
$S\`&lt;script src="\${src}">&lt;/script>\`</code><div>${$S(rawScriptTag2.escHTML).rQuot}</div>`);
  
  log(`!!<b>* <i>Prevent</i> automatic sanitation using the <code>$S.rawHTML</code> static method</b>`);
  const rawHtmlStr = $S.rawHTML(`<script src="${src}"></script>`);
  log(`<code>$S.rawHTML\`${rawHtmlStr.escHTML}\`</code><br>=> ${rawHtmlStr.escHTML}`);
  
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
}`.toCodeBlock.wrapESComments}
<div><b>Note</b>:<ul class="sub">
    <li>
      The native <code>String.prototype.indexOf</code> and <code>String.prototype.lastIndexOf</code>
      methods return -1 when nothing is found. These methods are overridden for a $S instance:
      both now return either <code>undefined</code> if nothing is found or the index of the found
      substring. See <a href="https://youtu.be/99Zacm7SsWQ?t=2101"
      target="_blank">this video</a> for an explanation. The first two examples demonstrate this
      for <code>.indexOf</code>.
    </li>
  </ul></div>`);
  log(`instead of <code>$S\`Hello World, bye world, oh World!\`.indexOf(\`wrrld\`) > -1 || \`NOT FOUND\`</code>
  <br>  we now can use
  <br><code>$S\`Hello World, bye world, oh World!\`.indexOf(\`wrrld\`) ?? \`NOT FOUND!\</code>
  <br>=> ${$S`Hello World, bye world, oh World!`.indexOf(`wrrld`) ?? `NOT FOUND!`}`);
  log(`<code>$S\`Hello World, bye world, oh World!\`.indexOf(\`world\`)</code><br>
  => ${$S`Hello World, bye world, oh World!`.indexOf(`world`)}`);
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
  log(`<code>${$S`Hello World, bye world, oh World!`.capitalizeWords}.find({ terms: [{}, \`hello\`] })</code>${
    toJSON($S`Hello World, bye world, oh World!`.capitalizeWords.find({ terms: [{}, `Hello`] }))}`);
  /* endregion find */
  
  /* region utilities */
  log(`!!<b id="utilities">Constructor (utility) getters/setters/methods</b>
  <div>The constructor contains a few utility getters/methods.
    Assuming the constructor is named <code>$S</code></div>
  <ul class="sub">
    <li><code>$S.extendWith</code>: a method to create your own extensions for instances</li>
    <li><code>$S.regExp</code>: a tagged template method to create a Regular Expression from
      a multiline string</li>
    <li><code>$S.randomString</code>: a method to create a random string</li>
    <li><code>$S.uuid4</code> a getter that returns a uuidv4 string</li>
    <li><code>$S.currentMethods</code> a getter returns the names of all instance extension methods</li>
    <li><code>$S.sanitize</code> a setter to enable or disable HTML sanitation</li>
  </ul>`);
  
  /* region extra methods/props creation */
  log(`!!<h3><code>$S.extendWith</code></h3>
<div>Add extensions or properties to the <code>$S</code> constructor.
  <br>Syntax: ${$S`$S.extendWith(name: string, fn: Function, isMethod: boolean)`.toCode}</div>
  <b>Notes</b>:
  <ul class="sub">
    <li>for chaining: make sure the added method or property lambda returns the resulting string.</li>
    <li>Because strings are immutable, the initial string is not changed. As with regular strings,
    to change a string you'll have to (re)assign it.</li>
  </ul>`);
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
  log(`!!<h3><code>$S.regExp</code></h3>
  <div>Create a regular expression from a multiline string
  (see <a target="_blank" href="https://github.com/KooiInc/RegexHelper/tree/main">Github</a>)</div>
  <div><b>Note</b>: regular expressions can <i>only be created using a tagged template</i>
  (so, don't call as a function)</div>`);
  $S.sanitize = false;
  const regExample = $S.regExp`
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
  const demoStr = $S($S.rawHTML`\$S.regExp\`
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
  //  ^ flags`.escHTML).toCodeBlock.wrapESComments;
  log(`${demoStr}<div>=&gt; ${$S.rawHTML`${regExample}`.escHTML}`);
  
  log(`!!<b>* Invalid result returns error message`);
  const reError = $S`$S.regExp\`[a-z](?<letterFollowedBynumber>\d+)\${["a", "g"]})\``.escHTML;
  const reErrorResult = $S( $S.regExp`[a-z](?<letterFollowedBynumber>\d+)${[`a`, `g`]}` );
  log(`<code>${reError}</code><pre>=&gt; ${reErrorResult.escHTML}</pre>`);
  $S.sanitize = true;
  /* endregion regex */
  
  /* region randomString */
  log(`!!<h3><code>$S.randomString</code></h3>
  <div>Create a random string using letters and/or number and/or symbols.
  You may use this method for example to create password strings, or random element id's.</div>
  <p><b>Syntax</b>:<br><code class="codeBlock">$S.randomString({
  len: Number( default 12),
  includeUppercase: bool (default true),
  includeNumbers: bool (default false),
  includeSymbols: bool (default false),
  startAlphabetic: bool (default false) } )</code></p>
<ul class="sub"><li><code>$S.randomString({...})</code> is chainable</li>
  <li>The <i>minimum</i> generated string length (len) is 6</li></ul>`);
  log(`<code>$S.randomString()</code><br>=> "${$S.randomString()}"`);
  log(`<code>$S.randomString({includeNumbers: true, startAlphabetic: true}).insert(\`id="\`).append(\`"\`)</code>
  <br>=> ${
    $S.randomString({includeNumbers: true, startAlphabetic: true}).insert(`id="`).append(`"`)}`);
  log(`<code>$S.randomString({len: 80})</code><br>=> "${$S.randomString({len: 80})}"`);
  log(`<code>$S.randomString({includeUppercase: false, len: 48})</code><br>=> "${
    $S.randomString({includeUppercase: false, len: 48})}"`);
  log(`<code>$S.randomString({len: 32, includeNumbers: true})</code><br>=> "${
    $S.randomString({len: 32, includeNumbers: true})}"`);
  log(`<code>$S.randomString({len: 24, includeNumbers: true, includeSymbols: true})</code><br>=> "${
    $S.randomString({len: 24, includeNumbers: true, includeSymbols: true})}"`);
  log(`<code>$S.randomString({len: 24, includeNumbers: true, includeSymbols: true, startAlphabetic: true})</code>
  <br>=> "${$S.randomString({len: 24, includeNumbers: true, includeSymbols: true, startAlphabetic: true})}"`);
  log(`<code>$S.randomString({len: 4, includeNumbers: true, includeSymbols: true, startAlphabetic: true})</code>
  <br>=> "${$S.randomString({len: 4, includeNumbers: true, includeSymbols: true, startAlphabetic: true})}" (minimum length 6)`);
  /* endregion randomString */
  
  /* region uuid */
  log(`!!<h3><code>$S.uuid4</code></h3>
  <div><code>uuid4</code> is a getter, returning a random
  <a target="_blank" href="https://www.sohamkamani.com/uuid-versions-explained/#v4--randomness"
  >UUIDV4</a> string.</div>
  <div><b>Note</b>: <code>$S.uuid4</code> is chainable`);
  log(`<code>[...Array(10)].map(_ => $S.uuid4)</code> =><pre>${[...Array(10)].map(_ => $S.uuid4).join(`\n`)}</pre>`);
  log(`<code>$S.uuid4.case.upper</code> ${$S.uuid4.case.upper.rQuot}`);
  /* endregion uuid */
  
  /* region currentMethods */
  log(`!!<h3><code>$S.currentMethods</code></h3>
  <div><code>currentMethods</code> is a getter, returning an array containing the names of all currently
    existing instance getters/methods (including the ones you may have created), sorted alphabetically.`);
  log(`<code>$S.currentMethods</code> => [${$S.currentMethods.join(`, `)}]`);
  /* endregion currentMethods */
  
  /* region setSanitize */
  log(`!!<h3 id="sanitizeSetter"><code>$S.sanitize</code></h3>
  <div>Using the <code>$S.sanitize</code> setter you can enable or disable HTML sanitation
    for all subsequent instances</div>
  <div><b>Note</b>: adding unsanitized html strings to the DOM may end up in security breaches.</div>`);
  $S.sanitize = false;
  const evilThing = $S`<div onclick="alert('you evil thing!')">evil!</div>`;
  $S.sanitize = true;
  const nothingEvil = $S`<div onclick="alert('you evil thing!')">NOT evil</div>`
  log($S`$S.sanitize = false;
const evilThing = $S\`&lt;div onclick="alert('you evil thing!')">evil!&lt;/div>\`;
// re-enable
$S.sanitize = true;
const nothingEvil = $S\`&lt;div onclick="alert('you evil thing!')">NOT evil!&lt;/div>\`;`
    .toCodeBlock
    .wrapESComments
    .insert(`!!`));
  log(`<code>evilThing.escHTML</code> => ${evilThing.escHTML}`);
  log(`<code>nothingEvil.escHTML</code> => ${nothingEvil.escHTML}`);
  /* endregion setSanitize */
  
  /* endregion utilities */
  
  /* region stringbuilder */
  log(`!!<b id="Stringbuilder">Stringbuilder utility</b>
  <div>The <code>es-string-fiddler</code> library also exports a <code>stringBuilder</code>
    utility. This utility creates a <i>mutable</i> string constructor, using the
    <code>$S</code> constructor as its internal string value. With it one can build
    strings using nearly all methods from the internal <code>$S</code> instance</div>
    <ul class="sub">
      <li>Initialization by
      <code class="codeBlock">import {stringBuilderFactory} from "[location of es-string-fiddler]";
const $SB = stringBuilderFactory({
  [sanitizeHTML]: boolean,
  [$S]: es-string-fiddler constructor });</code>
      Where <code>sanitizeHTML</code> indicates <code>$SB</code> should sanitize HTML (default <code>false</code>)
      and <code>$S</code> is the es-string-fiddler constructor (in its <i>present state</i>, so including
      extra methods or properties created by the user; default the initial <code>$S</code> constructor).
      See <a target="_blank" href="https://stackblitz.com/edit/web-platform-k1jygm?file=StringBuilderFactory.js"
      >this stackblitz project</a> for a few examples.</li>
    </ul>`);
  /* endregion stringbuilder */
  
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
  log(`Created ${(nTests).toLocaleString(`nl`)} <code>$S</code> instances using 4 (randomly chosen)
    string values and pushed to a temporary Array. Including overhead for pushing and random string
    selection that took ${lasted.toFixed(3)} seconds (${(lasted/nTests).toFixed(7)} seconds/instance).`);
  log(`!!<b>* Test string values used</b><pre>"${strings.map(v => $S(v).escHTML).join(`"\n"`)}"</pre>`);
}
/* endregion testPerformance */

/* region indexCreatr */
function createContent() {
  const container = $.node(`.container`);
  $.delegate(`click`, `b[id]`, () => {
    container.scrollTo(0, 0);
  });
  $.delegate(`click`, `[data-target]`, (_, me) => {
    const target = $(me.data.all.target);
    container.scrollTo(0, container.scrollTop + Math.round(target.dimensions.top) - 12);
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
      margin-top: 0.5rem }`,
    `@media (width > 1600px) {
      code.codeblock { width: 40vw;  }
    ul#log2screen, #log2screen .content { max-width: 40vw; } }`,
    `@media (width < 1600px) {
      code.codeblock { width: 70vw; }
      ul#log2screen, #log2screen .content { max-width: 70vw; }
    }`,
    `@media (width < 1024px) {
      code.codeblock { width: 90vw; }
      ul#log2screen, #log2screen .content { max-width: 90vw; }
    }`,
    `.red, .red * { color: red; }`,
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
    `ul.sub li .codeBlock { max-width: 90vw; margin-top: 0.2rem; }`,
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
    `.inline[data-target],
     .inline[data-target] code {
      cursor: pointer;
      color: blue;
    }`,
    `.inline[data-target]:hover {
      text-decoration: underline;
    }`,
    `#log2screen .content ul li {
      margin-left: -1.4rem;
      margin-top: auto;
      list-style: '\\27A4';
      cursor: pointer;
    }`,
    `b[id]:before {
      content: "\u{1f51d}";
      font-size: 1.2rem;
      color: blue;
      padding-right: 3px;
    }`,
  );
}
/* endregion styling */
