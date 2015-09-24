var EventEmitter = require('events').EventEmitter
  , sax = require('sax')
  , helper = require('./helper')
  , flow
;

/**
 * @param ReadSteam inStream the stream to be parsed
 */
flow = module.exports = function(inStream, options) {
    var emitter = new EventEmitter()
      , saxOptions = {}
      , saxStream = null
      , stack = []
      , topNode = null
    ;

    options = options || {};
    options.preserveMarkup = options.preserveMarkup  || flow.SOMETIMES;
    options.simplifyNodes = options.hasOwnProperty('simplifyNodes') ? options.simplifyNodes : true;

    saxOptions.lowercase = options.hasOwnProperty('lowercase') ? options.lowercase : true;
    saxOptions.trim = options.hasOwnProperty('trim') ? options.trim : true;
    saxOptions.normalize = options.hasOwnProperty('normalize') ? options.normalize : true;

    saxStream = sax.createStream(options.strict || false, saxOptions);

    saxStream.on('opentag', function(node) {
        //Ignore nodes we don't care about.
        if(stack.length === 0 && !emitter.listeners('tag:' + node.name).length) {
            return;
        }

        topNode = {
            $name: node.name,
            $attrs: node.attributes,
            $markup: []
        };
        stack.push(topNode);
    });

    saxStream.on('text', function(text) {
        if(topNode) {
            topNode.$markup.push(text);
        }
    });

    saxStream.on('cdata', function(text) {
        if(options.preserveMarkup >= flow.ALWAYS){
            if(topNode) {
                topNode.$markup.push(text);
            }
        }
    });

    saxStream.on('script', function(script) {
        topNode.$script = script;
    });

    saxStream.on('closetag', function(tagName) {
        var compressed
          , newTop = null
        ;

        //If we're not going to send out a node, goodbye!
        if(stack.length === 0) { return; }

        //Objectify Markup if needed...
        if(options.preserveMarkup <= flow.NEVER) {
            topNode.$markup = helper.condenseArray(topNode.$markup);
            topNode = helper.objectifyMarkup(topNode);
        } else if(options.preserveMarkup === flow.SOMETIMES) {
            compressed = helper.condenseArray(topNode.$markup);
            if(helper.shouldObjectifyMarkup(compressed)) {
                topNode.$markup = compressed;
                topNode = helper.objectifyMarkup(topNode);
            }
        }

        //emit the node
        emitter.emit(
            'tag:' + tagName,
            options.simplifyNodes ? helper.simplifyNode(topNode) : topNode
        );

        //Pop stack, and add to parent node
        stack.pop();
        if(stack.length > 0) {
            newTop = stack[stack.length-1];
            newTop.$markup.push(topNode);
        }
        topNode = newTop;
    });

    saxStream.on('end', function(){
        emitter.emit('end');
    });

    inStream.pipe(saxStream);

    emitter.pause = function(){
        inStream.pause();
    };

    emitter.resume = function() {
        inStream.resume();
    };

    return emitter;
};

flow.ALWAYS = 1;
flow.SOMETIMES = 0;
flow.NEVER = -1;

flow.toXml = function(node, name) {
    var output = ''
      , keys
    ;

    if(node.constructor === Array) {
        node.forEach(function(subNode){
            output += flow.toXml(subNode, name);
        });
        return output;
    }

    if(!name && node.$name) {name = node.$name;}

    if(name) {
        output = '<' + name;

        if(node.$attrs && typeof node.$attrs === 'object') {
            keys = Object.keys(node.$attrs);
            keys.forEach(function(key){
                output += ' ' + key + '=' + JSON.stringify('' + node.$attrs[key]);
            });
        }
        output += '>';
    }

    if(node === null || node === undefined) {
        //do nothing. Empty on purpose
    } else if (typeof node === 'object') {
        keys = Object.keys(node);
        keys.forEach(function(key){
            var value = node[key];
            switch(key) {
                case '$name':
                case '$attrs':
                    //Do nothing. Already taken care of
                break;

                case '$text':
                case '$markup':
                    output += flow.toXml(value);
                break;

                case '$script':
                    output += flow.toXml(value, 'script');
                break;

                default:
                    output += flow.toXml(value, key);
            }
        });
    } else {
        output += node;
    }

    if(name) { output += '</' + name + '>'; }
    return output;
};

