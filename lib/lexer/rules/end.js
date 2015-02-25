/**
 * End of file.
 */

var result;

module.exports = {
  name: 'End',
  regex: /$/,
  action: function (match) {
    var postponed = this.expedite();
    if (postponed.length) return {
      type: 'STRING',
      value: postponed.join('')
    };
  },
  start: [0]
};
