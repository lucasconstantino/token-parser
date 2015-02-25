/**
 * Expression Parser factory.
 */

var angularExpressions = require('angular-expressions');

/**
 * ExpressionParser main class.
 */
function ExpressionParser(cache) {
  var filters = {}
    , Lexer   = angularExpressions.Lexer
    , Parser  = angularExpressions.Parser
    , lexer   = new Lexer({})
    , parser  = new Parser(lexer, getFilter);

  /**
   * Compiles src and returns a function that executes src on a target object.
   * The compiled function is cached under compile.cache[src] to speed up further calls.
   *
   * @param {string} src
   * @returns {function}
   */
  function compile(src) {
    var cached;

    if (typeof src !== "string") {
      throw new TypeError("src must be a string, instead saw '" + typeof src + "'");
    }

    if (!compile.cache) return parser.parse(src);

    cached = compile.cache[src];
    if (!cached) cached = compile.cache[src] = parser.parse(src);

    return cached;
  }

  /**
   * Just a stub of angular's $filter-method
   *
   * @private
   * @param {string} name
   * @returns {function}
   */
  function getFilter(name) {
    return filters[name];
  }

  /**
   * A cache containing all compiled functions. The src is used as key.
   * Set this on false to disable the cache.
   *
   * @type {object}
   */
  compile.cache = cache === false ? false : {};

  this.Lexer   = Lexer;
  this.Parser  = Parser;
  this.compile = compile;
  this.filters = filters;
}

module.exports = ExpressionParser;
