/*
  This code was derived from lodash.js (the _.escape function)
  https://github.com/lodash/lodash
 */
var reUnescapedHtml = /[&<>"]/g
  , reHasUnescapedHtml = RegExp(reUnescapedHtml.source)
  , htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }
  ;

exports.escape = function escape(string) {
  var result = String(string);
  return (result && reHasUnescapedHtml.test(result))
  ? result.replace(reUnescapedHtml, function replacement(chr) { return htmlEscapes[chr]; })
  : result;
};
/* end of derivation from lodash */

exports.condenseArray = function condenseArray(items) {
  var currentTag
      , newTag
      , currentTagCompressed = null
      , output = []
      ;

  items.forEach(function eachItem(item) {
    if (typeof item === 'string') {
      if (currentTag === '$text') {
        currentTagCompressed += item;
      } else {
        if (currentTagCompressed !== null) output.push(currentTagCompressed);
        currentTagCompressed = item;
        currentTag = '$text';
      }
    } else {
      newTag = item.$name;
      if (newTag === currentTag) {
        currentTagCompressed.push(item);
      } else {
        if (currentTagCompressed !== null) output.push(currentTagCompressed);
        currentTagCompressed = [ item ];
        currentTag = newTag;
      }
    }
  });
  if (currentTagCompressed !== null) output.push(currentTagCompressed);
  return output;
};

function shallowClone(obj) {
  var output = {}
    , key
    ;

  if (obj === null || typeof obj !== 'object') return obj;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      output[key] = obj[key];
    }
  }
  return output;
}

exports.simplifyNode = function simplifyNode(node, dropName, keepArrays) {
  var output = {}
    , keys
    ;

  if (!exports.isSomething(node)) return null;
  if (node === null || typeof node !== 'object') return shallowClone(node);
  if (node.constructor === Array) return (!keepArrays && node.length === 1) ? node[0] : node;

  keys = Object.keys(node);
  keys.forEach(function eachKey(key) {
    var value = node[key]
      , markup
      ;

    if (key === '$markup') {
      markup = simplifyAll(value);
      if (markup.length > 0) output.$markup = markup;
    } else if (!(dropName && key === '$name') && exports.isSomething(value)) {
      if (!keepArrays && value.constructor === Array && value.length === 1) {
        output[key] = value[0];
      } else {
        output[key] = value;
      }
    }
  });

  keys = Object.keys(output);
  if (keys.length === 1 && keys[0] !== '$name') {
    output = shallowClone(output[keys[0]]);
  } else if (keys.length === 2 && !dropName && output.hasOwnProperty('$attrs')) {
    output = shallowClone(output.$attrs);
    output.$name = node.$name;
  }
  return output;
};

exports.shouldObjectifyMarkup = function shouldObjectifyMarkup(items) {
  var currentTag
      , foundTags = {}
      , shouldObjectify = true
      ;

  items.every(function eachIem(item) {
    if (typeof item === 'string') {
      currentTag = '$text';
    } else {
      currentTag = item[0].$name;
    }

    if (foundTags[currentTag]) {
      shouldObjectify = false;
      return false;
    }
    foundTags[currentTag] = true;
    return true;
  });
  return shouldObjectify;
};

exports.moosh = function moosh(item1, item2, useArrays) {
  if (item1 === undefined) {
    if (item2 !== null
      && typeof item2 === 'object'
      && item2.constructor === Array
      && item2.length === 1
    ) {
      return useArrays ? item2 : item2[0];
    }
    return useArrays ? [ item2 ] : item2;
  }

  if (item2 === undefined) {
    if (item1 !== null
      && typeof item1 === 'object'
      && item1.constructor === Array
      && item1.length === 1
    ) {
      return useArrays ? item1 : item1[0];
    }
    return useArrays ? [ item1 ] : item1;
  }

  if (item1 !== null && typeof item1 === 'object' && item1.constructor === Array) {
    if (item2 !== null && typeof item2 === 'object' && item2.constructor === Array) {
      return item1.concat(item2);
    }
    item1.push(item2);
    return item1;
  }

  if (item2 !== null && typeof item2 === 'object' && item2.constructor === Array) {
    return [ item1 ].concat(item2);
  }

  return [ item1, item2 ];
};

function simplifyAll(input, dropName) {
  var output = [];
  if (input !== null && typeof input === 'object' && input.constructor === Array) {
    input.forEach(function eachItem(item) {
      output.push(exports.simplifyNode(item, dropName));
    });
    return output;
  }
  return exports.simplifyNode(input, dropName);
}

exports.objectifyMarkup = function objectifyMarkup(node, keepArrays) {
  var key
    , output = {}
    ;

  Object.keys(node).forEach(function eachKey(nodeKey) {
    if (nodeKey !== '$markup') {
      output[nodeKey] = node[nodeKey];
    }
  });

  if (node.$markup) {
    node.$markup.forEach(function eachMarkupItem(item) {
      if (typeof item === 'string') {
        output.$text = exports.moosh(output.$text, item, keepArrays);
      } else if (typeof item === 'object') {
        if (item.constructor === Array) {
          key = item[0].$name;
        } else {
          key = item.$name;
        }
        output[key] = exports.moosh(output[key], simplifyAll(item, true), keepArrays);
      }
    });
  }
  return output;
};

exports.isSomething = function isSomething(value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (value.constructor === Array && value.length === 0) {
    return false;
  }

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return false;
  }

  if (typeof value === 'string' && value.length === 0) {
    return false;
  }
  return true;
};
