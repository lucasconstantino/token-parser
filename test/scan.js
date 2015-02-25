/**
 * Test suit for the scanning method.
 */

var expect = require('expect.js')
  , TokenParser = require('../index')
  , tokenParser;

describe('TokenParser#scan()', function() {
  beforeEach(function () {
    tokenParser = new TokenParser();
    tokenParser.init();
  });

  it('should scan simple strings', function(){
    var string = 'Text'
      , tokens = tokenParser.scan(string);

    expect(tokens).to.have.length(string.length);

    tokens.forEach(function (token, i) {
      expect(token).to.have.property('type', 'STRING');
      expect(token).to.have.property('value', string.charAt(i));
    });
  });

  it('should scan simple expressions', function(){
    var string = '[foo]'
      , tokens = tokenParser.scan(string)
      , i = 0;

    expect(tokens).to.have.length(string.length);
    expect(tokens[i++]).to.have.property('type', 'EXPRESSION');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', '/EXPRESSION');
  });

  it('should scan composed expressions', function(){
    var string = '[foo.bar]'
      , tokens = tokenParser.scan(string)
      , i = 0;

    expect(tokens).to.have.length(string.length);
    expect(tokens[i++]).to.have.property('type', 'EXPRESSION');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', '/EXPRESSION');
  });

  it('should scan recursive expressions', function(){
    var string = '[foo.[bar]]'
      , tokens = tokenParser.scan(string)
      , i = 0;

    expect(tokens).to.have.length(string.length);
    expect(tokens[i++]).to.have.property('type', 'EXPRESSION');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'EXPRESSION');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', '/EXPRESSION');
    expect(tokens[i++]).to.have.property('type', '/EXPRESSION');
  });

  it('should scan multiple expressions', function(){
    var string = '[foo] & [bar]'
      , tokens = tokenParser.scan(string)
      , i = 0;

    expect(tokens).to.have.length(string.length);
    expect(tokens[i++]).to.have.property('type', 'EXPRESSION');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', '/EXPRESSION');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'EXPRESSION');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', 'STRING');
    expect(tokens[i++]).to.have.property('type', '/EXPRESSION');
  });
});
