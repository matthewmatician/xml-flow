exports.condenseArray = function(items) {
    var currentTag
      , newTag
      , currentTagCompressed = null
      , output = []
    ;

    items.forEach(function(item) {
        if(typeof item === 'string') {
            if(currentTag === '$text') {
                currentTagCompressed += item;
            } else {
                if(currentTagCompressed !== null) {output.push(currentTagCompressed);}
                currentTagCompressed = item;
                currentTag = '$text';
            }
        } else {
            newTag = item.$name;
            if(newTag === currentTag) {
                currentTagCompressed.push(item);
            } else {
                if(currentTagCompressed !== null) {output.push(currentTagCompressed);}
                currentTagCompressed = [item];
                currentTag = newTag;
            }
        }
    });
    if(currentTagCompressed !== null) {output.push(currentTagCompressed);}
    return output;
};

function shallowClone(obj) {
    var output = {}, key;
    if (obj === null || typeof obj !== 'object') {return obj;}
    for(key in obj) {output[key] = obj[key];}
    return output;
}

exports.simplifyNode = function(node, dropName) {
    if(!exports.isSomething(node)) {return null;}
    if (node === null || typeof node !== 'object') {return shallowClone(node);}
    if (node.constructor === Array) {return node.length === 1 ? node[0]: node;}

    var output = {}
      , keys = Object.keys(node)
    ;

    dropName = !!dropName;

    keys.forEach(function(key) {
        var value = node[key]
          , markup
        ;

        if(key === '$markup') {
            markup = simplifyAll(value);
            if(markup.length > 0) {output.$markup = markup;}
        } else if(!(dropName && key === '$name') && exports.isSomething(value)) {
            if(value.constructor === Array && value.length === 1) {
                output[key] = value[0];
            } else {
                output[key] = value;
            }
        }
    });

    keys = Object.keys(output);
    if(keys.length === 1 && keys[0] !== '$name') {
        output = shallowClone(output[keys[0]]);
    } else if(keys.length === 2 && !dropName && output.hasOwnProperty('$attrs')) {
        output = shallowClone(output.$attrs);
        output.$name = node.$name;
    }
    return output;
};

exports.shouldObjectifyMarkup = function(items) {
    var currentTag
      , foundTags = {}
      , shouldObjectify = true
    ;
    items.forEach(function(item){
        if(typeof item === 'string') {
            currentTag = '$text';
        } else {
            currentTag = item[0].$name;
        }

        if(foundTags[currentTag]) {
            shouldObjectify = false;
            return false;
        }
        foundTags[currentTag] = true;
    });
    return shouldObjectify;
};

exports.moosh = function(item1, item2) {
    if(item1 === undefined) {
        if(item2 !== null && typeof item2 === 'object' && item2.constructor === Array && item2.length === 1) {
            return item2[0];
        }
        return item2;
    }

    if(item1 !== null && typeof item1 === 'object' && item1.constructor === Array) {
        if(item2 !== null && typeof item2 === 'object' && item2.constructor === Array) {
            return item1.concat(item2);
        }
        item1.push(item2);
        return item1;
    }

    if(item2 !== null && typeof item2 === 'object' && item2.constructor === Array) {
        return [item1].concat(item2);
    }

    return [item1, item2];
};

function simplifyAll(input, dropName) {
    var output = [];
    if(input !== null && typeof input === 'object' && input.constructor === Array) {
        input.forEach(function(item){
            output.push(exports.simplifyNode(item, dropName));
        });
        return output;
    }
    return exports.simplifyNode(input, dropName);
}

exports.objectifyMarkup = function(node, dontSimplify) {
    var key
      , output = {}
    ;

    dontSimplify = !!dontSimplify;

    Object.keys(node).forEach(function(key){
        if(key !== '$markup') {
            output[key] = node[key];
        }
    });

    if(node.$markup) {
        node.$markup.forEach(function(item){
            if(typeof item === 'string') {
                output.$text = exports.moosh(output.$text, item);
            } else if(typeof item === 'object') {
                if(item.constructor === Array) {
                    key = item[0].$name;
                } else {
                    key = item.$name;
                }
                if(!dontSimplify) {
                    item = simplifyAll(item, true);
                }
                output[key] = exports.moosh(output[key], item);
            }
        });
    }
    return output;
};

exports.isSomething = function(n) {
    if(n === undefined || n === null) {
        return false;
    }

    if(n.constructor === Array && n.length === 0) {
        return false;
    }

    if(typeof n === 'object' && Object.keys(n).length === 0) {
        return false;
    }

    if(typeof n === 'string' && n.length === 0) {
        return false;
    }

    return true;
};

