'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');

const ELEMENT_PARAGRAPH = 'p';
const DEFAULTS_PARAGRAPH = {
  hotkey: ['mod+opt+0', 'mod+shift+0']
};

const getParagraphDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, ELEMENT_PARAGRAPH);
  return {
    element: plateCommon.getElementDeserializer({
      type: options.type,
      rules: [{
        nodeNames: 'P'
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for paragraphs.
 */

const createParagraphPlugin = () => ({
  pluginKeys: ELEMENT_PARAGRAPH,
  renderElement: plateCore.getRenderElement(ELEMENT_PARAGRAPH),
  deserialize: getParagraphDeserialize(),
  onKeyDown: plateCommon.getToggleElementOnKeyDown(ELEMENT_PARAGRAPH)
});

exports.DEFAULTS_PARAGRAPH = DEFAULTS_PARAGRAPH;
exports.ELEMENT_PARAGRAPH = ELEMENT_PARAGRAPH;
exports.createParagraphPlugin = createParagraphPlugin;
exports.getParagraphDeserialize = getParagraphDeserialize;
//# sourceMappingURL=index.js.map
