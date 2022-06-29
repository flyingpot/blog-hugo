'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var slate = require('slate');

const insertDeserializedFragment = (editor, {
  fragment,
  plugins
}) => {
  slate.Editor.withoutNormalizing(editor, () => {
    plugins.forEach(({
      deserialize
    }) => {
      const getFragment = deserialize === null || deserialize === void 0 ? void 0 : deserialize(editor).getFragment;
      if (!getFragment) return;
      fragment = getFragment(fragment);
    });
    if (!fragment.length) return;
    plugins.some(({
      deserialize
    }) => {
      var _deserialize$preInser, _deserialize;

      return (deserialize === null || deserialize === void 0 ? void 0 : (_deserialize$preInser = (_deserialize = deserialize(editor)).preInsert) === null || _deserialize$preInser === void 0 ? void 0 : _deserialize$preInser.call(_deserialize, fragment)) === true;
    });
    editor.insertFragment(fragment);
  });
};

const isDeserializerEnabled = (editor, plugins, deserializerId) => plugins.every(({
  deserialize
}) => {
  var _deserialize$isDisabl, _deserialize;

  return !(deserialize !== null && deserialize !== void 0 && (_deserialize$isDisabl = (_deserialize = deserialize(editor)).isDisabled) !== null && _deserialize$isDisabl !== void 0 && _deserialize$isDisabl.call(_deserialize, deserializerId));
});

exports.insertDeserializedFragment = insertDeserializedFragment;
exports.isDeserializerEnabled = isDeserializerEnabled;
//# sourceMappingURL=index.js.map
