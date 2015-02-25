/**
 * Token Parser
 */

var expressionParser = require('angular-expressions')
  , Lexer = require('./lib/lexer')
  , types = require('./lib/node-types')
  , CompoundType = types['COMPOUND'];

function TokenParser() {
  this.lexer = new Lexer();
  this.errorHandlers = [];
  this.nodeTypes = [];
};

TokenParser.prototype.init = function () {
  this.lexer.init();

  // Register core node types.
  for (var i in types) types.hasOwnProperty(i) && this.addNodeType(i, types[i]);
};

TokenParser.prototype.addNodeType = function (name, compiler) {
  this.nodeTypes[name] = compiler;
};

TokenParser.prototype.scan = function (text) {
  if (!this.lexer && this.throwError('TokenParser must be initialized')) return;

  // Start new lexer.
  this.lexer.setInput(text);

  var tokens = []
    , lexed;

  while (typeof (lexed = this.lexer.lex()) !== 'undefined') tokens.push(lexed);

  return tokens;
};

TokenParser.prototype.parse = function (tokens) {
  var node, nodes = [], i = 0;

  while (i < tokens.length) {
    if (node = types[tokens[i].type].parse.call(this, tokens[i], i, tokens)) nodes.push(node);
    i++;
  }

  return nodes;
};

TokenParser.prototype.compile = function (text) {
  // Scan and parse text for nodes.
  var nodes = this.parse(this.scan(text));

  // Make sure only one entry point node is resolved.
  return new CompoundType(nodes);
};

TokenParser.prototype.replace = function (text, context) {
  return this.compile(text).replace(context);
};

TokenParser.prototype.addErrorHandler = function (callback) {
  this.errorHandlers.push(callback);
};

TokenParser.prototype.removeErrorHandler = function (callback) {
  var index;
  if (index = this.errorHandlers.indexOf(callback) > -1) this.errorHandlers.splice(index, 1);
};

TokenParser.prototype.throwError = function () {
  var e, args = [].slice.call(arguments);
  for (e = 0; e < this.errorHandlers.length; e++) {
    if (this.errorHandlers[e].apply(this, args) === true) return true;
  }
  throw new Error(args[0]);
};

module.exports = TokenParser;
