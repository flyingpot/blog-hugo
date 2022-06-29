'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCore = require('@udecode/plate-core');
var plateCommon = require('@udecode/plate-common');

const ELEMENT_HR = 'hr';

const getHorizontalRuleDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, ELEMENT_HR);
  return {
    element: plateCommon.getElementDeserializer({
      type: ELEMENT_HR,
      rules: [{
        nodeNames: 'HR'
      }],
      ...options.deserialize
    })
  };
};

const createHorizontalRulePlugin = () => ({
  pluginKeys: ELEMENT_HR,
  renderElement: plateCore.getRenderElement(ELEMENT_HR),
  voidTypes: plateCore.getPlatePluginTypes(ELEMENT_HR),
  deserialize: getHorizontalRuleDeserialize()
});

exports.ELEMENT_HR = ELEMENT_HR;
exports.createHorizontalRulePlugin = createHorizontalRulePlugin;
exports.getHorizontalRuleDeserialize = getHorizontalRuleDeserialize;
//# sourceMappingURL=index.js.map
