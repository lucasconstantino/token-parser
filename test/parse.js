/**
 * Test suit for the parsing method.
 */

var expect = require('expect.js')
  , TokenParser = require('../index')
  , tokenParser;

describe('TokenParser#parse()', function() {
  beforeEach(function () {
    tokenParser = new TokenParser();
    tokenParser.init();
  });

  it('should parse simple strings', function() {
    var string = 'Text'
      , tokens = tokenParser.scan(string)
      , nodes  = tokenParser.parse(tokens);

    expect(nodes).to.have.length(1);
    expect(nodes[0]).to.be.an(tokenParser.nodeTypes.STRING);
    expect(nodes[0]).to.have.property('raw', string);
  });

  it('should parse simple expressions', function() {
    var string = '[foo.bar]'
      , tokens = tokenParser.scan(string)
      , nodes  = tokenParser.parse(tokens)
      , expression = nodes[0];

    expect(nodes).to.have.length(1);
    expect(expression).to.be.an(tokenParser.nodeTypes.EXPRESSION);

    // And expression always has children. For simple expressions, there is
    // only one STRING child.
    expect(expression.nodes).to.be.an('array');
    expect(expression.nodes).to.have.length(1);
    expect(expression.nodes[0]).to.be.an(tokenParser.nodeTypes.STRING);
    expect(expression.nodes[0]).to.have.property('raw', 'foo.bar');
  });

  it('should parse recursive expressions', function() {
    var string = '[foo[bar]]'
      , tokens = tokenParser.scan(string)
      , nodes  = tokenParser.parse(tokens)
      , expression = nodes[0];

    expect(nodes).to.have.length(1);
    expect(expression).to.be.an(tokenParser.nodeTypes.EXPRESSION);

    // Expressions can have multiple node children. Some of these children
    // can be expressions of their own.
    expect(expression.nodes).to.be.an('array');
    expect(expression.nodes).to.have.length(2);
    expect(expression.nodes[0]).to.be.an(tokenParser.nodeTypes.STRING);
    expect(expression.nodes[0]).to.have.property('raw', 'foo');
    expect(expression.nodes[1]).to.be.an(tokenParser.nodeTypes.EXPRESSION);
    expect(expression.nodes[1]).to.have.property('nodes');
    expect(expression.nodes[1].nodes).to.have.length(1);
    expect(expression.nodes[1].nodes[0]).to.be.an(tokenParser.nodeTypes.STRING);
    expect(expression.nodes[1].nodes[0]).to.have.property('raw', 'bar');
  });

  it('should parse multiple expressions', function() {
    var string = '[foo] & [bar]'
      , tokens = tokenParser.scan(string)
      , nodes  = tokenParser.parse(tokens)
      , i = 0;

    expect(nodes).to.have.length(3);
    expect(nodes[i++]).to.be.an(tokenParser.nodeTypes.EXPRESSION); // '[foo]'
    expect(nodes[i++]).to.be.an(tokenParser.nodeTypes.STRING);     // ' & '
    expect(nodes[i++]).to.be.an(tokenParser.nodeTypes.EXPRESSION); // '[bar]'
  });
});
