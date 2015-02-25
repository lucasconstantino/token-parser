/**
 * Test suit for the compiling method.
 */

var expect = require('expect.js')
  , TokenParser = require('../index')
  , tokenParser;

describe('TokenParser#compile()', function() {
  beforeEach(function () {
    tokenParser = new TokenParser();
    tokenParser.init();
  });

  it('should compile simple strings', function() {
    var string = 'Text'
      , node = tokenParser.compile(string);

    expect(node).to.be.an(tokenParser.nodeTypes.COMPOUND);
    expect(node).to.have.property('nodes');
    expect(node.nodes).to.have.length(1);
    expect(node.nodes[0]).to.be.an(tokenParser.nodeTypes.STRING);
    expect(node).to.have.property('replace');
    expect(node.replace).to.be.a('function');
  });

  it('should compile simple expressions', function() {
    var string = '[foo.bar]'
      , node = tokenParser.compile(string);

    expect(node).to.be.an(tokenParser.nodeTypes.COMPOUND);
    expect(node).to.have.property('nodes');
    expect(node.nodes).to.have.length(1);
    expect(node.nodes[0]).to.be.an(tokenParser.nodeTypes.EXPRESSION);
    expect(node).to.have.property('replace');
    expect(node.replace).to.be.a('function');
  });

  it('should compile recursive expressions', function() {
    var string = '[foo[bar]]'
      , node = tokenParser.compile(string);

    // Note that this is exactly equals to the simple expression test.
    expect(node).to.be.an(tokenParser.nodeTypes.COMPOUND);
    expect(node).to.have.property('nodes');
    expect(node.nodes).to.have.length(1);
    expect(node.nodes[0]).to.be.an(tokenParser.nodeTypes.EXPRESSION);
    expect(node).to.have.property('replace');
    expect(node.replace).to.be.a('function');
  });

  it('should compile multiple expressions', function() {
    var string = '[foo] & [bar]'
      , node = tokenParser.compile(string);

    // Note that this is exactly equals to the simple expression test.
    expect(node).to.be.an(tokenParser.nodeTypes.COMPOUND);
    expect(node).to.have.property('nodes');
    expect(node.nodes).to.have.length(3);
    expect(node.nodes[0]).to.be.an(tokenParser.nodeTypes.EXPRESSION);
    expect(node.nodes[1]).to.be.an(tokenParser.nodeTypes.STRING);
    expect(node.nodes[2]).to.be.an(tokenParser.nodeTypes.EXPRESSION);
    expect(node).to.have.property('replace');
    expect(node.replace).to.be.a('function');
  });
});
