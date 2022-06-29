import { getElementDeserializer, getToggleElementOnKeyDown } from '@udecode/plate-common';
import { getPlatePluginOptions, getRenderElement } from '@udecode/plate-core';

const ELEMENT_BLOCKQUOTE = 'blockquote';
const DEFAULTS_BLOCKQUOTE = {
  hotkey: 'mod+shift+.'
};

const getBlockquoteDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, ELEMENT_BLOCKQUOTE);
  return {
    element: getElementDeserializer({
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
  renderElement: getRenderElement(ELEMENT_BLOCKQUOTE),
  deserialize: getBlockquoteDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_BLOCKQUOTE)
});

export { DEFAULTS_BLOCKQUOTE, ELEMENT_BLOCKQUOTE, createBlockquotePlugin, getBlockquoteDeserialize };
//# sourceMappingURL=index.es.js.map
