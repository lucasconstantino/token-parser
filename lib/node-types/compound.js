/**
 * Compound node type.
 */

var extend = require('extend');

function CompoundNode(nodes) {
  this.raw = this.nodes = nodes;
};

/**
 * Replace all nodes and join results.
 */
CompoundNode.prototype.replace = function () {
  var result = ''
    , i = 0
    , context
    , args = [].slice.call(arguments);

  // Make sure we do a deep merge but keep contexts as is.
  args.unshift({});
  args.unshift(true);
  context = extend.apply(extend, args);

  for (; i < this.nodes.length; i++) result += this.nodes[i].replace(context);

  return result;
};

module.exports = CompoundNode;
