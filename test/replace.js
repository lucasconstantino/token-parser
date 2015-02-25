/**
 * Test suit for the replacing method.
 */

var expect = require('expect.js')
  , TokenParser = require('../index')
  , tokenParser;

describe('TokenParser#replace()', function() {
  beforeEach(function () {
    tokenParser = new TokenParser();
    tokenParser.init();
  });

  it('should replace simple strings', function() {
    var string = 'Text'
      , replaced = tokenParser.replace(string);

    expect(replaced).to.be.equal(string);
  });

  it('should replace simple expressions', function() {
    var string = '[foo]'
      , context = {
          foo: 'Foo!'
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(context.foo);
  });

  it('should replace compound expressions', function() {
    var string = '[foo.bar]'
      , context = {
          foo: {
            bar: 'Foo bar!'
          }
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(context.foo.bar);
  });

  it('should replace recursive expressions', function() {
    var string = '[fo[bar]]'
      , context = {
          foo: 'Foo!',
          bar: 'o'
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(context.foo);
  });

  it('should replace multiple expressions', function() {
    var string = '[foo] & [bar]'
      , context = {
          foo: 'Foo!',
          bar: 'Bar!'
        }
      , replaced = tokenParser.replace(string, context);

    expect(replaced).to.be.equal(context.foo + ' & ' + context.bar);
  });

  it('should replace composed contexts', function() {
    var string = '[foo] & [bar]'
      , context = {
          foo: 'Foo!'
        , bar: 'Bar!'
        }
      , secondContext = {
          bar: 'Bar replacement!'
        }
      , replaced = tokenParser.replace(string, context, secondContext);

    expect(replaced).to.be.equal(context.foo + ' & ' + secondContext.bar);
  });
});
