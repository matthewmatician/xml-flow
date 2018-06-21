/*eslint func-names: 0*/
/*global describe, it */

const helper = require('../lib/helper');
require('chai').should();

describe('helper.moosh()', () => {
  it('should return the second if the first is undefined', () => {
    helper.moosh(undefined, 'text').should.equal('text');
    helper.moosh(undefined, [ 'item', 'item2' ]).should.deep.equal([ 'item', 'item2' ]);
  });

  it('should return size-two arrays on non-array inputs', () => {
    helper.moosh('item1', 'item2').should.deep.equal([ 'item1', 'item2' ]);
    helper.moosh('item1', null).should.deep.equal([ 'item1', null ]);
    helper.moosh('item1', 0).should.deep.equal([ 'item1', 0 ]);
    helper.moosh('item1', {}).should.deep.equal([ 'item1', {}]);
    helper.moosh({}, {}).should.deep.equal([{}, {}]);
  });

  it('should unwrap single-element arrays', () => {
    helper.moosh(undefined, [ 'item' ]).should.equal('item');
    helper.moosh([ 'item' ], undefined).should.equal('item');
    helper.moosh([ 'item' ], [ 'item2' ]).should.deep.equal([ 'item', 'item2' ]);
  });

  it('should preserve arrays when asked', () => {
    helper.moosh(undefined, [ 'item' ], true).should.deep.equal([ 'item' ]);
    helper.moosh([ 'item' ], undefined, true).should.deep.equal([ 'item' ]);
    helper.moosh('item', undefined, true).should.deep.equal([ 'item' ]);
    helper.moosh(undefined, 'item', true).should.deep.equal([ 'item' ]);
  });

  it('should concatenate arrays', () => {
    helper.moosh([ 'item1', 'item2' ], [ 'item3' ]).should.deep.equal([ 'item1', 'item2', 'item3' ]);
    helper.moosh([ 'item1' ], [ 'item2', 'item3' ]).should.deep.equal([ 'item1', 'item2', 'item3' ]);
    helper.moosh([ 'item1', 'item2' ], [ 'item3', 'item4' ]).should.deep.equal([ 'item1', 'item2', 'item3', 'item4' ]);
    helper.moosh([ 'item1', 'item2' ], 'item3').should.deep.equal([ 'item1', 'item2', 'item3' ]);
    helper.moosh('item1', [ 'item2', 'item3' ]).should.deep.equal([ 'item1', 'item2', 'item3' ]);
  });
});
