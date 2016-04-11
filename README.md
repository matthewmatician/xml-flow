# xml-flow
[![NPM version][npm-image]][npm-url]  [![Build status][travis-image]][travis-url]  [![Test coverage][coveralls-image]][coveralls-url]

Dealing with XML data can be frustrating. Especially if you have a whole-lot of it. Most XML readers work on the entire XML document as a String: this can be problematic if you need to read very large XML files. With xml-flow, you can use streams to only load a small part of an XML document into memory at a time.

xml-flow has only one dependency, [sax-js](https://github.com/isaacs/sax-js). This means it will run nicely on windows environments.

## Installation

```
$ npm install xml-flow
```

## Getting started
xml-flow tries to keep the parsed output as simple as possible. Here's an example:

### Input File
```xml
<root>
  <person>
    <name>Bill</name>
    <id>1</id>
    <age>27</age>
  </person>
  <person>
    <name>Sally</name>
    <id>2</id>
    <age>29</age>
  </person>
  <person>
    <name>Kelly</name>
    <id>3</id>
    <age>37</age>
  </person>
</root>
```

### Usage
```js
var fs = require('fs')
  , flow = require('xml-flow')
  , inFile = fs.createReadStream('./your-xml-file.xml')
  , xmlStream = flow(inFile)
;

xmlStream.on('tag:person', function(person) {
  console.log(person);
});
```

### Output
```js
{name: 'Bill', id: '1', age: '27'}
{name: 'Sally', id: '2', age: '29'}
{name: 'Kelly', id: '3', age: '37'}
```

## Features
### Attribute-only Tags
The above example shows the of an XML document with no attributes. What about the opposite?

##### Input
```XML
<root>
    <person name="Bill" id="1" age="27"/>
    <person name="Sally" id="2" age="29"/>
    <person name="Kelly" id="3" age="37"/>
</root>
```

##### Output
```js
{name: 'Bill', id: '1', age: '27'}
{name: 'Sally', id: '2', age: '29'}
{name: 'Kelly', id: '3', age: '37'}
```

### Both Attributes and Subtags
When you have tags that have both Attributes and subtags, here's how the output looks:

##### Input
```XML
<root>
    <person name="Bill" id="1" age="27">
        <friend id="2"/>
    </person>
    <person name="Sally" id="2" age="29">
        <friend id="1"/>
        <friend id="3"/>
    </person>
    <person name="Kelly" id="3" age="37">
        <friend id="2"/>
        Kelly likes to ride ponies.
    </person>
</root>
```

##### Output
```js
{
    $attrs: {name: 'Bill', id: '1', age: '27'},
    friend:'2'
}
{
    $attrs: {name: 'Sally', id: '2', age: '29'},
    friend: ['1', '3']
}
{
    $attrs: {name: 'Kelly', id: '3', age: '37'},
    friend: '2',
    $text: 'Kelly likes to ride ponies.'
}
```

### Read as Markup
If you need to keep track of sub-tag order within a tag, or if it makes sense to have a more markup-style object model, here's how it works:

##### Input
```HTML
<div class="science">
    <h1>Title</h>
    <p>Some introduction</p>
    <h2>Subtitle</h>
    <p>Some more text</p>
    This text is not inside a p-tag.
</div>
```

##### Output
```js
{
    $attrs: {class: 'science'},
    $markup: [
        {$name: 'h1', $text: 'Title'},
        {$name: 'p', $text: 'Some Introduction'},
        {$name: 'h2', $text: 'Subtitle'},
        {$name: 'p', $text: 'Some more text'},
        'This text is not inside a p-tag.'
    ]
}
```

## Options
You may add a second argument when calling the function, as `flow(stream, options)`. All are optional:
* `strict` - Boolean. Default = false. Refer to sax-js documentation for more info.
* `lowercase` - Boolean. Default = true. When not in strict mode, all tags are lowercased, or uppercased when set to false.
* `trim` - Boolean. Default = true. Whether or not to trim leading and trailing whitespace from text
* `normalize` - Boolean. Default = true. Turns all whitespace into a single space.
* `preserveMarkup` - One of flow.ALWAYS, flow.SOMETIMES (default), or flow.NEVER. When set to ALWAYS, All subtags and text are stored in the $markup property with their original order preserved. When set to NEVER, all subtags are collected as separate properties. When set to SOMETIMES, markup is preserved only when subtags have non-contiguous repetition.
* `simplifyNodes` - Boolean. Default = true. Whether to drop empty $attrs, pull properties out of the $attrs when there are no subtags, or to only use a String instead of an object when $text is the only property.
* `useArrays` - One of flow.ALWAYS, flow.SOMETIMES (default), or flow.NEVER. When set to ALWAYS, All subtags and text are enclosed in arrays, even if there's only one found. When set to NEVER, only the first instance of a subtag or text node are kept. When set to SOMETIMES, arrays are used only when multiple items are found. *NOTE:* When set to NEVER, `preserveMarkup` is ignored.
* `cdataAsText` - Boolean. Default = false. Appends CDATA text to other nearby text instead of putting it into its own `$cdata` property. NOTE: If you plan to run the `toXml()` function on data that has CDATA in it, you might. Consider a more robust `escape` function than what is provided. See below for more information.

## Events
All events can be listened to via common nodeJS EventEmitter syntax.

`tag:<<TAG_NAME>>` - Fires when any `<<TAG_NAME>>` is parsed. Note that this is case sensitive. If the `lowercase` option is set, make sure you listen to lowercase tag names. If the `strict` option is set, match the case of the tags in your document.

`end` - Fires when the end of the stream has been reached.

`error` - Fires when there are errors.

`query:<<QUERY>>` - Coming soon...

## toXml Utility
`toXml(node, options)` - Returns a string, XML-encoding of an object. Encodes $name, $attrs, $text, and $markup as you would expect. the following `options` are available:

* `indent` – How to indent tags for pretty-printing, use `'  '` for two-spaces, or `'\t'` for tabs. If no indent value is provided, output will not be pretty-printed.
* `selfClosing` – Whether to self close tags (like `<br/>` instead of `<br></br>`) whenever possible. Defaults to true.
* `escape` – Optionally provide an escape function for all text, to prevent malformed XML. As a default, a very simplistic escape function has been provided. You can provide a more robust escape function that suits your needs. For example, take a look at [he](https://github.com/mathiasbynens/he). To turn escaping off, provide a simple, non-escaping function like this: `function(str) { return str; }`

## Authors

  - [Matthew Larson](https://github.com/matthewmatician)

# License

  MIT

[npm-image]: https://img.shields.io/npm/v/xml-flow.svg?style=flat
[npm-url]: https://npmjs.org/package/xml-flow
[travis-image]: https://img.shields.io/travis/matthewmatician/xml-flow.svg?style=flat
[travis-url]: https://travis-ci.org/matthewmatician/xml-flow
[coveralls-image]: https://img.shields.io/coveralls/matthewmatician/xml-flow.svg?style=flat
[coveralls-url]: https://coveralls.io/r/matthewmatician/xml-flow
