/**
 * Test suite for nested token strings.
 */

var TokenParser = require('../../index')
  , string = '[f[bar]]'
  , context = {
      foo: 'Foo!'
    , bar: 'oo'
    }
  , tokenParser;

module.exports = {
  name: 'Nested tokens string replace',
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
