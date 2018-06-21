/*eslint func-names: 0, no-magic-numbers:0, id-length:0 */
/*global describe, it */

const flow = require('../lib/xml-flow');
const fs = require('fs');


require('chai').should();

function getFlow(fileName, options) {
  return flow(fs.createReadStream(fileName), options);
}

describe('xml-flow', () => {
  describe('invoke', () => {
    it('should create an emitter when invoked with a stream and options', () => {
      const inStream = fs.createReadStream('./test/simple.xml');
      inStream.pause();
      const simpleStream = flow(inStream);

      simpleStream.on.should.be.a('function');
      simpleStream.pause();
      simpleStream.resume();
    });
  });

  describe('.on(\'end\')', () => {
    it('should emit after the file has been read', done => {
      const simpleStream = getFlow('./test/simple.xml');
      simpleStream.on('end', () => {
        done();
      });
    });
  });

  describe('.on(\'tag:...\')', () => {
    it('should emit the right number of nodes', done => {
      const simpleStream = getFlow('./test/simple.xml');
      let count = 0;

      simpleStream.on('tag:item', () => {
        count++;
      });

      simpleStream.on('end', () => {
        count.should.equal(3);
        done();
      });
    });

    it('should make non-attributed data look really simple', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = {
        $name: 'no-attrs',
        person: [
          { name: 'Bill', id: '1', age: '27' },
          { name: 'Joe', id: '2', age: '29' },
          { name: 'Smitty', id: '3', age: '37' }
        ]
      };


      simpleStream.on('tag:no-attrs', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should make all-attributed data look really simple', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = {
        $name: 'all-attrs',
        person: [
          { name: 'Bill', id: '1', age: '27' },
          { name: 'Joe', id: '2', age: '29' },
          { name: 'Smitty', id: '3', age: '37' }
        ]
      };


      simpleStream.on('tag:all-attrs', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should handle tags with both attributes and other stuff', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = {
        $name: 'mixed',
        person: [
          { $attrs: { name: 'Bill', id: '1', age: '27' }, $text: 'some text' },
          { $attrs: { name: 'Joe', id: '2', age: '29' }, p: 'some paragraph' },
          { $attrs: { name: 'Smitty', id: '3', age: '37' }, thing: { id: '999', ref: 'blah' }}
        ]
      };


      simpleStream.on('tag:mixed', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should preserve markup when things get more complex', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = {
        $name: 'markup',
        $markup: [
          'Some unwrapped text',
          { $name: 'person', $attrs: { name: 'Bill', id: '1', age: '27' }, $text: 'some text' },
          'Some more unwrapped text',
          { $name: 'person', $attrs: { name: 'Joe', id: '2', age: '29' }, p: 'some paragraph' },
          { $name: 'person', $attrs: { name: 'Smitty', id: '3', age: '37' }, thing: { id: '999', ref: 'blah' }}
        ]
      };


      simpleStream.on('tag:markup', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should handle scripts', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = {
        $name: 'has-scripts',
        script: [
          'var x = 3;',
          { $attrs: { type: 'text/javascript' }, $script: '//this is a comment' }
        ]
      };

      simpleStream.on('tag:has-scripts', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should handle CDATA', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = {
        $name: 'has-cdata',
        $text: 'here comes the cdata...',
        $cdata: 'this is <span>cdata!</span>'
      };

      simpleStream.on('tag:has-cdata', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should handle bad formatting', done => {
      const simpleStream = getFlow('./test/badFormatting.xml');
      const output = {
        $name: 'section',
        $markup: [
          'Text1</p>',
          { $name: 'p', $text: 'Text2' },
          { $name: 'p', $text: 'Text3' },
          'Text4',
          { $name: 'p' }
        ]
      };

      simpleStream.on('tag:section', node => {
        node.should.deep.equal(output);
        done();
      });
    });
  });

  describe('options', () => {
    it('should normalize whitespace by default', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = 'This is some text with extra whitespace.';

      simpleStream.on('tag:extra-whitespace', node => {
        node.$text.should.equal(output);
        done();
      });
    });

    it('should not normalize whitespace when asked not to', done => {
      const simpleStream = getFlow('./test/test.xml', { normalize: false });
      const output = 'This is some text with extra    whitespace.';

      simpleStream.on('tag:extra-whitespace', node => {
        node.$text.should.equal(output);
        done();
      });
    });

    it('should trim by default', done => {
      const simpleStream = getFlow('./test/test.xml');
      const output = 'This is some text with extra whitespace.';

      simpleStream.on('tag:extra-whitespace', node => {
        node.$text.should.equal(output);
        done();
      });
    });

    it('should not trim when asked not to', done => {
      const simpleStream = getFlow('./test/test.xml', { trim: false });
      const output = 'This is some text with extra whitespace. ';

      simpleStream.on('tag:extra-whitespace', node => {
        node.$text.should.equal(output);
        done();
      });
    });

    it('should not preserve markup when told to never do so', done => {
      const simpleStream = getFlow('./test/test.xml', { preserveMarkup: flow.NEVER });
      const output = {
        $name: 'markup',
        $text: [
          'Some unwrapped text',
          'Some more unwrapped text'
        ],
        person: [
          { $attrs: { name: 'Bill', id: '1', age: '27' }, $text: 'some text' },
          { $attrs: { name: 'Joe', id: '2', age: '29' }, p: 'some paragraph' },
          { $attrs: { name: 'Smitty', id: '3', age: '37' }, thing: { id: '999', ref: 'blah' }}
        ]
      };

      simpleStream.on('tag:markup', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should always preserve markup when told to do so', done => {
      const simpleStream = getFlow('./test/test.xml', { preserveMarkup: flow.ALWAYS });
      const output = {
        $name: 'mixed',
        $markup: [
          {
            $name: 'person',
            $attrs: { name: 'Bill', id: '1', age: '27' },
            $markup: [ 'some text' ]
          },
          {
            $name: 'person',
            $attrs: { name: 'Joe', id: '2', age: '29' },
            $markup: [{ $name: 'p', $markup: [ 'some paragraph' ]}]
          },
          {
            $name: 'person',
            $attrs: { name: 'Smitty', id: '3', age: '37' },
            $markup: [{ $name: 'thing', id: '999', ref: 'blah' }]
          }
        ]
      };

      simpleStream.on('tag:mixed', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should handle CDATA as text when asked', done => {
      const simpleStream = getFlow('./test/test.xml', { cdataAsText: true });
      const output = {
        $name: 'has-cdata',
        $text: 'here comes the cdata...this is <span>cdata!</span>'
      };

      simpleStream.on('tag:has-cdata', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should completely drop arrays when asked', done => {
      const simpleStream = getFlow('./test/test.xml', { useArrays: flow.NEVER });
      const output = {
        $name: 'two-items',
        p: 'one'
      };

      simpleStream.on('tag:two-items', node => {
        node.should.deep.equal(output);
        done();
      });
    });

    it('should keep things as arrays when asked', done => {
      const simpleStream = getFlow('./test/test.xml', { useArrays: flow.ALWAYS });
      const output = {
        $name: 'one-item',
        p: [ 'this is one item' ]
      };

      simpleStream.on('tag:one-item', node => {
        node.should.deep.equal(output);
        done();
      });
    });
  });

  describe('toXml()', () => {
    it('should convert $attrs as expected', () => {
      const input = { $name: 'tag', $attrs: { id: 3 }};
      const output = '<tag id="3"/>';

      flow.toXml(input).should.equal(output);
    });

    it('should convert $text as expected', () => {
      const input = { $name: 'tag', $attrs: { id: 3 }, $text: 'some text' };
      const output = '<tag id="3">some text</tag>';

      flow.toXml(input).should.equal(output);
    });

    it('should convert random fields as expected', () => {
      const input = { $name: 'tag', $attrs: { id: 3 }, $text: 'some text', p: 'other text', j: [ 'text1', 'text2' ]};
      const output = '<tag id="3">some text<p>other text</p><j>text1</j><j>text2</j></tag>';

      flow.toXml(input).should.equal(output);
    });

    it('should convert $markup', () => {
      const input = { $name: 'tag', $markup: [ 'text', { $name: 'j', $text: 'stuff' }]};
      const output = '<tag>text<j>stuff</j></tag>';

      flow.toXml(input).should.equal(output);
    });

    it('should convert $script', () => {
      const input = { $name: 'tag', $script: 'console.log(\'stuff\');' };
      const output = '<tag><script>console.log(\'stuff\');</script></tag>';

      flow.toXml(input).should.equal(output);
    });

    it('should convert $cdata', () => {
      const input = { $name: 'tag', $cdata: '<<science>>' };
      const output = '<tag><![CDATA[<<science>>]]></tag>';

      flow.toXml(input).should.equal(output);
    });

    it('should pretty-print', () => {
      const input = {
        $name: 'tag',
        $markup: [
          'text',
          {
            $name: 'tag',
            $text: 'moar text'
          }
        ]
      };
      const output = '<tag>\n  text\n  <tag>\n    moar text\n  </tag>\n</tag>';

      flow.toXml(input, { indent: '  ' }).should.equal(output);
    });

    it('should not do self-closing if asked', () => {
      const input = { $name: 'tag', $attrs: { id: 3 }};
      const output = '<tag id="3"></tag>';

      flow.toXml(input, { selfClosing: false }).should.equal(output);
    });

    it('should escape html entities', () => {
      const input = { $name: 'tag', $text: '<br><br><table class=\'data\' ></table>' };
      const output = '<tag>&lt;br&gt;&lt;br&gt;&lt;table class=\'data\' &gt;&lt;/table&gt;</tag>';

      flow.toXml(input).should.equal(output);
    });
  });
});
