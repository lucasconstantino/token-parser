/**
 * Token Parser
 */

var ExpressionParser = require('./lib/expression-parser')
  , Lexer = require('./lib/lexer')
  , types = require('./lib/node-types')
  , CompoundType = types['COMPOUND'];

function TokenParser(cache) {
  this.lexer = new Lexer();
  this.scanCache = cache === false ? false : {};
  this.compileCache = cache === false ? false : {};
  this.errorHandlers = [];
  this.nodeTypes = {};
  this.expressions = new ExpressionParser(cache);
};

TokenParser.prototype.init = function () {
  this.lexer.init();

  // Register core node types.
  for (var i in types) types.hasOwnProperty(i) && this.nodeType(i, types[i]);
};

TokenParser.prototype.nodeType = function (name, compiler) {
  return typeof compiler === 'undefined' ? this.nodeTypes[name] : (this.nodeTypes[name] = compiler);
  if (typeof compiler === 'undefined') return this.nodeTypes[name];
  if (typeof compiler === false) {
    var compiler = this.nodeTypes[name];
    delete this.nodeTypes[name];
    return compiler;
  }
  return (this.nodeTypes[name] = compiler);
};

TokenParser.prototype.filter = function (name, filter) {
  if (typeof filter === 'undefined') return this.expressions.filters[name];
  if (typeof filter === false) {
    var filter = this.expressions.filters[name];
    delete this.expressions.filters[name];
    return filter;
  }
  return (this.expressions.filters[name] = filter);
};

TokenParser.prototype.scan = function (text) {
  if (!this.lexer && this.throwError('TokenParser must be initialized')) return;

  // Early cached return.
  if (this.scanCache && this.scanCache[text]) return this.scanCache[text];

  // Start new lexer.
  this.lexer.setInput(text);

  var tokens = []
    , lexed;

  while (typeof (lexed = this.lexer.lex()) !== 'undefined') tokens.push(lexed);

  // Cache result.
  if (this.scanCache) this.scanCache[text] = tokens;

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

  // Early cached return.
  if (this.compileCache && this.compileCache[text]) return this.compileCache[text];

  // Scan and parse text for nodes.
  // Make sure only one entry point node (compound) is resolved.
  var nodes = this.parse(this.scan(text))
    , compound = new CompoundType(nodes);

  // Cache result.
  if (this.compileCache) this.compileCache[text] = compound;

  return compound;
};

TokenParser.prototype.replace = function (text, scope) {
  return this.compile(text).replace(scope);
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
