'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');

const MARK_HIGHLIGHT = 'highlight';
const DEFAULTS_HIGHLIGHT = {
  hotkey: 'mod+shift+h'
};

const getHighlightDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_HIGHLIGHT);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_HIGHLIGHT),
  deserialize: getHighlightDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_HIGHLIGHT)
});

exports.DEFAULTS_HIGHLIGHT = DEFAULTS_HIGHLIGHT;
exports.MARK_HIGHLIGHT = MARK_HIGHLIGHT;
exports.createHighlightPlugin = createHighlightPlugin;
exports.getHighlightDeserialize = getHighlightDeserialize;
//# sourceMappingURL=index.js.map
