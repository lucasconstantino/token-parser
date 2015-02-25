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
