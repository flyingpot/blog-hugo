import { getPlatePluginWithOverrides } from '@udecode/plate-core';
import { isDeserializerEnabled, insertDeserializedFragment } from '@udecode/plate-serializer';

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
    const isEnabled = isDeserializerEnabled(editor, plugins, astDeserializerId);

    if (ast && isEnabled) {
      const decoded = decodeURIComponent(window.atob(ast));
      const fragment = JSON.parse(decoded);

      if (fragment.length) {
        return insertDeserializedFragment(editor, {
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

const createDeserializeAstPlugin = getPlatePluginWithOverrides(withDeserializeAst);

export { astDeserializerId, createDeserializeAstPlugin, withDeserializeAst };
//# sourceMappingURL=index.es.js.map
