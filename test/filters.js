/**
 * Test suit for the expression filters.
 */

var expect = require('expect.js')
  , TokenParser = require('../index')
  , tokenParser
  , filters = {
      uppercase: function (value) {
        return value.toUpperCase();
      }
    , lowercase: function (value) {
        return value.toLowerCase();
      }
      // Trims a specific character from a string. 
    , trim: function (haystack, needle) {
        if (typeof needle == 'undefined') return haystack.trim();

        var chars = haystack.split('');

        while (chars[0] == needle) chars.shift();
        while (chars[chars.length - 1] == needle) chars.pop();

        return chars.join('');
      }
    };

describe('Filters()', function() {
  beforeEach(function () {
    tokenParser = new TokenParser();
    tokenParser.init();
  });

  it('should register a filter', function() {
    tokenParser.filter('uppercase', filters.uppercase);
    expect(tokenParser.filter('uppercase')).to.be.equal(filters.uppercase);
  });

  it('should replace filtered expressions', function() {
    tokenParser.filter('uppercase', filters.uppercase);

    var string = '[foo|uppercase]'
      , context = {
          foo: 'Foo!'
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(context.foo.toUpperCase());
  });

  it('should replace multiple filtered expressions', function() {
    tokenParser.filter('uppercase', filters.uppercase);
    tokenParser.filter('lowercase', filters.lowercase);

    var string = '[foo|uppercase|lowercase]'
      , context = {
          foo: 'Foo!'
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(context.foo.toLowerCase());
  });

  it('should replace argumented filtered expressions', function() {
    tokenParser.filter('trim', filters.trim);

    var string = '[foo|trim:"!"]'
      , context = {
          foo: 'Foo!'
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(filters.trim(context.foo, '!'));
  });

  it('should replace multiple argumented filtered expressions', function() {
    tokenParser.filter('trim', filters.trim);
    tokenParser.filter('uppercase', filters.uppercase);

    var string = '[foo|trim:"!"|uppercase]'
      , context = {
          foo: 'Foo!'
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(filters.trim(context.foo, '!').toUpperCase());
  });
});
