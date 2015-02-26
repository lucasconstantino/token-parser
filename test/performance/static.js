/**
 * Test suite for static strings.
 */

var TokenParser = require('../../index')
  , string = 'Static text'
  , tokenParser;

module.exports = {
  name: 'Static string replace',
  maxTime: 5,
  tests: {
    'With cache': {
      cache: true,
      onStart: function () {
        tokenParser = new TokenParser();
        tokenParser.init();
      },
      fn: function () {
        return tokenParser.replace(string);
      }
    },
    'Without cache': {
      cache: false,
      onStart: function () {
        tokenParser = new TokenParser(false);
        tokenParser.init();
      },
      fn: function () {
        return tokenParser.replace(string);
      }
    }
  }
};
