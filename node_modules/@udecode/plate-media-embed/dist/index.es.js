import { getPlatePluginOptions, getSlateClass, getRenderElement, getPlatePluginTypes } from '@udecode/plate-core';
import { getNodeDeserializer, getParent, insertNodes } from '@udecode/plate-common';

const ELEMENT_MEDIA_EMBED = 'media_embed';

const getMediaEmbedDeserialize = (pluginKey = ELEMENT_MEDIA_EMBED) => editor => {
  const options = getPlatePluginOptions(editor, pluginKey);
  return {
    element: getNodeDeserializer({
      type: options.type,
      getNode: el => {
        const url = el.getAttribute('src');

        if (url) {
          return {
            type: options.type,
            url
          };
        }
      },
      rules: [{
        nodeNames: 'IFRAME'
      }, {
        className: getSlateClass(options.type)
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */

const createMediaEmbedPlugin = ({
  pluginKey = ELEMENT_MEDIA_EMBED
} = {}) => ({
  pluginKeys: pluginKey,
  renderElement: getRenderElement(pluginKey),
  deserialize: getMediaEmbedDeserialize(pluginKey),
  voidTypes: getPlatePluginTypes(pluginKey)
});

const insertMediaEmbed = (editor, {
  url = '',
  pluginKey = ELEMENT_MEDIA_EMBED
}) => {
  if (!editor.selection) return;
  const selectionParentEntry = getParent(editor, editor.selection);
  if (!selectionParentEntry) return;
  const [, path] = selectionParentEntry;
  insertNodes(editor, {
    type: pluginKey,
    url,
    children: [{
      text: ''
    }]
  }, {
    at: path
  });
};

export { ELEMENT_MEDIA_EMBED, createMediaEmbedPlugin, getMediaEmbedDeserialize, insertMediaEmbed };
//# sourceMappingURL=index.es.js.map
