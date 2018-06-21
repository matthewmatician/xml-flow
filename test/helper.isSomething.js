/*eslint func-names: 0, no-magic-numbers:0 */
/*global describe, it */

const helper = require('../lib/helper');
require('chai').should();

describe('helper.isSomething()', () => {
  it('should return true on non-empty strings', () => {
    helper.isSomething('something').should.be.true;
    helper.isSomething('').should.be.false;
  });

  it('should return false on null and undefined', () => {
    helper.isSomething(null).should.be.false;
    helper.isSomething(undefined).should.be.false;
  });

  it('should return true on numbers', () => {
    helper.isSomething(0).should.be.true;
    helper.isSomething(-1).should.be.true;
  });

  it('should return true on other boolean values', () => {
    helper.isSomething(false).should.be.true;
    helper.isSomething(true).should.be.true;
  });

  it('should return true on non-empty arrays', () => {
    helper.isSomething([ 1, 2, 3 ]).should.be.true;
    helper.isSomething([]).should.be.false;
  });

  it('should return true on non-empty objects', () => {
    helper.isSomething({ x: '1' }).should.be.true;
    helper.isSomething({}).should.be.false;
  });
});
