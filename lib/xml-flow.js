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
      , saxStream = sax.createStream(false, {lowercase: true, trim: true})
      , stack = []
      , topNode = null
    ;

    options = options || {};
    options.preserveMarkup = options.preserveMarkup  || flow.SOMETIMES;
    options.simplifyNodes = options.simplifyNodes  || flow.SOMETIMES;

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

    saxStream.on('text', function(text){
        if(topNode) {
            topNode.$markup.push(text);
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
            options.simplifyNodes < flow.SOMETIMES ? topNode : helper.simplifyNode(topNode)
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

