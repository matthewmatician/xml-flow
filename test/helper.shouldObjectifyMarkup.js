/*eslint func-names: 0, no-magic-numbers:0 */
/*global describe, it */

var helper = require('../lib/helper');
require('chai').should();

describe('helper.shouldObjectifyMarkup()', function() {
  it('should succeed on text', function() {
    var input = [ 'Some words' ];
    helper.shouldObjectifyMarkup(input).should.be.true;
  });

  it('should succeed when no duplicates', function() {
    var input = [
      [
        { $name: 'item', $text: 'something' },
        { $name: 'item', $text: 'else' }
      ],
      [
        { $name: 'other', $text: 'something' },
        { $name: 'other', $text: 'else' }
      ]
    ];
    helper.shouldObjectifyMarkup(input).should.be.true;
    input.push('some text');
    helper.shouldObjectifyMarkup(input).should.be.true;
  });

  it('should fail on duplicates', function() {
    var input = [
      [{ $name: 'other', $text: 'something' }],
      [
        { $name: 'item', $text: 'something' },
        { $name: 'item', $text: 'else' }
      ],
      [{ $name: 'other', $text: 'else' }]
    ];
    helper.shouldObjectifyMarkup(input).should.be.false;
  });

  it('should fail on duplicate text items', function() {
    var input = [
      'text',
      [
        { $name: 'item', $text: 'something' },
        { $name: 'item', $text: 'else' }
      ],
      'text'
    ];
    helper.shouldObjectifyMarkup(input).should.be.false;
  });
});
