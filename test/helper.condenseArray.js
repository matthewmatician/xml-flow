/*eslint func-names: 0*/
/*global describe, it */

const helper = require('../lib/helper');
require('chai').should();

describe('helper.condenseArray()', () => {
  it('should condense a homogeneous list into a single element array', () => {
    const input = [
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' }
    ];
    const output = [[
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' }
    ]];
    helper.condenseArray(input).should.deep.equal(output);
  });

  it('should condense contiguous items', () => {
    const input = [
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' },
      { $name: 'other', $text: 'something' },
      { $name: 'other', $text: 'else' }
    ];
    const output = [
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

  it('should not condense noncontiguous items', () => {
    const input = [
      { $name: 'other', $text: 'something' },
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' },
      { $name: 'other', $text: 'else' }
    ];
    const output = [
      [{ $name: 'other', $text: 'something' }],
      [
        { $name: 'item', $text: 'something' },
        { $name: 'item', $text: 'else' }
      ],
      [{ $name: 'other', $text: 'else' }]
    ];
    helper.condenseArray(input).should.deep.equal(output);
  });

  it('should condense text to single text elements', () => {
    const input = [
      'Something said...',
      'words here.',
      { $name: 'item', $text: 'something' },
      { $name: 'item', $text: 'else' },
      { $name: 'other', $text: 'else' },
      'more words'
    ];
    const output = [
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
