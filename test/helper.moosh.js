/*global describe, it */

var helper = require('../lib/helper')
  , should = require('chai').should()
;

describe('helper.moosh()', function(){
    it('should return the second if the first is undefined', function(){
        helper.moosh(undefined, 'text').should.equal('text');
        helper.moosh(undefined, ['item', 'item2']).should.deep.equal(['item', 'item2']);
    });

    it('should return size-two arrays on non-array inputs', function(){
        helper.moosh('item1', 'item2').should.deep.equal(['item1', 'item2']);
        helper.moosh('item1', null).should.deep.equal(['item1', null]);
        helper.moosh('item1', 0).should.deep.equal(['item1', 0]);
        helper.moosh('item1', {}).should.deep.equal(['item1', {}]);
        helper.moosh({}, {}).should.deep.equal([{}, {}]);
    });


    it('should unwrap single-element arrays', function(){
        helper.moosh(undefined, ['item']).should.equal('item');
        helper.moosh(undefined, ['item']).should.equal('item');
        helper.moosh(['item'], ['item2']).should.deep.equal(['item', 'item2']);
    });

    it('should concatenate arrays', function(){
        helper.moosh(['item1', 'item2'], ['item3']).should.deep.equal(['item1', 'item2', 'item3']);
        helper.moosh(['item1'], ['item2', 'item3']).should.deep.equal(['item1', 'item2', 'item3',]);
        helper.moosh(['item1', 'item2'], ['item3', 'item4']).should.deep.equal(['item1', 'item2', 'item3', 'item4']);
        helper.moosh(['item1', 'item2'], 'item3').should.deep.equal(['item1', 'item2', 'item3']);
        helper.moosh('item1', ['item2', 'item3']).should.deep.equal(['item1', 'item2', 'item3',]);
    });

});

