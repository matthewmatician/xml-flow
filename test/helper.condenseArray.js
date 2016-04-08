/*eslint func-names: 0*/
/*global describe, it */

var helper = require('../lib/helper');
require('chai').should();

describe('helper.condenseArray()', function() {
  it('should condense a homogeneous list into a single element array', function() {
    var input, output;
    input = [
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' }
    ];
    output = [[
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' }
    ]];
    helper.condenseArray(input).should.deep.equal(output);
  });

  it('should condense contiguous items', function() {
    var input, output;
    input = [
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' },
      { $name: 'other', $text: 'something' },
      { $name: 'other', $text: 'else' }
    ];
    output = [
      [
        { $name: 'item', $text: 'something' },
        { $name: 'item', $text: 'else' }
      ],
      [
        { $name: 'other', $text: 'something' },
        { $name: 'other', $text: 'else' }
      ]
    ];
    helper.condenseArray(input).should.deep.equal(output);
  });

  it('should not condense noncontiguous items', function() {
    var input, output;
    input = [
      { $name: 'other', $text: 'something' },
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' },
      { $name: 'other', $text: 'else' }
    ];
    output = [
      [{ $name: 'other', $text: 'something' }],
      [
        { $name: 'item', $text: 'something' },
        { $name: 'item', $text: 'else' }
      ],
      [{ $name: 'other', $text: 'else' }]
    ];
    helper.condenseArray(input).should.deep.equal(output);
  });

  it('should condense text to single text elements', function() {
    var input, output;
    input = [
      'Something said...',
      'words here.',
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' },
      { $name: 'other', $text: 'else' },
      'more words'
    ];
    output = [
      'Something said...words here.',
      [
        { $name: 'item', $text: 'something' },
        { $name: 'item', $text: 'else' }
      ],
      [{ $name: 'other', $text: 'else' }],
      'more words'
    ];
    helper.condenseArray(input).should.deep.equal(output);
  });
});
