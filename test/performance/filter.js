/**
 * Test suite for filtered token strings.
 */

var TokenParser = require('../../index')
  , string = '[foo|uppercase]'
  , context = { foo: 'Foo!' }
  , tokenParser;

/**
 * Initializes token parser with filters.
 */
function init() {
  tokenParser.init();
  tokenParser.filter('uppercase', uppercase)
}

/**
 * Uppercase filter.
 */
function uppercase(haystack) {
  return haystack.toUpperCase();
}

module.exports = {
  name: 'Filtered tokens string replace',
  maxTime: 5,
  tests: {
    'With cache': {
      cache: true,
      onStart: function () {
        tokenParser = new TokenParser();
        init();
      },
      fn: function () {
        return tokenParser.replace(string, context);
      }
    },
    'Without cache': {
      cache: false,
      onStart: function () {
        tokenParser = new TokenParser(false);
        init();
      },
      fn: function () {
        return tokenParser.replace(string, context);
      }
    }
  }
};
