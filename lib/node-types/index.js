/**
 * Exposes core node types parsers.
 */

var i = 0;

module.exports = {
  'STRING': require('./string')
, 'COMPOUND': require('./compound')
, 'EXPRESSION': require('./expression')
};
