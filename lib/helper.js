/*
  This code was derived from lodash.js (the _.escape function)
  https://github.com/lodash/lodash
 */
const reUnescapedHtml = /[&<>"]/g;
const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

const escape = string => {
  const result = String(string);
  return (result && reHasUnescapedHtml.test(result))
    ? result.replace(reUnescapedHtml, chr => htmlEscapes[chr])
    : result;
};
/* end of derivation from lodash */

const isCongruent = (a, b) => (
  (typeof a === 'string' && typeof b === 'string')
  || (a && a[0].$name === b.$name)
);

const pushTogether = (a, b) => (typeof a === 'string' ? a + b : a.concat(b));

const condenseArray = items => items.reduce(
  (result, element) => {
    const lastPosition = result.length - 1;
    const last = result[lastPosition];
    if (isCongruent(last, element)) result[lastPosition] = pushTogether(last, element);
    else result.push(typeof element === 'string' ? element : [ element ]);
    return result;
  }, []
);

const disassembleNode = (node, dropName, unwrap) => {
  let $attrs = null;
  const stripped = {};
  Object.keys(node).forEach(key => {
    const val = isSomething(node[key]) ? node[key] : null;
    if (!val) return;
    switch (key) {
      case '$name':
        if (!dropName && val) stripped.$name = val;
        break;

      case '$attrs':
        $attrs = val;
        break;

      case '$markup':
        stripped.$markup = simplifyAll(val);
        break;

      default:
        if (val) stripped[key] = unwrap(val);
    }
  });
  return { stripped, $attrs };
};

const unwrapSingleArrays = x => (Array.isArray(x) && x.length === 1 ? x[0] : x);

const tryMergingAttrs = ($attrs, stripped) => {
  if (!isSomething(stripped)) return $attrs;
  if (!$attrs) return stripped;
  const keys = Object.keys(stripped);
  if (keys.length === 1 && stripped.$name) return Object.assign(stripped, $attrs);
  return Object.assign(stripped, { $attrs });
};

const tryGuttingNode = node => {
  if (!node) return node;
  const keys = Object.keys(node);
  const [ firstKey ] = keys;
  if (
    keys.length === 1
    && firstKey !== '$name'
    && firstKey !== 'id'
  ) return node[keys[0]];
  return node;
};

const simplifyNode = (node, dropName, keepArrays) => {
  const unwrap = keepArrays ? x => x : unwrapSingleArrays;
  const unwrapped = unwrap(node);
  if (!isSomething(unwrapped)) return null;
  if (
    typeof unwrapped !== 'object'
    || Array.isArray(unwrapped)
  ) return unwrapped;
  const { $attrs, stripped } = disassembleNode(unwrapped, dropName, unwrap);
  const merged = tryMergingAttrs($attrs, stripped);
  return tryGuttingNode(merged);
};

const shouldObjectifyMarkup = items => {
  let currentTag;
  const foundTags = {};
  let shouldObjectify = true;

  items.every(item => {
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

/**
 * Try to concatenate things into one array (arrays, strings, whatever).
 * Be smart about the inputs, so as to create a simple array.
 * @param  {any}   [a=[]]                         String, array, whatever
 * @param  {any}   [b=[]]                         String, array, whatever
 * @param  {boolean} [preserveSingleArrays=false] Whether to unwrap a result of length = 1
 * @return {Array|any}                            The mooshing of the inputs
 */
const moosh = (a = [], b = [], preserveSingleArrays = false) => {
  const arrayA = Array.isArray(a) ? a : [ a ];
  const arrayB = Array.isArray(b) ? b : [ b ];
  const mooshed = arrayA.concat(arrayB);
  return ((mooshed.length === 1 && !preserveSingleArrays) ? mooshed[0] : mooshed);
};

const simplifyAll = (input, dropName) => {
  const output = [];
  if (input !== null && typeof input === 'object' && input.constructor === Array) {
    input.forEach(item => {
      output.push(simplifyNode(item, dropName));
    });
    return output;
  }
  return simplifyNode(input, dropName);
};

const objectifyMarkup = (node, keepArrays) => {
  let key;
  const output = {};

  Object.keys(node).forEach(nodeKey => {
    if (nodeKey !== '$markup') {
      output[nodeKey] = node[nodeKey];
    }
  });

  if (node.$markup) {
    node.$markup.forEach(item => {
      if (typeof item === 'string') {
        output.$text = moosh(output.$text, item, keepArrays);
      } else if (typeof item === 'object') {
        if (item.constructor === Array) {
          key = item[0].$name;
        } else {
          key = item.$name;
        }
        output[key] = moosh(output[key], simplifyAll(item, true), keepArrays);
      }
    });
  }
  return output;
};

const isSomething = value => (
  value != null
  && (value.length == null || value.length !== 0)
  && (typeof value !== 'object' || Object.keys(value).length !== 0)
);

module.exports = {
  condenseArray,
  escape,
  isSomething,
  moosh,
  objectifyMarkup,
  shouldObjectifyMarkup,
  simplifyNode
};
