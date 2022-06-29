'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');

const ELEMENT_BLOCKQUOTE = 'blockquote';
const DEFAULTS_BLOCKQUOTE = {
  hotkey: 'mod+shift+.'
};

const getBlockquoteDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, ELEMENT_BLOCKQUOTE);
  return {
    element: plateCommon.getElementDeserializer({
      type: options.type,
      rules: [{
        nodeNames: 'BLOCKQUOTE'
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */

const createBlockquotePlugin = () => ({
  pluginKeys: ELEMENT_BLOCKQUOTE,
  renderElement: plateCore.getRenderElement(ELEMENT_BLOCKQUOTE),
  deserialize: getBlockquoteDeserialize(),
  onKeyDown: plateCommon.getToggleElementOnKeyDown(ELEMENT_BLOCKQUOTE)
});

exports.DEFAULTS_BLOCKQUOTE = DEFAULTS_BLOCKQUOTE;
exports.ELEMENT_BLOCKQUOTE = ELEMENT_BLOCKQUOTE;
exports.createBlockquotePlugin = createBlockquotePlugin;
exports.getBlockquoteDeserialize = getBlockquoteDeserialize;
//# sourceMappingURL=index.js.map
