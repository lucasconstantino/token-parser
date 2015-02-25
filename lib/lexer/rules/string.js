/**
 * Matches a string.
 */

var states = require('../states');

module.exports = {
  name: 'String',
  regex: /./ig,
  action: function (match) {
    return {
      type: 'STRING',
      value: match
    }
  },
  start: [0, states.EXPRESSION]
};