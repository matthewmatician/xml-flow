/*eslint func-names: 0, no-magic-numbers:0 */
/*global describe, it */

var helper = require('../lib/helper')
  , should = require('chai').should();
;

describe('helper.simplifyNode()', function() {
  it('should return the already simplified', function() {
    should.not.exist(helper.simplifyNode(null));
    helper.simplifyNode('simple').should.equal('simple');
  });

  it('should return only text when really simple', function() {
    var input = {
      $name: 'title',
      $attrs: {},
      $text: 'this is a title'
    };
    helper.simplifyNode(input, true).should.equal('this is a title');
    helper.simplifyNode(input).should.not.equal('this is a title');
  });

  it('should return only attributes when really simple', function() {
    var input = {
      $name: 'div',
      $attrs: { id: '34', type: 'thing' }
    };
    helper.simplifyNode(input).should.deep.equal({ $name: 'div', id: '34', type: 'thing' });
    helper.simplifyNode(input, true).should.deep.equal({ id: '34', type: 'thing' });
  });

  it('should drop unecessary properties', function() {
    var input, output;

    input = {
      $name: 'title',
      $attrs: { id: '34' },
      $text: null
    };

    output = {
      $name: 'title',
      id: '34'
    };
    helper.simplifyNode(input).should.deep.equal(output);
    helper.simplifyNode(input, true).should.deep.equal(input.$attrs);
  });

  it('should not oversimplify empty nodes', function() {
    var input, output;

    input = {
      $name: 'title',
      $text: null
    };

    output = {
      $name: 'title'
    };
    helper.simplifyNode(input).should.deep.equal(output);
  });

  it('should simplify $markup', function() {
    var input, output;

    input = {
      $name: 'title',
      $attrs: {},
      $markup: [{ $name: 'p', $attrs: {}, $markup: [ 'stuff' ]}]
    };

    output = {
      $name: 'title',
      $markup: [{ $name: 'p', $markup: [ 'stuff' ]}]
    };
    helper.simplifyNode(input).should.deep.equal(output);
  });

  it('should strip single-element arrays', function() {
    helper.simplifyNode({
      $name: 'tag',
      stuff: [ 'test' ]
    }).should.deep.equal({
      $name: 'tag',
      stuff: 'test'
    });

    helper.simplifyNode([ 'test' ]).should.equal('test');
  });

  it('should preserve arrays when asked', function() {
    helper.simplifyNode({
      $name: 'tag',
      stuff: [ 'test' ]
    }, false, true).should.deep.equal({
      $name: 'tag',
      stuff: [ 'test' ]
    });

    helper.simplifyNode([ 'test' ], false, true).should.deep.equal([ 'test' ]);
  });

  it('should not simplify when things get interesting', function() {
    var input, output;

    input = {
      $name: 'header',
      $attrs: { id: '3' },
      $markup: [ 'some text' ]
    };

    output = {
      $name: 'header',
      $attrs: { id: '3' },
      $markup: [ 'some text' ]
    };

    helper.simplifyNode(input).should.deep.equal(output);
    delete output.$name;

    helper.simplifyNode(input, true).should.deep.equal(output);
  });
});
