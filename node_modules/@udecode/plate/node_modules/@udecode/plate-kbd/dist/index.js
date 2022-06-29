'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCommon = require('@udecode/plate-common');
var plateCore = require('@udecode/plate-core');

const MARK_KBD = 'kbd';

const getKbdDeserialize = () => editor => {
  const options = plateCore.getPlatePluginOptions(editor, MARK_KBD);
  return {
    leaf: plateCommon.getLeafDeserializer({
      type: options.type,
      rules: [{
        nodeNames: ['KBD']
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

const createKbdPlugin = () => ({
  pluginKeys: MARK_KBD,
  renderLeaf: plateCore.getRenderLeaf(MARK_KBD),
  deserialize: getKbdDeserialize(),
  onKeyDown: plateCommon.getToggleMarkOnKeyDown(MARK_KBD)
});

exports.MARK_KBD = MARK_KBD;
exports.createKbdPlugin = createKbdPlugin;
exports.getKbdDeserialize = getKbdDeserialize;
//# sourceMappingURL=index.js.map
