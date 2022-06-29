'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');

const ELEMENT_H1 = 'h1';
const ELEMENT_H2 = 'h2';
const ELEMENT_H3 = 'h3';
const ELEMENT_H4 = 'h4';
const ELEMENT_H5 = 'h5';
const ELEMENT_H6 = 'h6';
const KEYS_HEADING = [ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6];
const DEFAULT_HEADING_LEVEL = 6;
const DEFAULTS_H1 = {
  hotkey: ['mod+opt+1', 'mod+shift+1']
};
const DEFAULTS_H2 = {
  hotkey: ['mod+opt+2', 'mod+shift+2']
};
const DEFAULTS_H3 = {
  hotkey: ['mod+opt+3', 'mod+shift+3']
};

const getHeadingDeserialize = ({
  levels = DEFAULT_HEADING_LEVEL
} = {}) => editor => {
  const h1 = plateCore.getPlatePluginOptions(editor, ELEMENT_H1);
  const h2 = plateCore.getPlatePluginOptions(editor, ELEMENT_H2);
  const h3 = plateCore.getPlatePluginOptions(editor, ELEMENT_H3);
  const h4 = plateCore.getPlatePluginOptions(editor, ELEMENT_H4);
  const h5 = plateCore.getPlatePluginOptions(editor, ELEMENT_H5);
  const h6 = plateCore.getPlatePluginOptions(editor, ELEMENT_H6);
  let deserializers = plateCommon.getElementDeserializer({
    type: h1.type,
    rules: [{
      nodeNames: 'H1'
    }],
    ...h1.deserialize
  });
  if (levels >= 2) deserializers = [...deserializers, ...plateCommon.getElementDeserializer({
    type: h2.type,
    rules: [{
      nodeNames: 'H2'
    }],
    ...h2.deserialize
  })];
  if (levels >= 3) deserializers = [...deserializers, ...plateCommon.getElementDeserializer({
    type: h3.type,
    rules: [{
      nodeNames: 'H3'
    }],
    ...h3.deserialize
  })];
  if (levels >= 4) deserializers = [...deserializers, ...plateCommon.getElementDeserializer({
    type: h4.type,
    rules: [{
      nodeNames: 'H4'
    }],
    ...h4.deserialize
  })];
  if (levels >= 5) deserializers = [...deserializers, ...plateCommon.getElementDeserializer({
    type: h5.type,
    rules: [{
      nodeNames: 'H5'
    }],
    ...h5.deserialize
  })];
  if (levels >= 6) deserializers = [...deserializers, ...plateCommon.getElementDeserializer({
    type: h6.type,
    rules: [{
      nodeNames: 'H6'
    }],
    ...h6.deserialize
  })];
  return {
    element: deserializers
  };
};

/**
 * Font sizes are relative to the base font size
 * H1 - fs * 20/11
 * H2 - fs * 16/11
 * H3 - fs * 14/11
 * H4 - fs * 12/11
 * H5 - fs * 1
 * H6 - fs * 1
 */
const getHeadingRenderElement = ({
  levels = DEFAULT_HEADING_LEVEL
} = {}) => editor => {
  const h1 = plateCore.getPlatePluginOptions(editor, ELEMENT_H1);
  const h2 = plateCore.getPlatePluginOptions(editor, ELEMENT_H2);
  const h3 = plateCore.getPlatePluginOptions(editor, ELEMENT_H3);
  const h4 = plateCore.getPlatePluginOptions(editor, ELEMENT_H4);
  const h5 = plateCore.getPlatePluginOptions(editor, ELEMENT_H5);
  const h6 = plateCore.getPlatePluginOptions(editor, ELEMENT_H6);
  const renderElementsOptions = [];

  const checkRenderElement = (level, optionsValues) => {
    if (levels >= level) renderElementsOptions.push(optionsValues);
  };

  checkRenderElement(1, h1);
  checkRenderElement(2, h2);
  checkRenderElement(3, h3);
  checkRenderElement(4, h4);
  checkRenderElement(5, h5);
  checkRenderElement(6, h6);
  return plateCore.getEditableRenderElement(renderElementsOptions);
};

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
const createHeadingPlugin = ({
  levels = DEFAULT_HEADING_LEVEL
} = {}) => ({
  pluginKeys: KEYS_HEADING,
  renderElement: getHeadingRenderElement({
    levels
  }),
  deserialize: getHeadingDeserialize({
    levels
  }),
  onKeyDown: plateCommon.getToggleElementOnKeyDown(KEYS_HEADING)
});

exports.DEFAULTS_H1 = DEFAULTS_H1;
exports.DEFAULTS_H2 = DEFAULTS_H2;
exports.DEFAULTS_H3 = DEFAULTS_H3;
exports.DEFAULT_HEADING_LEVEL = DEFAULT_HEADING_LEVEL;
exports.ELEMENT_H1 = ELEMENT_H1;
exports.ELEMENT_H2 = ELEMENT_H2;
exports.ELEMENT_H3 = ELEMENT_H3;
exports.ELEMENT_H4 = ELEMENT_H4;
exports.ELEMENT_H5 = ELEMENT_H5;
exports.ELEMENT_H6 = ELEMENT_H6;
exports.KEYS_HEADING = KEYS_HEADING;
exports.createHeadingPlugin = createHeadingPlugin;
exports.getHeadingDeserialize = getHeadingDeserialize;
exports.getHeadingRenderElement = getHeadingRenderElement;
//# sourceMappingURL=index.js.map
