import { getPlatePluginType, getPlatePluginWithOverrides } from '@udecode/plate-core';
import { isDeserializerEnabled, insertDeserializedFragment } from '@udecode/plate-serializer';
import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD } from '@udecode/plate-table';
import { parse } from 'papaparse';

const isValidCsv = (data, errors, errorTolerance) => {
  if (errorTolerance < 0) errorTolerance = 0;
  return !(!data || data.length < 2 || data[0].length < 2 || data[1].length < 2 || errors.length && errors.length > errorTolerance * data.length);
};

const deserializeCSV = (editor, content, header = false, errorTolerance) => {
  // Verify it's a csv string
  const testCsv = parse(content, {
    preview: 2
  });

  if (testCsv.errors.length === 0) {
    const csv = parse(content, {
      header
    });
    if (!isValidCsv(csv.data, csv.errors, errorTolerance)) return;
    const paragraph = getPlatePluginType(editor, ELEMENT_DEFAULT);
    const table = getPlatePluginType(editor, ELEMENT_TABLE);
    const th = getPlatePluginType(editor, ELEMENT_TH);
    const tr = getPlatePluginType(editor, ELEMENT_TR);
    const td = getPlatePluginType(editor, ELEMENT_TD);
    const ast = {
      type: table,
      children: []
    };

    if (csv.meta.fields) {
      // csv file has headers, data structure is an array of objects keyed on the heading title
      ast.children.push({
        type: tr,
        children: csv.meta.fields.map(field => ({
          type: th,
          children: [{
            type: paragraph,
            children: [{
              text: field
            }]
          }]
        }))
      });

      for (const row of csv.data) {
        ast.children.push({
          type: tr,
          children: csv.meta.fields.map(field => ({
            type: td,
            children: [{
              type: paragraph,
              children: [{
                text: row[field] || ''
              }]
            }]
          }))
        });
      }
    } else {
      // csv is an array of arrays
      for (const row of csv.data) {
        ast.children.push({
          type: tr,
          children: []
        });

        for (const cell of row) {
          ast.children[ast.children.length - 1].children.push({
            type: td,
            children: [{
              type: paragraph,
              children: [{
                text: cell
              }]
            }]
          });
        }
      }
    }

    return [{
      type: paragraph,
      children: [{
        text: ''
      }]
    }, ast, {
      type: paragraph,
      children: [{
        text: ''
      }]
    }];
  }
};

const csvDeserializerId = 'CSV Deserializer';
/**
 * Enables support for deserializing content
 * from CSV format to Slate format.
 */

const withDeserializeCSV = ({
  plugins = [],
  errorTolerance = 0.25
} = {}) => editor => {
  const {
    insertData
  } = editor;

  editor.insertData = data => {
    const content = data.getData('text/plain');
    const isEnabled = isDeserializerEnabled(editor, plugins, csvDeserializerId);

    if (content && isEnabled) {
      const fragment = deserializeCSV(editor, content, true, errorTolerance);

      if (fragment !== null && fragment !== void 0 && fragment.length) {
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
 * @see {@link withDeserializeCSV}
 */

const createDeserializeCSVPlugin = getPlatePluginWithOverrides(withDeserializeCSV);

export { createDeserializeCSVPlugin, csvDeserializerId, deserializeCSV, withDeserializeCSV };
//# sourceMappingURL=index.es.js.map
