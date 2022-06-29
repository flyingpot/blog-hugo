import { getLeafDeserializer, getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getPlatePluginOptions, getRenderLeaf } from '@udecode/plate-core';

const MARK_KBD = 'kbd';

const getKbdDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_KBD);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['KBD']
      }, {
        style: {
          wordWrap: 'break-word'
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for code formatting
 */

const createKbdPlugin = () => ({
  pluginKeys: MARK_KBD,
  renderLeaf: getRenderLeaf(MARK_KBD),
  deserialize: getKbdDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_KBD)
});

export { MARK_KBD, createKbdPlugin, getKbdDeserialize };
//# sourceMappingURL=index.es.js.map
