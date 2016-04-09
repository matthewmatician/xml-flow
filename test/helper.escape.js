/*eslint func-names: 0*/
/*global describe, it */

var helper = require('../lib/helper')
;

require('chai').should();

describe('helper.escape()', function() {
  it('should not escape normal stuff', function() {
    helper.escape('x y').should.equal('x y');
  });

  it('should escape the ampersand', function() {
    helper.escape('x & y').should.equal('x &amp; y');
  });

  it('should escape the greater-than', function() {
    helper.escape('x > y').should.equal('x &gt; y');
  });

  it('should escape the less-than', function() {
    helper.escape('x < y').should.equal('x &lt; y');
  });

  it('should escape the double-quote', function() {
    helper.escape('x " y').should.equal('x &quot; y');
  });
});
