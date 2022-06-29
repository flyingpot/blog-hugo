'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');
var slate = require('slate');

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
  const type = _type !== null && _type !== void 0 ? _type : plateCore.getPlatePluginType(editor, plateCommon.ELEMENT_DEFAULT);

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const lastChild = plateCommon.getLastNode(editor, level);
      const lastChildNode = lastChild === null || lastChild === void 0 ? void 0 : lastChild[0];

      if (!lastChildNode || lastChildNode.type !== type && plateCommon.queryNode(lastChild, query)) {
        const at = lastChild ? slate.Path.next(lastChild[1]) : [0];
        plateCommon.insertNodes(editor, {
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

const createTrailingBlockPlugin = plateCore.getPlatePluginWithOverrides(withTrailingBlock);

exports.createTrailingBlockPlugin = createTrailingBlockPlugin;
exports.withTrailingBlock = withTrailingBlock;
//# sourceMappingURL=index.js.map
