import { getLeafDeserializer, getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getPlatePluginOptions, getRenderLeaf } from '@udecode/plate-core';

const MARK_HIGHLIGHT = 'highlight';
const DEFAULTS_HIGHLIGHT = {
  hotkey: 'mod+shift+h'
};

const getHighlightDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_HIGHLIGHT);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['MARK']
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */

const createHighlightPlugin = () => ({
  pluginKeys: MARK_HIGHLIGHT,
  renderLeaf: getRenderLeaf(MARK_HIGHLIGHT),
  deserialize: getHighlightDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_HIGHLIGHT)
});

export { DEFAULTS_HIGHLIGHT, MARK_HIGHLIGHT, createHighlightPlugin, getHighlightDeserialize };
//# sourceMappingURL=index.es.js.map
