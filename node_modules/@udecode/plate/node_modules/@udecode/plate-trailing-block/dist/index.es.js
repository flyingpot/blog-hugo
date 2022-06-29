import { ELEMENT_DEFAULT, getLastNode, queryNode, insertNodes } from '@udecode/plate-common';
import { getPlatePluginType, getPlatePluginWithOverrides } from '@udecode/plate-core';
import { Path } from 'slate';

/**
 * Add a trailing block when the last node type is not `type` and when the editor has .
 */
const withTrailingBlock = ({
  type: _type,
  level = 0,
  ...query
} = {}) => editor => {
  const {
    normalizeNode
  } = editor;
  const type = _type !== null && _type !== void 0 ? _type : getPlatePluginType(editor, ELEMENT_DEFAULT);

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const lastChild = getLastNode(editor, level);
      const lastChildNode = lastChild === null || lastChild === void 0 ? void 0 : lastChild[0];

      if (!lastChildNode || lastChildNode.type !== type && queryNode(lastChild, query)) {
        const at = lastChild ? Path.next(lastChild[1]) : [0];
        insertNodes(editor, {
          type,
          children: [{
            text: ''
          }]
        }, {
          at
        });
        return;
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
/**
 * @see {@link withTrailingNode}
 */

const createTrailingBlockPlugin = getPlatePluginWithOverrides(withTrailingBlock);

export { createTrailingBlockPlugin, withTrailingBlock };
//# sourceMappingURL=index.es.js.map
