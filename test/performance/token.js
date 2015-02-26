/**
 * Test suite for tokenized strings.
 */

var TokenParser = require('../../index')
  , string = '[foo]'
  , context = { foo: 'Foo!' }
  , tokenParser;

module.exports = {
  name: 'Tokenized string replace',
  maxTime: 5,
  tests: {
    'With cache': {
      cache: true,
      onStart: function () {
        tokenParser = new TokenParser();
        tokenParser.init();
      },
      fn: function () {
        return tokenParser.replace(string, context);
      }
    },
    'Without cache': {
      cache: false,
      onStart: function () {
        tokenParser = new TokenParser(false);
        tokenParser.init();
      },
      fn: function () {
        return tokenParser.replace(string, context);
      }
    }
  }
};
