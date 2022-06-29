import { isCollapsed, queryNode } from '@udecode/plate-common';
import { getPlatePluginWithOverrides } from '@udecode/plate-core';
import { Editor, Transforms } from 'slate';

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

    if (unit === 'character' && isCollapsed(selection)) {
      const prevNode = Editor.before(editor, selection, {
        unit
      });

      if (prevNode) {
        const [prevCell] = Editor.nodes(editor, {
          match: node => queryNode([node, prevNode.path], query),
          at: prevNode
        });

        if (!!prevCell && prevNode) {
          // don't delete image, set selection there
          Transforms.select(editor, prevNode);
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

const createSelectOnBackspacePlugin = getPlatePluginWithOverrides(withSelectOnBackspace);

export { createSelectOnBackspacePlugin, withSelectOnBackspace };
//# sourceMappingURL=index.es.js.map
