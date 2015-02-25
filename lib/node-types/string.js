/**
 * String node type.
 */

function StringNode(raw) {
  this.raw = raw;
};

/**
 * Resolves and return text.
 */
StringNode.prototype.replace = function () {
  return this.raw;
};

/**
 * Parse a token sequence to a new node.
 */
StringNode.parse = function (token, index, tokens) {
  var value = token.value
    , i = index + 1;

  // Join all following string chars.
  while (tokens[i] && tokens[i].type === 'STRING') value += tokens.splice(i, 1)[0].value || '';

  return new StringNode(value);
};

module.exports = StringNode;
