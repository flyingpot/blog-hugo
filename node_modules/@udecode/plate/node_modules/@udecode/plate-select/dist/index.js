'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');
var slate = require('slate');

/**
 * Set a list of element types to select on backspace
 */
const withSelectOnBackspace = query => editor => {
  const {
    deleteBackward
  } = editor;

  editor.deleteBackward = unit => {
    const {
      selection
    } = editor;

    if (unit === 'character' && plateCommon.isCollapsed(selection)) {
      const prevNode = slate.Editor.before(editor, selection, {
        unit
      });

      if (prevNode) {
        const [prevCell] = slate.Editor.nodes(editor, {
          match: node => plateCommon.queryNode([node, prevNode.path], query),
          at: prevNode
        });

        if (!!prevCell && prevNode) {
          // don't delete image, set selection there
          slate.Transforms.select(editor, prevNode);
        } else {
          deleteBackward(unit);
        }
      } else {
        deleteBackward(unit);
      }
    } else {
      deleteBackward(unit);
    }
  };

  return editor;
};
/**
 * @see {@link withSelectOnBackspace}
 */

const createSelectOnBackspacePlugin = plateCore.getPlatePluginWithOverrides(withSelectOnBackspace);

exports.createSelectOnBackspacePlugin = createSelectOnBackspacePlugin;
exports.withSelectOnBackspace = withSelectOnBackspace;
//# sourceMappingURL=index.js.map
