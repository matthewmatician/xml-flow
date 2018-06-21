/*eslint func-names: 0, no-magic-numbers:0 */
/*global describe, it */

const helper = require('../lib/helper');
const should = require('chai').should();


describe('helper.simplifyNode()', () => {
  it('should return the already simplified', () => {
    should.not.exist(helper.simplifyNode(null));
    helper.simplifyNode('simple').should.equal('simple');
  });

  it('should return only text when really simple', () => {
    const input = {
      $name: 'title',
      $attrs: {},
      $text: 'this is a title'
    };
    helper.simplifyNode(input, true).should.equal('this is a title');
    helper.simplifyNode(input).should.not.equal('this is a title');
  });

  it('should return only attributes when really simple', () => {
    const input = {
      $name: 'div',
      $attrs: { id: '34', type: 'thing' }
    };
    helper.simplifyNode(input).should.deep.equal({ $name: 'div', id: '34', type: 'thing' });
    helper.simplifyNode(input, true).should.deep.equal({ id: '34', type: 'thing' });
  });

  it('should drop unecessary properties', () => {
    const input = {
      $name: 'title',
      $attrs: { id: '34' },
      $text: null
    };

    const output = {
      $name: 'title',
      id: '34'
    };
    helper.simplifyNode(input).should.deep.equal(output);
    helper.simplifyNode(input, true).should.deep.equal(input.$attrs);
  });

  it('should not oversimplify empty nodes', () => {
    const input = {
      $name: 'title',
      $text: null
    };

    const output = {
      $name: 'title'
    };
    helper.simplifyNode(input).should.deep.equal(output);
  });

  it('should simplify $markup', () => {
    const input = {
      $name: 'title',
      $attrs: {},
      $markup: [{ $name: 'p', $attrs: {}, $markup: [ 'stuff' ]}]
    };

    const output = {
      $name: 'title',
      $markup: [{ $name: 'p', $markup: [ 'stuff' ]}]
    };
    helper.simplifyNode(input).should.deep.equal(output);
  });

  it('should strip single-element arrays', () => {
    helper.simplifyNode({
      $name: 'tag',
      stuff: [ 'test' ]
    }).should.deep.equal({
      $name: 'tag',
      stuff: 'test'
    });

    helper.simplifyNode([ 'test' ]).should.equal('test');
  });

  it('should preserve arrays when asked', () => {
    helper.simplifyNode({
      $name: 'tag',
      stuff: [ 'test' ]
    }, false, true).should.deep.equal({
      $name: 'tag',
      stuff: [ 'test' ]
    });

    helper.simplifyNode([ 'test' ], false, true).should.deep.equal([ 'test' ]);
  });

  it('should simplify arrays as arrays', () => {
    const input = {
      items: [{ id: 1 }, { id: 2 }]
    };

    const output = [
      { id: 1 }, { id: 2 }
    ];

    helper.simplifyNode(input).should.deep.equal(output);
  });

  it('should not simplify when things get interesting', () => {
    const input = {
      $name: 'header',
      $attrs: { id: '3' },
      $markup: [ 'some text' ]
    };

    const output = {
      $name: 'header',
      $attrs: { id: '3' },
      $markup: [ 'some text' ]
    };

    helper.simplifyNode(input).should.deep.equal(output);
    delete output.$name;

    helper.simplifyNode(input, true).should.deep.equal(output);
  });
});
