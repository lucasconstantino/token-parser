/**
 * TokenParser - A tokenized string parser for JavaScript
 * @name token-parser
 * @version v0.0.1
 * @link https://github.com/lucasconstantino/token-parser
 * @license MIT
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TokenParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Token Parser
 */

var ExpressionParser = require('./lib/expression-parser')
  , Lexer = require('./lib/lexer')
  , types = require('./lib/node-types')
  , CompoundType = types['COMPOUND'];

function TokenParser(cache) {
  this.lexer = new Lexer();
  this.errorHandlers = [];
  this.nodeTypes = {};
  this.expressions = new ExpressionParser(cache);
};

TokenParser.prototype.init = function () {
  this.lexer.init();

  // Register core node types.
  for (var i in types) types.hasOwnProperty(i) && this.nodeType(i, types[i]);
};

TokenParser.prototype.nodeType = function (name, compiler) {
  return typeof compiler === 'undefined' ? this.nodeTypes[name] : (this.nodeTypes[name] = compiler);
  if (typeof compiler === 'undefined') return this.nodeTypes[name];
  if (typeof compiler === false) {
    var compiler = this.nodeTypes[name];
    delete this.nodeTypes[name];
    return compiler;
  }
  return (this.nodeTypes[name] = compiler);
};

TokenParser.prototype.filter = function (name, filter) {
  if (typeof filter === 'undefined') return this.expressions.filters[name];
  if (typeof filter === false) {
    var filter = this.expressions.filters[name];
    delete this.expressions.filters[name];
    return filter;
  }
  return (this.expressions.filters[name] = filter);
};

TokenParser.prototype.scan = function (text) {
  if (!this.lexer && this.throwError('TokenParser must be initialized')) return;

  // Start new lexer.
  this.lexer.setInput(text);

  var tokens = []
    , lexed;

  while (typeof (lexed = this.lexer.lex()) !== 'undefined') tokens.push(lexed);

  return tokens;
};

TokenParser.prototype.parse = function (tokens) {
  var node, nodes = [], i = 0;

  while (i < tokens.length) {
    if (node = types[tokens[i].type].parse.call(this, tokens[i], i, tokens)) nodes.push(node);
    i++;
  }

  return nodes;
};

TokenParser.prototype.compile = function (text) {
  // Scan and parse text for nodes.
  var nodes = this.parse(this.scan(text));

  // Make sure only one entry point node is resolved.
  return new CompoundType(nodes);
};

TokenParser.prototype.replace = function (text) {
  var compound = this.compile(text)
    , args = [].slice.call(arguments, 1);

  return compound.replace.apply(compound, args);
};

TokenParser.prototype.addErrorHandler = function (callback) {
  this.errorHandlers.push(callback);
};

TokenParser.prototype.removeErrorHandler = function (callback) {
  var index;
  if (index = this.errorHandlers.indexOf(callback) > -1) this.errorHandlers.splice(index, 1);
};

TokenParser.prototype.throwError = function () {
  var e, args = [].slice.call(arguments);
  for (e = 0; e < this.errorHandlers.length; e++) {
    if (this.errorHandlers[e].apply(this, args) === true) return true;
  }
  throw new Error(args[0]);
};

module.exports = TokenParser;

},{"./lib/expression-parser":2,"./lib/lexer":3,"./lib/node-types":12}],2:[function(require,module,exports){
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

},{"angular-expressions":14}],3:[function(require,module,exports){
/**
 * Expands Lexer.
 */

var Lexer = module.exports = require('lex')
  , states = require('./states')
  , rules = require('./rules');

Lexer.prototype.init = function () {
  this.postponed = [];
  this.errorHandlers = [];
  this.states = states;

  // @todo: throw event to allow changes on rules before registering.
  for (var r = 0; r < rules.length; r++) {
    this.addRule(rules[r].regex, rules[r].action, rules[r].start);
  }
};

Lexer.prototype.pushState = function (state) {
  (this.stateTrail = this.stateTrail || [0]).push((this.state = state));
};

Lexer.prototype.popState = function (state) {
  this.stateTrail = this.stateTrail || [0];

  while(state && this.stateTrail[this.stateTrail.length - 1] !== state) {
    this.stateTrail.splice(-1);
  }

  this.stateTrail.splice(-1);
  this.state = this.stateTrail[this.stateTrail.length - 1] || 0;
};

Lexer.prototype.hasState = function (state) {
  return ~this.stateTrail.indexOf(state);
};

Lexer.prototype.postpone = function (value) {
  this.postponed.push(value);
};

Lexer.prototype.expedite = function () {
  return this.postponed.splice(0);
};

Lexer.prototype.addErrorHandler = function (callback) {
  this.errorHandlers.push(callback);
};

Lexer.prototype.removeErrorHandler = function (callback) {
  var index;
  if (index = this.errorHandlers.indexOf(callback) > -1) this.errorHandlers.splice(index, 1);
};

Lexer.prototype.throwError = function (char) {
  var e, args = [].slice.call(arguments);
  for (e = 0; e < this.errorHandlers.length; e++) {
    if (this.errorHandlers[e].apply(this, args) === true) return true;
  }
  if (this.state) throw new Error("Unexpected character at index " + (this.index - 1) + ": " + char);
};

// Map main lexical error handler.
Lexer.defunct = Lexer.prototype.throwError;

},{"./rules":7,"./states":9,"lex":17}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"../states":9}],6:[function(require,module,exports){
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

},{"../states":9}],7:[function(require,module,exports){
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

},{"./end":4,"./expression-end":5,"./expression-start":6,"./string":8}],8:[function(require,module,exports){
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
},{"../states":9}],9:[function(require,module,exports){
/**
 * Exposes default lexer states.
 */

module.exports = {
  STRING: 2,
  EXPRESSION: 4
}

},{}],10:[function(require,module,exports){
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

},{"extend":16}],11:[function(require,module,exports){
/**
 * Expression node type.
 */

function ExpressionNode(nodes, expressions) {
  this.raw = nodes;
  this.nodes = nodes;
  this.expressions = expressions;
};

/**
 * Resolves and return text.
 */
ExpressionNode.prototype.replace = function (context) {
  var expression = '', i = 0;
  for (; i < this.nodes.length; i++) {
    expression += this.nodes[i].replace(context);
  }
  return this.expressions.compile(expression)(context);
};

/**
 * Parse a token sequence to a new node.
 */
ExpressionNode.parse = function (token, index, tokens) {
  var value = ''
    , i = index + 1
    , nodes = []
    , closed = false;

  while (tokens[i] && !closed) {
    switch (tokens[i].type) {
      case '/EXPRESSION':
        closed = true;
        break;

      default:
        nodes.push(this.nodeTypes[tokens[i].type].parse.call(this, tokens[i], i, tokens));
        break;
    }

    // Make sure following token is removed from main chain.
    tokens.splice(i, 1);
  }

  // Generate new ExpressionNode with nodes and expression parser of TokenParser.
  return new ExpressionNode(nodes, this.expressions);
};

module.exports = ExpressionNode;

},{}],12:[function(require,module,exports){
/**
 * Exposes core node types parsers.
 */

var i = 0;

module.exports = {
  'STRING': require('./string')
, 'COMPOUND': require('./compound')
, 'EXPRESSION': require('./expression')
};

},{"./compound":10,"./expression":11,"./string":13}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
"use strict";

var parse = require("./parse.js");

var filters = {},
    Lexer = parse.Lexer,
    Parser = parse.Parser,
    lexer = new Lexer({}),
    parser = new Parser(lexer, getFilter);

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

    if (!compile.cache) {
        return parser.parse(src);
    }

    cached = compile.cache[src];
    if (!cached) {
        cached = compile.cache[src] = parser.parse(src);
    }

    return cached;
}

/**
 * A cache containing all compiled functions. The src is used as key.
 * Set this on false to disable the cache.
 *
 * @type {object}
 */
compile.cache = {};

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

exports.Lexer = Lexer;
exports.Parser = Parser;
exports.compile = compile;
exports.filters = filters;
},{"./parse.js":15}],15:[function(require,module,exports){
"use strict";

// Angular environment stuff
// ------------------------------
function noop() {}

// Simplified extend() for our use-case
function extend(dst, obj) {
    var key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            dst[key] = obj[key];
        }
    }

    return dst;
}

function isDefined(value) { return typeof value !== 'undefined'; }

function valueFn(value) { return function () { return value; }; }

function $parseMinErr(module, message, arg1, arg2, arg3) {
    var args = arguments;

    message = message.replace(/{(\d)}/g, function (match) {
        return args[2 + parseInt(match[1])];
    });

    throw new SyntaxError(message);
}

function lowercase (string) {return typeof string === "string" ? string.toLowerCase() : string;}

// Simplified forEach() for our use-case
function forEach(arr, iterator) {
    arr.forEach(iterator);
}

// Sandboxing Angular Expressions
// ------------------------------
// Angular expressions are generally considered safe because these expressions only have direct
// access to $scope and locals. However, one can obtain the ability to execute arbitrary JS code by
// obtaining a reference to native JS functions such as the Function constructor.
//
// As an example, consider the following Angular expression:
//
//   {}.toString.constructor(alert("evil JS code"))
//
// We want to prevent this type of access. For the sake of performance, during the lexing phase we
// disallow any "dotted" access to any member named "constructor".
//
// For reflective calls (a[b]) we check that the value of the lookup is not the Function constructor
// while evaluating the expression, which is a stronger but more expensive test. Since reflective
// calls are expensive anyway, this is not such a big deal compared to static dereferencing.
//
// This sandboxing technique is not perfect and doesn't aim to be. The goal is to prevent exploits
// against the expression language, but not to prevent exploits that were enabled by exposing
// sensitive JavaScript or browser apis on Scope. Exposing such objects on a Scope is never a good
// practice and therefore we are not even trying to protect against interaction with an object
// explicitly exposed in this way.
//
// A developer could foil the name check by aliasing the Function constructor under a different
// name on the scope.
//
// In general, it is not possible to access a Window object from an angular expression unless a
// window or some DOM object that has a reference to window is published onto a Scope.

function ensureSafeMemberName(name, fullExpression) {
  if (name === "constructor") {
    throw $parseMinErr('isecfld',
        'Referencing "constructor" field in Angular expressions is disallowed! Expression: {0}',
        fullExpression);
  }
  return name;
}

function ensureSafeObject(obj, fullExpression) {
  // nifty check if obj is Function that is fast and works across iframes and other contexts
  if (obj) {
    if (obj.constructor === obj) {
      throw $parseMinErr('isecfn',
          'Referencing Function in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (// isWindow(obj)
        obj.document && obj.location && obj.alert && obj.setInterval) {
      throw $parseMinErr('isecwindow',
          'Referencing the Window in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    } else if (// isElement(obj)
        obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
      throw $parseMinErr('isecdom',
          'Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}',
          fullExpression);
    }
  }
  return obj;
}

var OPERATORS = {
    /* jshint bitwise : false */
    'null':function(){return null;},
    'true':function(){return true;},
    'false':function(){return false;},
    undefined:noop,
    '+':function(self, locals, a,b){
      a=a(self, locals); b=b(self, locals);
      if (isDefined(a)) {
        if (isDefined(b)) {
          return a + b;
        }
        return a;
      }
      return isDefined(b)?b:undefined;},
    '-':function(self, locals, a,b){
          a=a(self, locals); b=b(self, locals);
          return (isDefined(a)?a:0)-(isDefined(b)?b:0);
        },
    '*':function(self, locals, a,b){return a(self, locals)*b(self, locals);},
    '/':function(self, locals, a,b){return a(self, locals)/b(self, locals);},
    '%':function(self, locals, a,b){return a(self, locals)%b(self, locals);},
    '^':function(self, locals, a,b){return a(self, locals)^b(self, locals);},
    '=':noop,
    '===':function(self, locals, a, b){return a(self, locals)===b(self, locals);},
    '!==':function(self, locals, a, b){return a(self, locals)!==b(self, locals);},
    '==':function(self, locals, a,b){return a(self, locals)==b(self, locals);},
    '!=':function(self, locals, a,b){return a(self, locals)!=b(self, locals);},
    '<':function(self, locals, a,b){return a(self, locals)<b(self, locals);},
    '>':function(self, locals, a,b){return a(self, locals)>b(self, locals);},
    '<=':function(self, locals, a,b){return a(self, locals)<=b(self, locals);},
    '>=':function(self, locals, a,b){return a(self, locals)>=b(self, locals);},
    '&&':function(self, locals, a,b){return a(self, locals)&&b(self, locals);},
    '||':function(self, locals, a,b){return a(self, locals)||b(self, locals);},
    '&':function(self, locals, a,b){return a(self, locals)&b(self, locals);},
//    '|':function(self, locals, a,b){return a|b;},
    '|':function(self, locals, a,b){return b(self, locals)(self, locals, a(self, locals));},
    '!':function(self, locals, a){return !a(self, locals);}
};
/* jshint bitwise: true */
var ESCAPE = {"n":"\n", "f":"\f", "r":"\r", "t":"\t", "v":"\v", "'":"'", '"':'"'};


/////////////////////////////////////////


/**
 * @constructor
 */
var Lexer = function (options) {
  this.options = options;
};

Lexer.prototype = {
  constructor: Lexer,

  lex: function (text) {
    this.text = text;

    this.index = 0;
    this.ch = undefined;
    this.lastCh = ':'; // can start regexp

    this.tokens = [];

    var token;
    var json = [];

    while (this.index < this.text.length) {
      this.ch = this.text.charAt(this.index);
      if (this.is('"\'')) {
        this.readString(this.ch);
      } else if (this.isNumber(this.ch) || this.is('.') && this.isNumber(this.peek())) {
        this.readNumber();
      } else if (this.isIdent(this.ch)) {
        this.readIdent();
        // identifiers can only be if the preceding char was a { or ,
        if (this.was('{,') && json[0] === '{' &&
            (token = this.tokens[this.tokens.length - 1])) {
          token.json = token.text.indexOf('.') === -1;
        }
      } else if (this.is('(){}[].,;:?')) {
        this.tokens.push({
          index: this.index,
          text: this.ch,
          json: (this.was(':[,') && this.is('{[')) || this.is('}]:,')
        });
        if (this.is('{[')) json.unshift(this.ch);
        if (this.is('}]')) json.shift();
        this.index++;
      } else if (this.isWhitespace(this.ch)) {
        this.index++;
        continue;
      } else {
        var ch2 = this.ch + this.peek();
        var ch3 = ch2 + this.peek(2);
        var fn = OPERATORS[this.ch];
        var fn2 = OPERATORS[ch2];
        var fn3 = OPERATORS[ch3];
        if (fn3) {
          this.tokens.push({index: this.index, text: ch3, fn: fn3});
          this.index += 3;
        } else if (fn2) {
          this.tokens.push({index: this.index, text: ch2, fn: fn2});
          this.index += 2;
        } else if (fn) {
          this.tokens.push({
            index: this.index,
            text: this.ch,
            fn: fn,
            json: (this.was('[,:') && this.is('+-'))
          });
          this.index += 1;
        } else {
          this.throwError('Unexpected next character ', this.index, this.index + 1);
        }
      }
      this.lastCh = this.ch;
    }
    return this.tokens;
  },

  is: function(chars) {
    return chars.indexOf(this.ch) !== -1;
  },

  was: function(chars) {
    return chars.indexOf(this.lastCh) !== -1;
  },

  peek: function(i) {
    var num = i || 1;
    return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
  },

  isNumber: function(ch) {
    return ('0' <= ch && ch <= '9');
  },

  isWhitespace: function(ch) {
    // IE treats non-breaking space as \u00A0
    return (ch === ' ' || ch === '\r' || ch === '\t' ||
            ch === '\n' || ch === '\v' || ch === '\u00A0');
  },

  isIdent: function(ch) {
    return ('a' <= ch && ch <= 'z' ||
            'A' <= ch && ch <= 'Z' ||
            '_' === ch || ch === '$');
  },

  isExpOperator: function(ch) {
    return (ch === '-' || ch === '+' || this.isNumber(ch));
  },

  throwError: function(error, start, end) {
    end = end || this.index;
    var colStr = (isDefined(start)
            ? 's ' + start +  '-' + this.index + ' [' + this.text.substring(start, end) + ']'
            : ' ' + end);
    throw $parseMinErr('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].',
        error, colStr, this.text);
  },

  readNumber: function() {
    var number = '';
    var start = this.index;
    while (this.index < this.text.length) {
      var ch = lowercase(this.text.charAt(this.index));
      if (ch == '.' || this.isNumber(ch)) {
        number += ch;
      } else {
        var peekCh = this.peek();
        if (ch == 'e' && this.isExpOperator(peekCh)) {
          number += ch;
        } else if (this.isExpOperator(ch) &&
            peekCh && this.isNumber(peekCh) &&
            number.charAt(number.length - 1) == 'e') {
          number += ch;
        } else if (this.isExpOperator(ch) &&
            (!peekCh || !this.isNumber(peekCh)) &&
            number.charAt(number.length - 1) == 'e') {
          this.throwError('Invalid exponent');
        } else {
          break;
        }
      }
      this.index++;
    }
    number = 1 * number;
    this.tokens.push({
      index: start,
      text: number,
      json: true,
      fn: function() { return number; }
    });
  },

  readIdent: function() {
    var parser = this;

    var ident = '';
    var start = this.index;

    var lastDot, peekIndex, methodName, ch;

    while (this.index < this.text.length) {
      ch = this.text.charAt(this.index);
      if (ch === '.' || this.isIdent(ch) || this.isNumber(ch)) {
        if (ch === '.') lastDot = this.index;
        ident += ch;
      } else {
        break;
      }
      this.index++;
    }

    //check if this is not a method invocation and if it is back out to last dot
    if (lastDot) {
      peekIndex = this.index;
      while (peekIndex < this.text.length) {
        ch = this.text.charAt(peekIndex);
        if (ch === '(') {
          methodName = ident.substr(lastDot - start + 1);
          ident = ident.substr(0, lastDot - start);
          this.index = peekIndex;
          break;
        }
        if (this.isWhitespace(ch)) {
          peekIndex++;
        } else {
          break;
        }
      }
    }


    var token = {
      index: start,
      text: ident
    };

    // OPERATORS is our own object so we don't need to use special hasOwnPropertyFn
    if (OPERATORS.hasOwnProperty(ident)) {
      token.fn = OPERATORS[ident];
      token.json = OPERATORS[ident];
    } else {
      var getter = getterFn(ident, this.options, this.text);
      token.fn = extend(function(self, locals) {
        return (getter(self, locals));
      }, {
        assign: function(self, value) {
          return setter(self, ident, value, parser.text, parser.options);
        }
      });
    }

    this.tokens.push(token);

    if (methodName) {
      this.tokens.push({
        index:lastDot,
        text: '.',
        json: false
      });
      this.tokens.push({
        index: lastDot + 1,
        text: methodName,
        json: false
      });
    }
  },

  readString: function(quote) {
    var start = this.index;
    this.index++;
    var string = '';
    var rawString = quote;
    var escape = false;
    while (this.index < this.text.length) {
      var ch = this.text.charAt(this.index);
      rawString += ch;
      if (escape) {
        if (ch === 'u') {
          var hex = this.text.substring(this.index + 1, this.index + 5);
          if (!hex.match(/[\da-f]{4}/i))
            this.throwError('Invalid unicode escape [\\u' + hex + ']');
          this.index += 4;
          string += String.fromCharCode(parseInt(hex, 16));
        } else {
          var rep = ESCAPE[ch];
          if (rep) {
            string += rep;
          } else {
            string += ch;
          }
        }
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === quote) {
        this.index++;
        this.tokens.push({
          index: start,
          text: rawString,
          string: string,
          json: true,
          fn: function() { return string; }
        });
        return;
      } else {
        string += ch;
      }
      this.index++;
    }
    this.throwError('Unterminated quote', start);
  }
};


/**
 * @constructor
 */
var Parser = function (lexer, $filter, options) {
  this.lexer = lexer;
  this.$filter = $filter;
  this.options = options;
};

Parser.ZERO = function () { return 0; };

Parser.prototype = {
  constructor: Parser,

  parse: function (text) {
    this.text = text;

    this.tokens = this.lexer.lex(text);

    var value = this.statements();

    if (this.tokens.length !== 0) {
      this.throwError('is an unexpected token', this.tokens[0]);
    }

    value.literal = !!value.literal;
    value.constant = !!value.constant;

    return value;
  },

  primary: function () {
    var primary;
    if (this.expect('(')) {
      primary = this.filterChain();
      this.consume(')');
    } else if (this.expect('[')) {
      primary = this.arrayDeclaration();
    } else if (this.expect('{')) {
      primary = this.object();
    } else {
      var token = this.expect();
      primary = token.fn;
      if (!primary) {
        this.throwError('not a primary expression', token);
      }
      if (token.json) {
        primary.constant = true;
        primary.literal = true;
      }
    }

    var next, context;
    while ((next = this.expect('(', '[', '.'))) {
      if (next.text === '(') {
        primary = this.functionCall(primary, context);
        context = null;
      } else if (next.text === '[') {
        context = primary;
        primary = this.objectIndex(primary);
      } else if (next.text === '.') {
        context = primary;
        primary = this.fieldAccess(primary);
      } else {
        this.throwError('IMPOSSIBLE');
      }
    }
    return primary;
  },

  throwError: function(msg, token) {
    throw $parseMinErr('syntax',
        'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
          token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
  },

  peekToken: function() {
    if (this.tokens.length === 0)
      throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
    return this.tokens[0];
  },

  peek: function(e1, e2, e3, e4) {
    if (this.tokens.length > 0) {
      var token = this.tokens[0];
      var t = token.text;
      if (t === e1 || t === e2 || t === e3 || t === e4 ||
          (!e1 && !e2 && !e3 && !e4)) {
        return token;
      }
    }
    return false;
  },

  expect: function(e1, e2, e3, e4){
    var token = this.peek(e1, e2, e3, e4);
    if (token) {
      this.tokens.shift();
      return token;
    }
    return false;
  },

  consume: function(e1){
    if (!this.expect(e1)) {
      this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
    }
  },

  unaryFn: function(fn, right) {
    return extend(function(self, locals) {
      return fn(self, locals, right);
    }, {
      constant:right.constant
    });
  },

  ternaryFn: function(left, middle, right){
    return extend(function(self, locals){
      return left(self, locals) ? middle(self, locals) : right(self, locals);
    }, {
      constant: left.constant && middle.constant && right.constant
    });
  },

  binaryFn: function(left, fn, right) {
    return extend(function(self, locals) {
      return fn(self, locals, left, right);
    }, {
      constant:left.constant && right.constant
    });
  },

  statements: function() {
    var statements = [];
    while (true) {
      if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']'))
        statements.push(this.filterChain());
      if (!this.expect(';')) {
        // optimize for the common case where there is only one statement.
        // TODO(size): maybe we should not support multiple statements?
        return (statements.length === 1)
            ? statements[0]
            : function(self, locals) {
                var value;
                for (var i = 0; i < statements.length; i++) {
                  var statement = statements[i];
                  if (statement) {
                    value = statement(self, locals);
                  }
                }
                return value;
              };
      }
    }
  },

  filterChain: function() {
    var left = this.expression();
    var token;
    while (true) {
      if ((token = this.expect('|'))) {
        left = this.binaryFn(left, token.fn, this.filter());
      } else {
        return left;
      }
    }
  },

  filter: function() {
    var token = this.expect();
    var fn = this.$filter(token.text);
    var argsFn = [];
    while (true) {
      if ((token = this.expect(':'))) {
        argsFn.push(this.expression());
      } else {
        var fnInvoke = function(self, locals, input) {
          var args = [input];
          for (var i = 0; i < argsFn.length; i++) {
            args.push(argsFn[i](self, locals));
          }
          return fn.apply(self, args);
        };
        return function() {
          return fnInvoke;
        };
      }
    }
  },

  expression: function() {
    return this.assignment();
  },

  assignment: function() {
    var left = this.ternary();
    var right;
    var token;
    if ((token = this.expect('='))) {
      if (!left.assign) {
        this.throwError('implies assignment but [' +
            this.text.substring(0, token.index) + '] can not be assigned to', token);
      }
      right = this.ternary();
      return function(scope, locals) {
        return left.assign(scope, right(scope, locals), locals);
      };
    }
    return left;
  },

  ternary: function() {
    var left = this.logicalOR();
    var middle;
    var token;
    if ((token = this.expect('?'))) {
      middle = this.ternary();
      if ((token = this.expect(':'))) {
        return this.ternaryFn(left, middle, this.ternary());
      } else {
        this.throwError('expected :', token);
      }
    } else {
      return left;
    }
  },

  logicalOR: function() {
    var left = this.logicalAND();
    var token;
    while (true) {
      if ((token = this.expect('||'))) {
        left = this.binaryFn(left, token.fn, this.logicalAND());
      } else {
        return left;
      }
    }
  },

  logicalAND: function() {
    var left = this.equality();
    var token;
    if ((token = this.expect('&&'))) {
      left = this.binaryFn(left, token.fn, this.logicalAND());
    }
    return left;
  },

  equality: function() {
    var left = this.relational();
    var token;
    if ((token = this.expect('==','!=','===','!=='))) {
      left = this.binaryFn(left, token.fn, this.equality());
    }
    return left;
  },

  relational: function() {
    var left = this.additive();
    var token;
    if ((token = this.expect('<', '>', '<=', '>='))) {
      left = this.binaryFn(left, token.fn, this.relational());
    }
    return left;
  },

  additive: function() {
    var left = this.multiplicative();
    var token;
    while ((token = this.expect('+','-'))) {
      left = this.binaryFn(left, token.fn, this.multiplicative());
    }
    return left;
  },

  multiplicative: function() {
    var left = this.unary();
    var token;
    while ((token = this.expect('*','/','%'))) {
      left = this.binaryFn(left, token.fn, this.unary());
    }
    return left;
  },

  unary: function() {
    var token;
    if (this.expect('+')) {
      return this.primary();
    } else if ((token = this.expect('-'))) {
      return this.binaryFn(Parser.ZERO, token.fn, this.unary());
    } else if ((token = this.expect('!'))) {
      return this.unaryFn(token.fn, this.unary());
    } else {
      return this.primary();
    }
  },

  fieldAccess: function(object) {
    var parser = this;
    var field = this.expect().text;
    var getter = getterFn(field, this.options, this.text);

    return extend(function(scope, locals, self) {
      return getter(self || object(scope, locals));
    }, {
      assign: function(scope, value, locals) {
        return setter(object(scope, locals), field, value, parser.text, parser.options);
      }
    });
  },

  objectIndex: function(obj) {
    var parser = this;

    var indexFn = this.expression();
    this.consume(']');

    return extend(function(self, locals) {
      var o = obj(self, locals),
          i = indexFn(self, locals),
          v, p;

      if (!o) return undefined;
      v = ensureSafeObject(o[i], parser.text);
      return v;
    }, {
      assign: function(self, value, locals) {
        var key = indexFn(self, locals);
        // prevent overwriting of Function.constructor which would break ensureSafeObject check
        var safe = ensureSafeObject(obj(self, locals), parser.text);
        return safe[key] = value;
      }
    });
  },

  functionCall: function(fn, contextGetter) {
    var argsFn = [];
    if (this.peekToken().text !== ')') {
      do {
        argsFn.push(this.expression());
      } while (this.expect(','));
    }
    this.consume(')');

    var parser = this;

    return function(scope, locals) {
      var args = [];
      var context = contextGetter ? contextGetter(scope, locals) : scope;

      for (var i = 0; i < argsFn.length; i++) {
        args.push(argsFn[i](scope, locals));
      }
      var fnPtr = fn(scope, locals, context) || noop;

      ensureSafeObject(context, parser.text);
      ensureSafeObject(fnPtr, parser.text);

      // IE stupidity! (IE doesn't have apply for some native functions)
      var v = fnPtr.apply
            ? fnPtr.apply(context, args)
            : fnPtr(args[0], args[1], args[2], args[3], args[4]);

      return ensureSafeObject(v, parser.text);
    };
  },

  // This is used with json array declaration
  arrayDeclaration: function () {
    var elementFns = [];
    var allConstant = true;
    if (this.peekToken().text !== ']') {
      do {
        if (this.peek(']')) {
          // Support trailing commas per ES5.1.
          break;
        }
        var elementFn = this.expression();
        elementFns.push(elementFn);
        if (!elementFn.constant) {
          allConstant = false;
        }
      } while (this.expect(','));
    }
    this.consume(']');

    return extend(function(self, locals) {
      var array = [];
      for (var i = 0; i < elementFns.length; i++) {
        array.push(elementFns[i](self, locals));
      }
      return array;
    }, {
      literal: true,
      constant: allConstant
    });
  },

  object: function () {
    var keyValues = [];
    var allConstant = true;
    if (this.peekToken().text !== '}') {
      do {
        if (this.peek('}')) {
          // Support trailing commas per ES5.1.
          break;
        }
        var token = this.expect(),
        key = token.string || token.text;
        this.consume(':');
        var value = this.expression();
        keyValues.push({key: key, value: value});
        if (!value.constant) {
          allConstant = false;
        }
      } while (this.expect(','));
    }
    this.consume('}');

    return extend(function(self, locals) {
      var object = {};
      for (var i = 0; i < keyValues.length; i++) {
        var keyValue = keyValues[i];
        object[keyValue.key] = keyValue.value(self, locals);
      }
      return object;
    }, {
      literal: true,
      constant: allConstant
    });
  }
};


//////////////////////////////////////////////////
// Parser helper functions
//////////////////////////////////////////////////

function setter(obj, path, setValue, fullExp) {
  var element = path.split('.'), key;
  for (var i = 0; element.length > 1; i++) {
    key = ensureSafeMemberName(element.shift(), fullExp);
    var propertyObj = obj[key];
    if (!propertyObj) {
      propertyObj = {};
      obj[key] = propertyObj;
    }
    obj = propertyObj;
  }
  key = ensureSafeMemberName(element.shift(), fullExp);
  obj[key] = setValue;
  return setValue;
}

var getterFnCache = {};

/**
 * Implementation of the "Black Hole" variant from:
 * - http://jsperf.com/angularjs-parse-getter/4
 * - http://jsperf.com/path-evaluation-simplified/7
 */
function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp) {
  ensureSafeMemberName(key0, fullExp);
  ensureSafeMemberName(key1, fullExp);
  ensureSafeMemberName(key2, fullExp);
  ensureSafeMemberName(key3, fullExp);
  ensureSafeMemberName(key4, fullExp);

  return function cspSafeGetter(scope, locals) {
          var pathVal = (locals && locals.hasOwnProperty(key0)) ? locals : scope;

          if (pathVal == null) return pathVal;
          pathVal = pathVal[key0];

          if (!key1) return pathVal;
          if (pathVal == null) return undefined;
          pathVal = pathVal[key1];

          if (!key2) return pathVal;
          if (pathVal == null) return undefined;
          pathVal = pathVal[key2];

          if (!key3) return pathVal;
          if (pathVal == null) return undefined;
          pathVal = pathVal[key3];

          if (!key4) return pathVal;
          if (pathVal == null) return undefined;
          pathVal = pathVal[key4];

          return pathVal;
        };
}

function simpleGetterFn1(key0, fullExp) {
  ensureSafeMemberName(key0, fullExp);

  return function simpleGetterFn1(scope, locals) {
    if (scope == null) return undefined;
    return ((locals && locals.hasOwnProperty(key0)) ? locals : scope)[key0];
  };
}

function simpleGetterFn2(key0, key1, fullExp) {
  ensureSafeMemberName(key0, fullExp);
  ensureSafeMemberName(key1, fullExp);

  return function simpleGetterFn2(scope, locals) {
    if (scope == null) return undefined;
    scope = ((locals && locals.hasOwnProperty(key0)) ? locals : scope)[key0];
    return scope == null ? undefined : scope[key1];
  };
}

function getterFn(path, options, fullExp) {
  // Check whether the cache has this getter already.
  // We can use hasOwnProperty directly on the cache because we ensure,
  // see below, that the cache never stores a path called 'hasOwnProperty'
  if (getterFnCache.hasOwnProperty(path)) {
    return getterFnCache[path];
  }

  var pathKeys = path.split('.'),
      pathKeysLength = pathKeys.length,
      fn;

  // When we have only 1 or 2 tokens, use optimized special case closures.
  // http://jsperf.com/angularjs-parse-getter/6
  if (pathKeysLength === 1) {
    fn = simpleGetterFn1(pathKeys[0], fullExp);
  } else if (pathKeysLength === 2) {
    fn = simpleGetterFn2(pathKeys[0], pathKeys[1], fullExp);
  } else if (options.csp) {
    if (pathKeysLength < 6) {
      fn = cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp,
                          options);
    } else {
      fn = function(scope, locals) {
        var i = 0, val;
        do {
          val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++],
                                pathKeys[i++], fullExp, options)(scope, locals);

          locals = undefined; // clear after first iteration
          scope = val;
        } while (i < pathKeysLength);
        return val;
      };
    }
  } else {
    var code = 'var p;\n';
    forEach(pathKeys, function(key, index) {
      ensureSafeMemberName(key, fullExp);
      code += 'if(s == null) return undefined;\n' +
              's='+ (index
                      // we simply dereference 's' on any .dot notation
                      ? 's'
                      // but if we are first then we check locals first, and if so read it first
                      : '((k&&k.hasOwnProperty("' + key + '"))?k:s)') + '["' + key + '"]' + ';\n';
    });
    code += 'return s;';

    /* jshint -W054 */
    var evaledFnGetter = new Function('s', 'k', 'pw', code); // s=scope, k=locals, pw=promiseWarning
    /* jshint +W054 */
    evaledFnGetter.toString = valueFn(code);
    fn = evaledFnGetter;
  }

  // Only cache the value if it's not going to mess up the cache object
  // This is more performant that using Object.prototype.hasOwnProperty.call
  if (path !== 'hasOwnProperty') {
    getterFnCache[path] = fn;
  }
  return fn;
}

exports.Lexer = Lexer;
exports.Parser = Parser;
},{}],16:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],17:[function(require,module,exports){
if (typeof module === "object" && typeof module.exports === "object") module.exports = Lexer;

Lexer.defunct = function (char) {
    throw new Error("Unexpected character at index " + (this.index - 1) + ": " + char);
};

function Lexer(defunct) {
    if (typeof defunct !== "function") defunct = Lexer.defunct;

    var tokens = [];
    var rules = [];
    var remove = 0;
    this.state = 0;
    this.index = 0;
    this.input = "";

    this.addRule = function (pattern, action, start) {
        var global = pattern.global;

        if (!global) {
            var flags = "g";
            if (pattern.multiline) flags += "m";
            if (pattern.ignoreCase) flags += "i";
            pattern = new RegExp(pattern.source, flags);
        }

        if (Object.prototype.toString.call(start) !== "[object Array]") start = [0];

        rules.push({
            pattern: pattern,
            global: global,
            action: action,
            start: start
        });

        return this;
    };

    this.setInput = function (input) {
        remove = 0;
        this.state = 0;
        this.index = 0;
        tokens.length = 0;
        this.input = input;
        return this;
    };

    this.lex = function () {
        if (tokens.length) return tokens.shift();

        this.reject = true;

        while (this.index <= this.input.length) {
            var matches = scan.call(this).splice(remove);
            var index = this.index;

            while (matches.length) {
                if (this.reject) {
                    var match = matches.shift();
                    var result = match.result;
                    var length = match.length;
                    this.index += length;
                    this.reject = false;
                    remove++;

                    var token = match.action.apply(this, result);
                    if (this.reject) this.index = result.index;
                    else if (typeof token !== "undefined") {
                        switch (Object.prototype.toString.call(token)) {
                        case "[object Array]":
                            tokens = token.slice(1);
                            token = token[0];
                        default:
                            if (length) remove = 0;
                            return token;
                        }
                    }
                } else break;
            }

            var input = this.input;

            if (index < input.length) {
                if (this.reject) {
                    remove = 0;
                    var token = defunct.call(this, input.charAt(this.index++));
                    if (typeof token !== "undefined") {
                        if (Object.prototype.toString.call(token) === "[object Array]") {
                            tokens = token.slice(1);
                            return token[0];
                        } else return token;
                    }
                } else {
                    if (this.index !== index) remove = 0;
                    this.reject = true;
                }
            } else if (matches.length)
                this.reject = true;
            else break;
        }
    };

    function scan() {
        var matches = [];
        var index = 0;

        var state = this.state;
        var lastIndex = this.index;
        var input = this.input;

        for (var i = 0, length = rules.length; i < length; i++) {
            var rule = rules[i];
            var start = rule.start;
            var states = start.length;

            if ((!states || start.indexOf(state) >= 0) ||
                (state % 2 && states === 1 && !start[0])) {
                var pattern = rule.pattern;
                pattern.lastIndex = lastIndex;
                var result = pattern.exec(input);

                if (result && result.index === lastIndex) {
                    var j = matches.push({
                        result: result,
                        action: rule.action,
                        length: result[0].length
                    });

                    if (rule.global) index = j;

                    while (--j > index) {
                        var k = j - 1;

                        if (matches[j].length > matches[k].length) {
                            var temple = matches[j];
                            matches[j] = matches[k];
                            matches[k] = temple;
                        }
                    }
                }
            }
        }

        return matches;
    }
}

},{}]},{},[1])(1)
});