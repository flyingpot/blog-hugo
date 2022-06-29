import { getElementDeserializer, getToggleElementOnKeyDown } from '@udecode/plate-common';
import { getPlatePluginOptions, getRenderElement } from '@udecode/plate-core';

const ELEMENT_PARAGRAPH = 'p';
const DEFAULTS_PARAGRAPH = {
  hotkey: ['mod+opt+0', 'mod+shift+0']
};

const getParagraphDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, ELEMENT_PARAGRAPH);
  return {
    element: getElementDeserializer({
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
  renderElement: getRenderElement(ELEMENT_PARAGRAPH),
  deserialize: getParagraphDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_PARAGRAPH)
});

export { DEFAULTS_PARAGRAPH, ELEMENT_PARAGRAPH, createParagraphPlugin, getParagraphDeserialize };
//# sourceMappingURL=index.es.js.map
