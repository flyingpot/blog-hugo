'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');
var plateSerializer = require('@udecode/plate-serializer');
var plateBlockQuote = require('@udecode/plate-block-quote');
var plateCodeBlock = require('@udecode/plate-code-block');
var plateHeading = require('@udecode/plate-heading');
var plateLink = require('@udecode/plate-link');
var plateList = require('@udecode/plate-list');
var plateParagraph = require('@udecode/plate-paragraph');
var markdown = require('remark-parse');
var slate = require('remark-slate');
var unified = require('unified');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var markdown__default = /*#__PURE__*/_interopDefaultLegacy(markdown);
var slate__default = /*#__PURE__*/_interopDefaultLegacy(slate);
var unified__default = /*#__PURE__*/_interopDefaultLegacy(unified);

const MARK_BOLD = 'bold';

const MARK_CODE = 'code';

const MARK_ITALIC = 'italic';

const MARK_STRIKETHROUGH = 'strikethrough';

/**
 * Deserialize content from Markdown format to Slate format.
 * `editor` needs
 */

const deserializeMD = (editor, content) => {
  const tree = unified__default['default']().use(markdown__default['default']).use(slate__default['default'], {
    nodeTypes: {
      paragraph: plateCore.getPlatePluginType(editor, plateParagraph.ELEMENT_PARAGRAPH),
      block_quote: plateCore.getPlatePluginType(editor, plateBlockQuote.ELEMENT_BLOCKQUOTE),
      link: plateCore.getPlatePluginType(editor, plateLink.ELEMENT_LINK),
      inline_code_mark: plateCore.getPlatePluginType(editor, MARK_CODE),
      emphasis_mark: plateCore.getPlatePluginType(editor, MARK_ITALIC),
      strong_mark: plateCore.getPlatePluginType(editor, MARK_BOLD),
      delete_mark: plateCore.getPlatePluginType(editor, MARK_STRIKETHROUGH),
      // FIXME: underline, subscript superscript not yet supported by remark-slate
      // underline: getPlatePluginType(editor, MARK_UNDERLINE),
      // subscript: getPlatePluginType(editor, MARK_SUBSCRIPT),
      // superscript: getPlatePluginType(editor, MARK_SUPERSCRIPT),
      code_block: plateCore.getPlatePluginType(editor, plateCodeBlock.ELEMENT_CODE_BLOCK),
      ul_list: plateCore.getPlatePluginType(editor, plateList.ELEMENT_UL),
      ol_list: plateCore.getPlatePluginType(editor, plateList.ELEMENT_OL),
      listItem: plateCore.getPlatePluginType(editor, plateList.ELEMENT_LI),
      heading: {
        1: plateCore.getPlatePluginType(editor, plateHeading.ELEMENT_H1),
        2: plateCore.getPlatePluginType(editor, plateHeading.ELEMENT_H2),
        3: plateCore.getPlatePluginType(editor, plateHeading.ELEMENT_H3),
        4: plateCore.getPlatePluginType(editor, plateHeading.ELEMENT_H4),
        5: plateCore.getPlatePluginType(editor, plateHeading.ELEMENT_H5),
        6: plateCore.getPlatePluginType(editor, plateHeading.ELEMENT_H6)
      }
    },
    linkDestinationKey: 'url'
  }).processSync(content);
  return tree.result;
};

function filterBreaklines(item) {
  return !item.text;
}

const mdDeserializerId = 'MD Deserializer';
/**
 * Enables support for deserializing content
 * from Markdown format to Slate format.
 */

const withDeserializeMD = ({
  plugins = []
} = {}) => editor => {
  const {
    insertData
  } = editor;

  editor.insertData = data => {
    const content = data.getData('text/plain');
    const isEnabled = plateSerializer.isDeserializerEnabled(editor, plugins, mdDeserializerId);
    const {
      files
    } = data;

    if (content && isEnabled && !(files !== null && files !== void 0 && files.length)) {
      // if content is simply a URL pass through to not break LinkPlugin
      if (plateCommon.isUrl(content)) {
        return insertData(data);
      }

      const fragment = deserializeMD(editor, content);

      if (fragment.length) {
        return plateSerializer.insertDeserializedFragment(editor, {
          plugins,
          fragment
        });
      }
    }

    insertData(data);
  };

  return editor;
};
/**
 * @see {@link withDeserializeMd}
 */

const createDeserializeMDPlugin = plateCore.getPlatePluginWithOverrides(withDeserializeMD);

exports.createDeserializeMDPlugin = createDeserializeMDPlugin;
exports.deserializeMD = deserializeMD;
exports.filterBreaklines = filterBreaklines;
exports.mdDeserializerId = mdDeserializerId;
exports.withDeserializeMD = withDeserializeMD;
//# sourceMappingURL=index.js.map
