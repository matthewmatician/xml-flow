/*global describe, it */

var helper = require('../lib/helper')
  , should = require('chai').should()
;

describe('helper.simplifyNode()', function(){
    it('should return only text when really simple', function(){
        var input = {
            $name: 'title',
            $attrs: {},
            $text: 'this is a title'
        };
        helper.simplifyNode(input, true).should.equal('this is a title');
        helper.simplifyNode(input).should.not.equal('this is a title');
    });

    it('should return only attributes when really simple', function(){
        var input = {
            $name: 'div',
            $attrs: {id: '34', type:'thing'},
        };
        helper.simplifyNode(input).should.deep.equal({$name: 'div', id: '34', type: 'thing'});
        helper.simplifyNode(input, true).should.deep.equal({id: '34', type: 'thing'});
    });

    it('should drop unecessary properties', function(){
        var input, output;

        input = {
            $name: 'title',
            $attrs: {id: '34'},
            $text: null
        };
        output = {
            $name: 'title',
            id: '34'
        };
        helper.simplifyNode(input).should.deep.equal(output);
        helper.simplifyNode(input, true).should.deep.equal(input.$attrs);
    });
});
