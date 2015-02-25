/**
 * Starts the expression state.
 */

var states = require('../states');

module.exports = {
  name: 'Expression start',
  regex: /\[/,
  action: function (match) {
    this.pushState(states.EXPRESSION);
    return {
      type: 'EXPRESSION'
    };
  },
  start: [0, states.EXPRESSION]
};
