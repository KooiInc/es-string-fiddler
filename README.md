# (chainable) String extensions using ES Proxy

`es-string-fiddler` is a utility module adding some nifty properties/methods to regular ECMAScript (ES) strings. 
  It is actually a modified `String` constructor using ES [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to create `String` instances with extra functionality.

The module is programmed using a [class free object oriented](https://depth-first.com/articles/2019/03/04/class-free-object-oriented-programming) coding style. 

Furthermore the module is programmed ['by contract'](https://en.wikipedia.org/wiki/Design_by_contract). 
This means that the constructor expects either a `String` or a `template String`. Calling the constructor with any other input will return an instance with an extended *empty string*.

Properties and/or methods (either native or extensions) returning a string can be [chained](https://www.geeksforgeeks.org/method-chaining-in-javascript/). 

The default 'constructor' (here `$S`) and instance extension methods (receiving string type parameters) can be called as regular function or as [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates). 

Strings containing HTML elements are sanitized by default: tags/attributes/attribute values within the string that are deemed insecure are removed from the string. Removals are logged to the console.

**[DEMO](https://kooiinc.github.io/es-string-fiddler/Demo)**

## Exports
The module exports three properties:
- The default export instantiates the constructor, ready for use.
- `$SFactory` is the factory to create the constructor. The factory It takes 3 parameters (as `Object`):
  
  `const $S = $SFactory({sanitize: boolean, sanitizer: Function | null, silentFail: boolean})`.

  - `sanitize: true/false` => false: HTML in instances will not be sanitized. Default: true
  - `sanitizer: Function | null`: The function to sanitize HTML in instances. Default: internal sanitizer function.
  - `silentFail: true/false` =>  false: sanitation error message strings may be returned. Default: false
- `$SNoHTML`: instantiates the constructor *without default HTML sanitation*, ready for use

## Import & initialize

There are *three flavors* of this library. One for scripts with type `module` or projects with `"type": "module"` in package.json (ecmascript module, esm). One non module variant for the browser and one to use with `require` in NodeJS (commonjs, cjs).

For each flavor, the script is (bundled and) minified. The location of the minified scripts is `https://kooiinc.github.io/es-string-fiddler/Bundle`.

### NodeJS require
**Note**: to make this work, you probably should wrap it into some nodejs DOM-wrapper, like [jsdom](https://github.com/jsdom/jsdom) (you'll need `document` for HTML sanitation), use the the `$NoHTML`-constructur, or use `$SFactory` with your own HTML sanitizer function.

``` javascript
// after download of the bundle from
// https://kooiinc.github.io/es-string-fiddler/Bundle/index.cjs.min.js
const $S = require("[local location of the bundle]/index.cjs.min.js").$S;
// require all
const {$S, $SFactory, $SNoHTML } =
  require("[local location of the bundle]/index.cjs.min.js");
```

### ESM import
``` javascript
const $S = ( await 
  import("https://kooiinc.github.io/es-string-fiddler/Bundle/index.esm.min.js") 
).default;
// import all
import { $S, $SFactory, $SNoHTML } from "https://kooiinc.github.io/es-string-fiddler/Bundle/index.esm.min.js";
```

### Browser script
After linking the script, module is available as `window.$S`.

``` html
<script 
  src="https://kooiinc.github.io/es-string-fiddler/Bundle/index.browser.min.js">
</script>
<script>
  // use the default
  const $S = window.$S.default;
  // use the factory
  const xStringFactory = window.$S.$SFactory;
  // use the module without HTML sanitation
  const $S = window.$S.$SNoHTML;
  /** ... code using $S */
</script>
```

## Utility constructor getters/setters/methods
The constructor (for example exposed as `$S`) contains a few utility getters/setters/methods 
(see **[demo](https://kooiinc.github.io/es-string-fiddler/Demo)** for examples).
- ``$S.regExp`[template string]` ``: (*tagged template only*): create a Regular Expression (RE) from 
  a template string. The string may be a multiline string. The modifiers for the
  RE are given as Array
- `S$.extendWith(name: string, fn: Function, isMethod: boolean)`: create additional 
  instance properties or methods. 
- `S$.randomString({length: Number( default 12),
  includeUppercase: bool (default true),
  includeNumbers: bool (default false),
  includeSymbols: bool (default false),
  startAlphabetic: bool (default false) } )})`: create a random string with length [length]. 
  See demo for examples ...
- `$S.uuid4`: a getter, retrieving a [UUIDV4](https://www.sohamkamani.com/uuid-versions-explained/#v4--randomness) string
- `$S.currentMethods`: a getter, retrieving (an array of) the names of all currently existing instance getters/methods
  (including the ones you may have created), sorted alphabetically
- `$S.sanitize`: a setter to enable or disable HTML sanitation for all `$S` instances
## Instance methods
The following description is for the default exported constructor (here exposed as `$S`). 

Using `$S("[string]")` or ``$S`[string]` ``, one can use all default [String methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#instance_methods), as well as a
number of extension methods. Where a method (either default or extension) returns a string, 
it can be chained.

*Do* see examples in the **[demo](https://kooiinc.github.io/es-string-fiddler/Demo).**

The extension methods are (**Note**: '*string*' in this list mostly signifies a `$S` instance):

**Note**: *all `$S` instances* are checked for html and if html exists sanitized.

- `append(what2Append: string | $S-string)`: append [what2append] to the string
- `case`: `case` is a utility Object, containing 6 properties:
  - `lower`: string to lower case (`String.prototype.toLowerCase` equivalent)
  - `upper`: string to upper case (`String.prototype.toUpperCase` equivalent)
  - `camel`: remove spaces and/or dash and start all words of the string except the first with uppercase
    (e.g. `hello world` => `helloWorld`)   
  - `dashed`: convert a camel cased string to dashed notation (e.g. `camelCased` => `camel-cased`)
  - `wordsFirstUC`: all words of the string to upper case
  - `firstUC`: first letter of a string to upper case (if it's a - z)
- `compressHTML`: when a string contains html removes all unnecessary white space from it
- `concat`: this native string method is mentioned because the `es-string-fiddler` module allows
    calling it as a [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).
    For example ``[$S-string].concat`something ${toConcat}`; ``
- `escHTML`: escapes html for displaying it as is in a browser (if a string contains html ofcourse),
- `find({terms: Array | string | RegExp, caseSensitive: boolean (default: false))`: find anything within the string containing
   [terms]. Returns `{searched4: [[terms] stringified], hits: [n results], result: {term: at: [indexes of fount positions in the string]}}`.
- `format(...tokens: {term: replacement})`: replace any `{term}` within a string with the token(s) given
- `insert(str2insert: string | $S-string, at: number (default: 0)`: insert [string2insert] into the string at position [at] 
- `isProxied`: boolean (true) to check if a string is indeed a $S-string (`undefined` if not)
- `lower`: `String.prototype.toLowerCase` equivalent
- `quote`: `quote` is a utility object with 3 properties
   - `double`: wrap a string in double quotes (hi => "hi")
   - `single`: wrap a string in single quotes (hi => 'hi')
   - `backtick`: wrap a string in backticks (hi => \`hi\`)
- `replaceWords(initial: string, replacement: string | $S-string)`: replace all words [initial] in the string with [replacement]
- `set`: set the (intermediate) value of a string,
- `toCamelCase`: see `case.came`
- `toDashedNotation`: see `case.dashed`,
- `toTag(tagName: string, [properties: Object])`: wraps the string into a html element, using [tagName]
   and (optionally) create [properties] (like `class`, `title`, `style`) for that html element.
    
   **Note**: as with all instances, the resulting html string is *sanitized*. When a tag is 'dangerous' (e.g. `script`), the result will be
   be an error message, when 'dangerous' attributes ([properties]) are used (e.g. `onclick`), the attributes are removed from the result. 
   
   When sanitation changes the expected html, information of that change is also displayed as an error in the console. 
   
   The [demo](https://kooiinc.github.io/es-string-fiddler/Demo) contains examples of HTML-sanitation.
- `trimAll(keepLines: boolean)`: trim all whitespace outside (remove) and within (multiple to one space) the string. Will not remove the line breaks (`\n`) when `keepLines` is true. 
- `truncate({at: Number, html: boolean, wordBoundary: boolean})`: truncates the string on the [at] position (when the string is longer than [at]) and adds either `&hellip;` (html: true) or `...` to it. If [wordBoundary] is true, the string is truncated at the end of the last whole word before [at]. [html] and [wordBoundary] are default: false.
- `ucFirst`: see `case.firstUC`
- `upper`: see `case.upper`
- `value`: the plain string value of the $S-string
- `wordsFirstUC`: see `case.wordFirstUC`
