/**
 * Exposes core rules in execution order.
 */

module.exports = [
  require('./expression-start'),
  require('./expression-end'),
  require('./string'),
  // require('./token'),
  // require('./token-argument'),
  // require('./filter'),
  // require('./filter-argument'),
  // require('./string-delimiter'),
  // require('./static-text'),
  require('./end'),
];
