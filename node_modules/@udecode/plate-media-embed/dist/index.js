'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCore = require('@udecode/plate-core');
var plateCommon = require('@udecode/plate-common');

const ELEMENT_MEDIA_EMBED = 'media_embed';

const getMediaEmbedDeserialize = (pluginKey = ELEMENT_MEDIA_EMBED) => editor => {
  const options = plateCore.getPlatePluginOptions(editor, pluginKey);
  return {
    element: plateCommon.getNodeDeserializer({
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
        className: plateCore.getSlateClass(options.type)
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
  renderElement: plateCore.getRenderElement(pluginKey),
  deserialize: getMediaEmbedDeserialize(pluginKey),
  voidTypes: plateCore.getPlatePluginTypes(pluginKey)
});

const insertMediaEmbed = (editor, {
  url = '',
  pluginKey = ELEMENT_MEDIA_EMBED
}) => {
  if (!editor.selection) return;
  const selectionParentEntry = plateCommon.getParent(editor, editor.selection);
  if (!selectionParentEntry) return;
  const [, path] = selectionParentEntry;
  plateCommon.insertNodes(editor, {
    type: pluginKey,
    url,
    children: [{
      text: ''
    }]
  }, {
    at: path
  });
};

exports.ELEMENT_MEDIA_EMBED = ELEMENT_MEDIA_EMBED;
exports.createMediaEmbedPlugin = createMediaEmbedPlugin;
exports.getMediaEmbedDeserialize = getMediaEmbedDeserialize;
exports.insertMediaEmbed = insertMediaEmbed;
//# sourceMappingURL=index.js.map
