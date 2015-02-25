/**
 * Ends the expression state.
 */

var states = require('../states');

module.exports = {
  name: 'Expression end',
  regex: /\]/,
  action: function (match) {
    this.popState(states.EXPRESSION);
    return {
      type: '/EXPRESSION'
    };
  },
  start: [states.EXPRESSION]
};
