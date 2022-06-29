import { getLeafDeserializer, getToggleMarkOnKeyDown } from '@udecode/plate-common';
import { getPlatePluginOptions, getRenderLeaf } from '@udecode/plate-core';

const MARK_BOLD = 'bold';
const DEFAULTS_BOLD = {
  hotkey: 'mod+b'
};

const getBoldDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_BOLD);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['STRONG']
      }, {
        style: {
          fontWeight: ['600', '700', 'bold']
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for bold formatting
 */

const createBoldPlugin = () => ({
  pluginKeys: MARK_BOLD,
  renderLeaf: getRenderLeaf(MARK_BOLD),
  deserialize: getBoldDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_BOLD)
});

const MARK_CODE = 'code';
const DEFAULTS_CODE = {
  hotkey: 'mod+e'
};

const getCodeDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_CODE);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['CODE']
      }, {
        style: {
          wordWrap: 'break-word'
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for code formatting
 */

const createCodePlugin = () => ({
  pluginKeys: MARK_CODE,
  renderLeaf: getRenderLeaf(MARK_CODE),
  deserialize: getCodeDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_CODE)
});

const MARK_ITALIC = 'italic';
const DEFAULTS_ITALIC = {
  hotkey: 'mod+i'
};

const getItalicDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_ITALIC);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['EM', 'I']
      }, {
        style: {
          fontStyle: 'italic'
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for italic formatting.
 */

const createItalicPlugin = () => ({
  pluginKeys: MARK_ITALIC,
  renderLeaf: getRenderLeaf(MARK_ITALIC),
  deserialize: getItalicDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_ITALIC)
});

const MARK_STRIKETHROUGH = 'strikethrough';
const DEFAULTS_STRIKETHROUGH = {
  hotkey: 'mod+shift+s'
};

const getStrikethroughDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_STRIKETHROUGH);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['S', 'DEL', 'STRIKE']
      }, {
        style: {
          textDecoration: 'line-through'
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for strikethrough formatting.
 */

const createStrikethroughPlugin = () => ({
  pluginKeys: MARK_STRIKETHROUGH,
  renderLeaf: getRenderLeaf(MARK_STRIKETHROUGH),
  deserialize: getStrikethroughDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_STRIKETHROUGH)
});

const MARK_SUBSCRIPT = 'subscript';
const DEFAULTS_SUBSCRIPT = {
  hotkey: 'mod+.',
  clear: MARK_SUBSCRIPT
};

const getSubscriptDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_SUBSCRIPT);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['SUB']
      }, {
        style: {
          verticalAlign: 'sub'
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for subscript formatting.
 */

const createSubscriptPlugin = () => ({
  pluginKeys: MARK_SUBSCRIPT,
  renderLeaf: getRenderLeaf(MARK_SUBSCRIPT),
  deserialize: getSubscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUBSCRIPT)
});

const MARK_SUPERSCRIPT = 'superscript';
const DEFAULTS_SUPERSCRIPT = {
  hotkey: 'mod+,',
  clear: MARK_SUPERSCRIPT
};

const getSuperscriptDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_SUPERSCRIPT);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['SUP']
      }, {
        style: {
          verticalAlign: 'super'
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for superscript formatting.
 */

const createSuperscriptPlugin = () => ({
  pluginKeys: MARK_SUPERSCRIPT,
  renderLeaf: getRenderLeaf(MARK_SUPERSCRIPT),
  deserialize: getSuperscriptDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_SUPERSCRIPT)
});

const MARK_UNDERLINE = 'underline';
const DEFAULTS_UNDERLINE = {
  hotkey: 'mod+u'
};

const getUnderlineDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, MARK_UNDERLINE);
  return {
    leaf: getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['U']
      }, {
        style: {
          textDecoration: 'underline'
        }
      }],
      ...options.deserialize
    })
  };
};

/**
 * Enables support for underline formatting.
 */

const createUnderlinePlugin = () => ({
  pluginKeys: MARK_UNDERLINE,
  renderLeaf: getRenderLeaf(MARK_UNDERLINE),
  deserialize: getUnderlineDeserialize(),
  onKeyDown: getToggleMarkOnKeyDown(MARK_UNDERLINE)
});

/**
 * Enables support for basic marks:
 * - Bold
 * - Code
 * - Italic
 * - Strikethrough
 * - Subscript
 * - Superscript
 * - Underline
 */

const createBasicMarkPlugins = () => [createBoldPlugin(), createCodePlugin(), createItalicPlugin(), createStrikethroughPlugin(), createSubscriptPlugin(), createSuperscriptPlugin(), createUnderlinePlugin()];

export { DEFAULTS_BOLD, DEFAULTS_CODE, DEFAULTS_ITALIC, DEFAULTS_STRIKETHROUGH, DEFAULTS_SUBSCRIPT, DEFAULTS_SUPERSCRIPT, DEFAULTS_UNDERLINE, MARK_BOLD, MARK_CODE, MARK_ITALIC, MARK_STRIKETHROUGH, MARK_SUBSCRIPT, MARK_SUPERSCRIPT, MARK_UNDERLINE, createBasicMarkPlugins, createBoldPlugin, createCodePlugin, createItalicPlugin, createStrikethroughPlugin, createSubscriptPlugin, createSuperscriptPlugin, createUnderlinePlugin, getBoldDeserialize, getCodeDeserialize, getItalicDeserialize, getStrikethroughDeserialize, getSubscriptDeserialize, getSuperscriptDeserialize, getUnderlineDeserialize };
//# sourceMappingURL=index.es.js.map
