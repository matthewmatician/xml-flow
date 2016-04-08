/*eslint func-names: 0, no-magic-numbers:0 */
/*global describe, it */

var helper = require('../lib/helper');
require('chai').should();

describe('helper.isSomething()', function() {
  it('should return true on non-empty strings', function() {
    helper.isSomething('something').should.be.true;
    helper.isSomething('').should.be.false;
  });

  it('should return false on null and undefined', function() {
    helper.isSomething(null).should.be.false;
    helper.isSomething(undefined).should.be.false;
  });

  it('should return true on numbers', function() {
    helper.isSomething(0).should.be.true;
    helper.isSomething(-1).should.be.true;
  });

  it('should return true on other boolean values', function() {
    helper.isSomething(false).should.be.true;
    helper.isSomething(true).should.be.true;
  });

  it('should return true on non-empty arrays', function() {
    helper.isSomething([ 1, 2, 3 ]).should.be.true;
    helper.isSomething([]).should.be.false;
  });

  it('should return true on non-empty objects', function() {
    helper.isSomething({ x: '1' }).should.be.true;
    helper.isSomething({}).should.be.false;
  });
});
