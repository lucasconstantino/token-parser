# TokenParser
TokenParser is a library to replace tokenized string. It has a build in extensible lexer to parse text and find expressions. By default, it will expect expressions encapsulated with ```[``` and ```]```, and will use [angular-expression](https://www.npmjs.com/package/angular-expressions) to parse the expressions.

## Install
TokenParser is available for both **node.js** and **browser** environments, throught a [browserified](http://browserify.org/) bundle available at ```dist/token-parser.js``` (and it's minified version).

### NPM
Simply install it via ```npm install token-parser``` and use it with ```require('token-parser')```.

### Bower
Install it with ```bower install token-parser``` and add it to your project with a common script tag. The ```TokenParser``` will be made available globally.

## Usage
```js
var TokenParser = require('token-parser');
var parser = new TokenParser();

// Do not forget to initialize it. This step is necessary so that extending
// lexer could be possible.
parser.init();

// "Text"
parser.replace('Text');

// "undefined" 
parser.replace('[foo]');

// "Text"
parser.replace('[foo]', {
  foo: 'Text'
});

// "Text"
parser.replace('[foo.bar]', {
  foo: {
    bar: 'Text'
  }
});

// "Text foo!"
parser.replace('Text [foo]', {
  foo: 'foo!'
});

// "Text"
parser.replace('[varia[foo]]', {
  foo: 'ble',
  variable: 'Text'
});

// FILTERS
//--------

parser.filter('uppercase', function (value) {
  return value.toUpperCase();
});

// "Text FOO!"
parser.replace('Text [foo|uppercase]', {
  foo: 'foo!'
});
```
