import { getNode, setNodes, insertNodes } from '@udecode/plate-common';
import { isElement, getPlatePluginWithOverrides } from '@udecode/plate-core';
import { Node, Transforms } from 'slate';

const withNormalizeTypes = ({
  rules,
  onError
}) => editor => {
  const {
    normalizeNode
  } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const endCurrentNormalizationPass = rules.some(({
        strictType,
        type,
        path
      }) => {
        const node = getNode(editor, path);

        if (node) {
          if (strictType && isElement(node) && node.type !== strictType) {
            setNodes(editor, {
              type: strictType
            }, {
              at: path
            });
            return true;
          }
        } else {
          try {
            insertNodes(editor, {
              type: strictType !== null && strictType !== void 0 ? strictType : type,
              children: [{
                text: ''
              }]
            }, {
              at: path
            });
            return true;
          } catch (err) {
            onError === null || onError === void 0 ? void 0 : onError(err);
          }
        }

        return false;
      });

      if (endCurrentNormalizationPass) {
        return;
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
/**
 * @see {@link withNormalizeTypes}
 */

const createNormalizeTypesPlugin = getPlatePluginWithOverrides(withNormalizeTypes);

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/**
 * Casts `value` as an array if it's not one.
 *
 * @static
 * @memberOf _
 * @since 4.4.0
 * @category Lang
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast array.
 * @example
 *
 * _.castArray(1);
 * // => [1]
 *
 * _.castArray({ 'a': 1 });
 * // => [{ 'a': 1 }]
 *
 * _.castArray('abc');
 * // => ['abc']
 *
 * _.castArray(null);
 * // => [null]
 *
 * _.castArray(undefined);
 * // => [undefined]
 *
 * _.castArray();
 * // => []
 *
 * var array = [1, 2, 3];
 * console.log(_.castArray(array) === array);
 * // => true
 */
function castArray() {
  if (!arguments.length) {
    return [];
  }
  var value = arguments[0];
  return isArray_1(value) ? value : [value];
}

var castArray_1 = castArray;

/**
 * Remove nodes with empty text.
 */

const withRemoveEmptyNodes = options => editor => {
  const types = castArray_1(options.type);
  const {
    normalizeNode
  } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (isElement(node) && node.type && types.includes(node.type) && Node.string(node) === '') {
      Transforms.removeNodes(editor, {
        at: path
      });
      return;
    }

    normalizeNode([node, path]);
  };

  return editor;
};
/**
 * @see {@link withRemoveEmptyNodes}
 */

const createRemoveEmptyNodesPlugin = getPlatePluginWithOverrides(withRemoveEmptyNodes);

export { createNormalizeTypesPlugin, createRemoveEmptyNodesPlugin, withNormalizeTypes, withRemoveEmptyNodes };
//# sourceMappingURL=index.es.js.map
