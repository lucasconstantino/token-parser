/**
 * Expression node type.
 */

function ExpressionNode(nodes, expressions) {
  this.raw = nodes;
  this.nodes = nodes;
  this.expressions = expressions;
};

/**
 * Resolves and return text.
 */
ExpressionNode.prototype.replace = function (context) {
  var expression = '', i = 0;
  for (; i < this.nodes.length; i++) {
    expression += this.nodes[i].replace(context);
  }
  return this.expressions.compile(expression)(context);
};

/**
 * Parse a token sequence to a new node.
 */
ExpressionNode.parse = function (token, index, tokens) {
  var value = ''
    , i = index + 1
    , nodes = []
    , closed = false;

  while (tokens[i] && !closed) {
    switch (tokens[i].type) {
      case '/EXPRESSION':
        closed = true;
        break;

      default:
        nodes.push(this.nodeTypes[tokens[i].type].parse.call(this, tokens[i], i, tokens));
        break;
    }

    // Make sure following token is removed from main chain.
    tokens.splice(i, 1);
  }

  // Generate new ExpressionNode with nodes and expression parser of TokenParser.
  return new ExpressionNode(nodes, this.expressions);
};

module.exports = ExpressionNode;
