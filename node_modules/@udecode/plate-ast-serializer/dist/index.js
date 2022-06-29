'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateCore = require('@udecode/plate-core');
var plateSerializer = require('@udecode/plate-serializer');

const astDeserializerId = 'AST Deserializer';
/**
 * Enables support for deserializing inserted content from Slate Ast format to Slate format
 * while apply a small bug fix.
 */

const withDeserializeAst = ({
  plugins = []
} = {}) => editor => {
  const {
    insertData
  } = editor;

  editor.insertData = data => {
    const ast = data.getData('application/x-slate-fragment');
    const isEnabled = plateSerializer.isDeserializerEnabled(editor, plugins, astDeserializerId);

    if (ast && isEnabled) {
      const decoded = decodeURIComponent(window.atob(ast));
      const fragment = JSON.parse(decoded);

      if (fragment.length) {
        return plateSerializer.insertDeserializedFragment(editor, {
          fragment,
          plugins
        });
      }
    }

    insertData(data);
  };

  return editor;
};
/**
 * @see {@link withDeserializeAst}
 */

const createDeserializeAstPlugin = plateCore.getPlatePluginWithOverrides(withDeserializeAst);

exports.astDeserializerId = astDeserializerId;
exports.createDeserializeAstPlugin = createDeserializeAstPlugin;
exports.withDeserializeAst = withDeserializeAst;
//# sourceMappingURL=index.js.map
