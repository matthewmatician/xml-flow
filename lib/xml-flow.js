var EventEmitter = require('events').EventEmitter
  , sax = require('sax')
  , helper = require('./helper')
  , flow
  ;

/**
 * @param ReadSteam inStream the stream to be parsed
 */
flow = module.exports = function xmlFlow(inStream, opts) {
  var emitter = new EventEmitter()
    , saxOptions = {}
    , saxStream = null
    , stack = []
    , topNode = null
    , currentCdata = null
    , options = opts || {}
    ;

  options.preserveMarkup = options.preserveMarkup || flow.SOMETIMES;
  options.simplifyNodes = options.hasOwnProperty('simplifyNodes') ? options.simplifyNodes : true;
  options.useArrays = options.hasOwnProperty('useArrays') ? options.useArrays : flow.SOMETIMES;

  saxOptions.lowercase = options.hasOwnProperty('lowercase') ? options.lowercase : true;
  saxOptions.trim = options.hasOwnProperty('trim') ? options.trim : true;
  saxOptions.normalize = options.hasOwnProperty('normalize') ? options.normalize : true;

  saxOptions.cdataAsText = options.hasOwnProperty('cdataAsText') ? options.cdataAsText : false;

  saxStream = sax.createStream(options.strict || false, saxOptions);

  saxStream.on('opentag', function openTag(node) {
    //Ignore nodes we don't care about.
    if (stack.length === 0 && !emitter.listeners('tag:' + node.name).length) {
      return;
    }

    //@TODO: If useArrays is set to flow.NEVER and this tag is already
    //a member of last, we could ignore it and not mess

    topNode = {
      $name: node.name,
      $attrs: node.attributes
    };

    //If useArrays is set to flow.NEVER, we don't want $markup
    if (options.useArrays > flow.NEVER) {
      topNode.$markup = [];
    }

    stack.push(topNode);
  });

  saxStream.on('text', function onText(text) {
    if (topNode) {
      if (options.useArrays > flow.NEVER) {
        topNode.$markup.push(text);
      } else if (topNode.$text) {
        topNode.$text += text;
      } else {
        topNode.$text = text;
      }
    }
  });

  saxStream.on('opencdata', function onOpenCdata() {
    if (topNode) {
      if (!options.cdataAsText) {
        currentCdata = {
          $name: '$cdata',
          text: ''
        };
        if (options.useArrays > flow.NEVER) {
          topNode.$markup.push(currentCdata);
        } else {
          topNode.$cdata = currentCdata;
        }
      }
    }
  });

  saxStream.on('cdata', function onCdata(text) {
    if (topNode) {
      if (currentCdata !== null) {
        currentCdata.text += text;
      } else if (options.useArrays > flow.NEVER) {
        topNode.$markup.push(text);
      } else if (topNode.$text) {
        topNode.$text += text;
      } else {
        topNode.$text = text;
      }
    }
  });

  saxStream.on('closecdata', function onCloseCdata() {
    currentCdata = null;
  });

  saxStream.on('script', function onScript(script) {
    if (topNode) {
      topNode.$script = script;
    }
  });

  saxStream.on('closetag', function onCloseTag(tagName) {
    var compressed
      , newTop = null
      , keepArrays = options.useArrays > flow.SOMETIMES
      ;

    //If we're not going to send out a node, goodbye!
    if (stack.length === 0) return;

    //Objectify Markup if needed...
    if (options.useArrays > flow.NEVER) {
      if (options.preserveMarkup <= flow.NEVER) {
        topNode.$markup = helper.condenseArray(topNode.$markup);
        topNode = helper.objectifyMarkup(topNode, keepArrays);
      } else if (options.preserveMarkup === flow.SOMETIMES) {
        compressed = helper.condenseArray(topNode.$markup);
        if (helper.shouldObjectifyMarkup(compressed)) {
          topNode.$markup = compressed;
          topNode = helper.objectifyMarkup(topNode, keepArrays);
        }
      }
    }

    //emit the node if there are listeners
    if (emitter.listeners('tag:' + tagName).length) {
      emitter.emit(
        'tag:' + tagName,
        options.simplifyNodes ? helper.simplifyNode(topNode, false, options.useArrays > flow.SOMETIMES) : topNode
      );
    }

    //Pop stack, and add to parent node
    stack.pop();
    if (stack.length > 0) {
      newTop = stack[stack.length - 1];
      if (options.useArrays > flow.NEVER) {
        newTop.$markup.push(topNode);
      } else if (!newTop[tagName]) {
        newTop[tagName] = helper.simplifyNode(topNode, true);
      }
    }
    topNode = newTop;
  });

  saxStream.on('end', function onEnd() {
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

flow.ALWAYS = 1;
flow.SOMETIMES = 0;
flow.NEVER = -1;

flow.toXml = function toXml(obj, options) {
  var opt = options || {}
    , idt = opt.indent || ''
    , ret = idt ? '\n' : ''
    , selfClosing = opt.hasOwnProperty('selfClosing') ? opt.selfClosing : true
    , escape = opt.escape || helper.escape
    ;

  function getXml(node, nodeName, indent) {
    var output = ''
      , keys
      , name = nodeName
      , thisIndent = indent ? ret + indent : ''
      , nextIndent = indent + idt
      , guts = ''
      ;

    if (node.constructor === Array) {
      node.forEach(function eachSubNode(subNode) {
        output += getXml(subNode, name, indent);
      });
      return output;
    }

    if (!name && node.$name) {
      name = node.$name;
    }

    if (name) {
      output = thisIndent + '<' + name;
      if (node.$attrs && typeof node.$attrs === 'object') {
        keys = Object.keys(node.$attrs);
        keys.forEach(function eachKey(key) {
          output += ' ' + key + '=' + JSON.stringify(String(node.$attrs[key]));
        });
      }
    }

    if (node === null || node === undefined || node === '') {
      //do nothing. Empty on purpose
    } else if (typeof node === 'object') {
      keys = Object.keys(node);
      keys.forEach(function eachKey(key) {
        var value = node[key];
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
            guts += thisIndent + '<![CDATA[' + value + ']]>';
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
        output += '>' + guts + ret + indent + '</' + name + '>';
      } else if (selfClosing) {
        output += '/>';
      } else {
        output += '></' + name + '>';
      }
    } else {
      output += guts;
    }
    return output;
  }
  return getXml(obj, opt.nodeName, '');
};
