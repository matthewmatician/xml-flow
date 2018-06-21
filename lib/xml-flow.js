/* eslint complexity: 0 */
const { EventEmitter } = require('events');
const sax = require('sax');
const helper = require('./helper');

const ALWAYS = 1;
const SOMETIMES = 0;
const NEVER = -1;

const defaults = {
  preserveMarkup: SOMETIMES,
  simplifyNodes: true,
  useArrays: SOMETIMES,
  lowercase: true,
  trim: true,
  normalize: true,
  cdataAsText: false,
  strict: false
};

/**
 * @param ReadSteam inStream the stream to be parsed
 */
const flow = function xmlFlow(inStream, options = defaults) {
  const emitter = new EventEmitter();
  const stack = [];
  const opts = Object.assign({}, defaults, options);
  const {
    preserveMarkup,
    simplifyNodes,
    useArrays,
    lowercase,
    trim,
    normalize,
    cdataAsText,
    strict
  } = opts;
  let topNode = null;
  let currentCdata = null;

  const saxStream = sax.createStream(strict, { lowercase, trim, normalize, cdataAsText });

  saxStream.on('opentag', node => {
    //Ignore nodes we don't care about.
    if (stack.length === 0 && !emitter.listeners(`tag:${node.name}`).length) {
      return;
    }

    //@TODO: If useArrays is set to flow.NEVER and this tag is already
    //a member of last, we could ignore it and not mess

    topNode = {
      $name: node.name,
      $attrs: node.attributes
    };

    //If useArrays is set to flow.NEVER, we don't want $markup
    if (useArrays > NEVER) {
      topNode.$markup = [];
    }

    stack.push(topNode);
  });

  saxStream.on('text', text => {
    if (topNode) {
      if (useArrays > NEVER) {
        topNode.$markup.push(text);
      } else if (topNode.$text) {
        topNode.$text += text;
      } else {
        topNode.$text = text;
      }
    }
  });

  saxStream.on('opencdata', () => {
    if (topNode) {
      if (!cdataAsText) {
        currentCdata = {
          $name: '$cdata',
          text: ''
        };
        if (useArrays > NEVER) {
          topNode.$markup.push(currentCdata);
        } else {
          topNode.$cdata = currentCdata;
        }
      }
    }
  });

  saxStream.on('cdata', text => {
    if (topNode) {
      if (currentCdata !== null) {
        currentCdata.text += text;
      } else if (useArrays > NEVER) {
        topNode.$markup.push(text);
      } else if (topNode.$text) {
        topNode.$text += text;
      } else {
        topNode.$text = text;
      }
    }
  });

  saxStream.on('closecdata', () => {
    currentCdata = null;
  });

  saxStream.on('script', script => {
    if (topNode) {
      topNode.$script = script;
    }
  });

  saxStream.on('closetag', tagName => {
    let compressed;
    let newTop = null;
    const keepArrays = useArrays > SOMETIMES;


    //If we're not going to send out a node, goodbye!
    if (stack.length === 0) return;

    //Objectify Markup if needed...
    if (useArrays > NEVER) {
      if (preserveMarkup <= NEVER) {
        topNode.$markup = helper.condenseArray(topNode.$markup);
        topNode = helper.objectifyMarkup(topNode, keepArrays);
      } else if (preserveMarkup === SOMETIMES) {
        compressed = helper.condenseArray(topNode.$markup);
        if (helper.shouldObjectifyMarkup(compressed)) {
          topNode.$markup = compressed;
          topNode = helper.objectifyMarkup(topNode, keepArrays);
        }
      }
    }

    //emit the node if there are listeners
    if (emitter.listeners(`tag:${tagName}`).length) {
      emitter.emit(
        `tag:${tagName}`,
        simplifyNodes ? helper.simplifyNode(topNode, false, useArrays > SOMETIMES) : topNode
      );
    }

    //Pop stack, and add to parent node
    stack.pop();
    if (stack.length > 0) {
      newTop = stack[stack.length - 1];
      if (useArrays > NEVER) {
        newTop.$markup.push(topNode);
      } else if (!newTop[tagName]) {
        newTop[tagName] = helper.simplifyNode(topNode, true);
      }
    }
    topNode = newTop;
  });

  saxStream.on('end', () => {
    emitter.emit('end');
  });

  inStream.pipe(saxStream);

  emitter.pause = function pause() {
    inStream.pause();
  };

  emitter.resume = function resume() {
    inStream.resume();
  };

  return emitter;
};

flow.ALWAYS = ALWAYS;
flow.SOMETIMES = SOMETIMES;
flow.NEVER = NEVER;

flow.toXml = function toXml(obj, {
  indent = '',
  selfClosing = true,
  escape = helper.escape,
  nodeName
} = {}) {
  const carriageReturn = indent ? '\n' : '';

  function getXml(node, nodeName, currentIndent) {
    let output = '';
    let keys;
    let name = nodeName;
    const thisIndent = currentIndent ? carriageReturn + currentIndent : '';
    const nextIndent = currentIndent + indent;
    let guts = '';


    if (node.constructor === Array) {
      node.forEach(subNode => {
        output += getXml(subNode, name, currentIndent);
      });
      return output;
    }

    if (!name && node.$name) {
      name = node.$name;
    }

    if (name) {
      output = `${thisIndent}<${name}`;
      if (node.$attrs && typeof node.$attrs === 'object') {
        keys = Object.keys(node.$attrs);
        keys.forEach(key => {
          output += ` ${key}=${JSON.stringify(String(node.$attrs[key]))}`;
        });
      }
    }

    if (node === null || node === undefined || node === '') {
      //do nothing. Empty on purpose
    } else if (typeof node === 'object') {
      keys = Object.keys(node);
      keys.forEach(key => {
        const value = node[key];
        switch (key) {
          case '$name':
          case '$attrs':
          //Do nothing. Already taken care of
            break;

          case '$text':
          case '$markup':
            guts += getXml(value, null, nextIndent);
            break;

          case '$script':
            guts += getXml(value, 'script', nextIndent);
            break;

          case '$cdata':
            guts += `${thisIndent}<![CDATA[${value}]]>`;
            break;

          default:
            guts += getXml(value, key, nextIndent);
        }
      });
    } else {
      guts += thisIndent + escape(node);
    }

    if (name) {
      if (guts) {
        output += `>${guts}${carriageReturn}${currentIndent}</${name}>`;
      } else if (selfClosing) {
        output += '/>';
      } else {
        output += `></${name}>`;
      }
    } else {
      output += guts;
    }
    return output;
  }
  return getXml(obj, nodeName, '');
};

module.exports = flow;
