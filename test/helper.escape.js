/*eslint func-names: 0*/
/*global describe, it */

const helper = require('../lib/helper');


require('chai').should();

describe('helper.escape()', () => {
  it('should not escape normal stuff', () => {
    helper.escape('x y').should.equal('x y');
  });

  it('should escape the ampersand', () => {
    helper.escape('x & y').should.equal('x &amp; y');
  });

  it('should escape the greater-than', () => {
    helper.escape('x > y').should.equal('x &gt; y');
  });

  it('should escape the less-than', () => {
    helper.escape('x < y').should.equal('x &lt; y');
  });

  it('should escape the double-quote', () => {
    helper.escape('x " y').should.equal('x &quot; y');
  });
});
