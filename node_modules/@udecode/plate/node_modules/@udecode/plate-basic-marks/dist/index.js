'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');

const MARK_BOLD = 'bold';
const DEFAULTS_BOLD = {
  hotkey: 'mod+b'
};

const getBoldDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_BOLD);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_BOLD),
  deserialize: getBoldDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_BOLD)
});

const MARK_CODE = 'code';
const DEFAULTS_CODE = {
  hotkey: 'mod+e'
};

const getCodeDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_CODE);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_CODE),
  deserialize: getCodeDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_CODE)
});

const MARK_ITALIC = 'italic';
const DEFAULTS_ITALIC = {
  hotkey: 'mod+i'
};

const getItalicDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_ITALIC);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_ITALIC),
  deserialize: getItalicDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_ITALIC)
});

const MARK_STRIKETHROUGH = 'strikethrough';
const DEFAULTS_STRIKETHROUGH = {
  hotkey: 'mod+shift+s'
};

const getStrikethroughDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_STRIKETHROUGH);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_STRIKETHROUGH),
  deserialize: getStrikethroughDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_STRIKETHROUGH)
});

const MARK_SUBSCRIPT = 'subscript';
const DEFAULTS_SUBSCRIPT = {
  hotkey: 'mod+.',
  clear: MARK_SUBSCRIPT
};

const getSubscriptDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_SUBSCRIPT);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_SUBSCRIPT),
  deserialize: getSubscriptDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_SUBSCRIPT)
});

const MARK_SUPERSCRIPT = 'superscript';
const DEFAULTS_SUPERSCRIPT = {
  hotkey: 'mod+,',
  clear: MARK_SUPERSCRIPT
};

const getSuperscriptDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_SUPERSCRIPT);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_SUPERSCRIPT),
  deserialize: getSuperscriptDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_SUPERSCRIPT)
});

const MARK_UNDERLINE = 'underline';
const DEFAULTS_UNDERLINE = {
  hotkey: 'mod+u'
};

const getUnderlineDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_UNDERLINE);
  return {
    leaf: plateCommon.getLeafDeserializer({
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
  renderLeaf: plateCore.getRenderLeaf(MARK_UNDERLINE),
  deserialize: getUnderlineDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_UNDERLINE)
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

exports.DEFAULTS_BOLD = DEFAULTS_BOLD;
exports.DEFAULTS_CODE = DEFAULTS_CODE;
exports.DEFAULTS_ITALIC = DEFAULTS_ITALIC;
exports.DEFAULTS_STRIKETHROUGH = DEFAULTS_STRIKETHROUGH;
exports.DEFAULTS_SUBSCRIPT = DEFAULTS_SUBSCRIPT;
exports.DEFAULTS_SUPERSCRIPT = DEFAULTS_SUPERSCRIPT;
exports.DEFAULTS_UNDERLINE = DEFAULTS_UNDERLINE;
exports.MARK_BOLD = MARK_BOLD;
exports.MARK_CODE = MARK_CODE;
exports.MARK_ITALIC = MARK_ITALIC;
exports.MARK_STRIKETHROUGH = MARK_STRIKETHROUGH;
exports.MARK_SUBSCRIPT = MARK_SUBSCRIPT;
exports.MARK_SUPERSCRIPT = MARK_SUPERSCRIPT;
exports.MARK_UNDERLINE = MARK_UNDERLINE;
exports.createBasicMarkPlugins = createBasicMarkPlugins;
exports.createBoldPlugin = createBoldPlugin;
exports.createCodePlugin = createCodePlugin;
exports.createItalicPlugin = createItalicPlugin;
exports.createStrikethroughPlugin = createStrikethroughPlugin;
exports.createSubscriptPlugin = createSubscriptPlugin;
exports.createSuperscriptPlugin = createSuperscriptPlugin;
exports.createUnderlinePlugin = createUnderlinePlugin;
exports.getBoldDeserialize = getBoldDeserialize;
exports.getCodeDeserialize = getCodeDeserialize;
exports.getItalicDeserialize = getItalicDeserialize;
exports.getStrikethroughDeserialize = getStrikethroughDeserialize;
exports.getSubscriptDeserialize = getSubscriptDeserialize;
exports.getSuperscriptDeserialize = getSuperscriptDeserialize;
exports.getUnderlineDeserialize = getUnderlineDeserialize;
//# sourceMappingURL=index.js.map
