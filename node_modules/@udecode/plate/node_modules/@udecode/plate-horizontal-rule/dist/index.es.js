import { getPlatePluginOptions, getRenderElement, getPlatePluginTypes } from '@udecode/plate-core';
import { getElementDeserializer } from '@udecode/plate-common';

const ELEMENT_HR = 'hr';

const getHorizontalRuleDeserialize = () => editor => {
  const options = getPlatePluginOptions(editor, ELEMENT_HR);
  return {
    element: getElementDeserializer({
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
  renderElement: getRenderElement(ELEMENT_HR),
  voidTypes: getPlatePluginTypes(ELEMENT_HR),
  deserialize: getHorizontalRuleDeserialize()
});

export { ELEMENT_HR, createHorizontalRulePlugin, getHorizontalRuleDeserialize };
//# sourceMappingURL=index.es.js.map
