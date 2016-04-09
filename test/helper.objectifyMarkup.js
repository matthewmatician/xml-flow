/*eslint func-names: 0, no-magic-numbers:0 */
/*global describe, it */

var helper = require('../lib/helper');
require('chai').should();

describe('helper.objectifyMarkup()', function() {
  it('should add object array properties from $markup', function() {
    var input, output;
    input = {
      $name: 'root',
      $attrs: {},
      $markup: [
        'text',
        [
          { $name: 'item', $text: 'something' },
          { $name: 'item', $text: 'else' }
        ]
      ]
    };

    output = {
      $name: 'root',
      $attrs: {},
      $text: 'text',
      item: [ 'something', 'else' ]
    };

    helper.objectifyMarkup(input).should.deep.equal(output);
  });

  it('should aggregate everything from $markup', function() {
    var input, output;
    input = {
      $name: 'root',
      $attrs: {},
      $markup: [
        'text',
        [
          { $name: 'item', $text: 'something' },
          { $name: 'item', $text: 'else' }
        ],
        'text',
        { $name: 'item', $text: 'otherwise' }
      ]
    };

    output = {
      $name: 'root',
      $attrs: {},
      $text: [ 'text', 'text' ],
      item: [ 'something', 'else', 'otherwise' ]
    };
    helper.objectifyMarkup(input).should.deep.equal(output);
  });

  it('should not oversimplify', function() {
    var input, output;

    input = {
      $name: 'thing',
      $markup: [{
        $name: 'header',
        $attrs: { id: '3' },
        $markup: [ 'some text' ]
      }]
    };

    output = {
      $name: 'thing',
      header: {
        $attrs: { id: '3' },
        $markup: [ 'some text' ]
      }
    };

    helper.objectifyMarkup(input).should.deep.equal(output);
  });

  it('should preserve arrays if asked', function() {
    var input, output;

    input = {
      $name: 'root',
      $attrs: {},
      $markup: [
        'text',
        { $name: 'item', $text: 'something' }
      ]
    };

    output = {
      $name: 'root',
      $attrs: {},
      $text: [ 'text' ],
      item: [ 'something' ]
    };

    helper.objectifyMarkup(input, true).should.deep.equal(output);
  });
});
