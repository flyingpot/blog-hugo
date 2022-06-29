import { isUrl } from '@udecode/plate-common';
import { getPlatePluginType, getPlatePluginWithOverrides } from '@udecode/plate-core';
import { isDeserializerEnabled, insertDeserializedFragment } from '@udecode/plate-serializer';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6 } from '@udecode/plate-heading';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_UL, ELEMENT_OL, ELEMENT_LI } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';

const MARK_BOLD = 'bold';

const MARK_CODE = 'code';

const MARK_ITALIC = 'italic';

const MARK_STRIKETHROUGH = 'strikethrough';

/**
 * Deserialize content from Markdown format to Slate format.
 * `editor` needs
 */

const deserializeMD = (editor, content) => {
  const tree = unified().use(markdown).use(slate, {
    nodeTypes: {
      paragraph: getPlatePluginType(editor, ELEMENT_PARAGRAPH),
      block_quote: getPlatePluginType(editor, ELEMENT_BLOCKQUOTE),
      link: getPlatePluginType(editor, ELEMENT_LINK),
      inline_code_mark: getPlatePluginType(editor, MARK_CODE),
      emphasis_mark: getPlatePluginType(editor, MARK_ITALIC),
      strong_mark: getPlatePluginType(editor, MARK_BOLD),
      delete_mark: getPlatePluginType(editor, MARK_STRIKETHROUGH),
      // FIXME: underline, subscript superscript not yet supported by remark-slate
      // underline: getPlatePluginType(editor, MARK_UNDERLINE),
      // subscript: getPlatePluginType(editor, MARK_SUBSCRIPT),
      // superscript: getPlatePluginType(editor, MARK_SUPERSCRIPT),
      code_block: getPlatePluginType(editor, ELEMENT_CODE_BLOCK),
      ul_list: getPlatePluginType(editor, ELEMENT_UL),
      ol_list: getPlatePluginType(editor, ELEMENT_OL),
      listItem: getPlatePluginType(editor, ELEMENT_LI),
      heading: {
        1: getPlatePluginType(editor, ELEMENT_H1),
        2: getPlatePluginType(editor, ELEMENT_H2),
        3: getPlatePluginType(editor, ELEMENT_H3),
        4: getPlatePluginType(editor, ELEMENT_H4),
        5: getPlatePluginType(editor, ELEMENT_H5),
        6: getPlatePluginType(editor, ELEMENT_H6)
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
    const isEnabled = isDeserializerEnabled(editor, plugins, mdDeserializerId);
    const {
      files
    } = data;

    if (content && isEnabled && !(files !== null && files !== void 0 && files.length)) {
      // if content is simply a URL pass through to not break LinkPlugin
      if (isUrl(content)) {
        return insertData(data);
      }

      const fragment = deserializeMD(editor, content);

      if (fragment.length) {
        return insertDeserializedFragment(editor, {
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

const createDeserializeMDPlugin = getPlatePluginWithOverrides(withDeserializeMD);

export { createDeserializeMDPlugin, deserializeMD, filterBreaklines, mdDeserializerId, withDeserializeMD };
//# sourceMappingURL=index.es.js.map
