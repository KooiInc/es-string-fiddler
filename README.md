# (chainable) String extensions using ES Proxy

`es-string-fiddler` is a utility adding some nifty properties/methods to regular ECMAScript (ES) strings (String Objects). It uses ES [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for that.

Properties and/or methods (either native or extensions) returning a string can be [chained](https://www.geeksforgeeks.org/method-chaining-in-javascript/). 

The 'constructor' (here `$S`) and instance extension methods (receiving string type parameters) can be called as regular function or as [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates). 

Strings containing HTML elements are sanitized by default: tags/attributes/attribute values within the string that are deemed insecure are removed from the string. Removals are logged to the console.

**[DEMO](https://kooiinc.github.io/es-string-fiddler/Demo)**

## Import & initialize

There are *three flavors* of this library. One for scripts with type `module` or projects with `"type": "module"` in package.json (ecmascript module, esm). One for the browser and one to use with `require` in NodeJS (commonjs, cjs).

For each flavor, the script is (bundled and) minified. The location of the minified scripts is `https://kooiinc.github.io/es-string-fiddler/Bundle`.

The cjs or browser library are exported as `$S`.  

### NodeJS require
**Note**: to make this work, you probably should wrap it into some nodejs DOM-wrapper, like [jsdom](https://github.com/jsdom/jsdom) (you'll need `document` for HTML sanitation).

``` javascript
// after download of the bundle from 
// https://kooiinc.github.io/es-string-fiddler/Bundle/index.cjs.min.js
const $S = require("[local location of the bundle]/index.cjs.min.js").$S;
```

### ESM import
``` javascript
const $S = ( await 
  import("https://kooiinc.github.io/es-string-fiddler/Bundle/index.esm.min.js") 
).default;
```

### Browser script
After linking the script, the `$S` constructor is available as `window.$S`.

It is advised to localize `$S` before usage to not 'pollute' the global namespace (see subsequent code).
``` html
<script 
  src="https://kooiinc.github.io/es-string-fiddler/Bundle/index.browser.min.js">
</script>
<script>
  // localize $S
  const $S = window.$S;
  delete window.$S;
  /** ... code */
</script>
```

## Methods

Using `$S` string, one can use all default [string methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#instance_methods), as well as a
number of extension methods. Where a method (either default or extension) returns a string, 
it can be chained.

*Do* see examples in the **[demo](https://kooiinc.github.io/es-string-fiddler/Demo).**



The extension methods are (**Note**: '*string*' in this list mostly signifies a wrapped $S-string):

**Note**: *all `$S` instances* are checked for html and if html exists sanitized.

- `addFN(name: string, fn: function)` OR
  
  `addMethod(name: string, fn: function)`: 
  add extra method for usage in $S-strings
- `addProp(name: string, fn: function)`: add extra property for usage in $S-strings
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
- `createRegExp`: create a regular expression from a multiline regular expression string,
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
   and (optionally) create [properties] (like `class`, `title`, `stype`) for that html element.
    
   **Note**: as with all instances, the resulting html string is *sanitized*. When a tag is 'dangerous' (e.g. `script`), the result will be
   be an error message, when 'dangerous' attributes ([properties]) are used (e.g. `onclick`), the attributes are removed from the result. 
   
   When sanitation changes the expected html, information of that change is also displayed as an error in the console. 
   
   The [demo](https://kooiinc.github.io/es-string-fiddler/Demo) contains examples of HTML-sanitation.
- `truncate`,
- `ucFirst`: see `case.ucFirst`,
- `upper`: see `case.upper`,
- `value`: the plain string value of the $S-string ,
- `wordsFirstUC`: see `case.wordFirstUC`
