/**
 * Compound node type.
 */

function CompoundNode(nodes) {
  this.raw = this.nodes = nodes;
};

/**
 * Replace all nodes and join results.
 * @param {Object} [scope] The scope to be looked up for replacements.
 */
CompoundNode.prototype.replace = function (scope) {
  var result = ''
    , i = 0;

  for (; i < this.nodes.length; i++) result += this.nodes[i].replace(scope);

  return result;
};

module.exports = CompoundNode;
