"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const index_1 = require("./index");
const getAltairHtml = require("./utils/get-altair-html");
const translateRenderedStrToObj = (result) => {
    const resultObj = Function(`
  let __options;
  const AltairGraphQL = { init: (options) => { __options = options; } };
  ${result}
  return __options;`)();
    return resultObj;
};
describe('renderInitialOptions', () => {
    it('should return expected string', () => {
        const result = index_1.renderInitialOptions({
            baseURL: '/',
            initialQuery: `query {
        Hello
      }`,
            endpointURL: 'https://example.com/graphql',
            initialHeaders: {
                'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
            },
            initialSettings: {
                theme: 'dark'
            }
        });
        expect(translateRenderedStrToObj(result)).toEqual({
            initialQuery: `query {
        Hello
      }`,
            endpointURL: 'https://example.com/graphql',
            initialHeaders: {
                'X-GraphQL-Token': 'asd7-237s-2bdk-nsdk4'
            },
            initialSettings: {
                theme: 'dark'
            }
        });
        expect(result).toMatchSnapshot();
    });
    it('should render boolean values correctly', () => {
        const result = index_1.renderInitialOptions({
            preserveState: false,
        });
        expect(translateRenderedStrToObj(result)).toEqual({
            preserveState: false,
        });
    });
});
describe('renderAltair', () => {
    it('should return expected string', () => {
        getAltairHtml.default = jest.fn();
        getAltairHtml.default.mockReturnValue(fs_1.readFileSync(path_1.resolve(__dirname, 'index.html'), 'utf8'));
        expect(index_1.renderAltair({
            baseURL: '/',
            initialQuery: `query {
        Hello
      }`,
            endpointURL: 'https://example.com/graphql',
            initialVariables: '{ variable: 1 }'
        })).toMatchSnapshot();
    });
});
//# sourceMappingURL=index.test.js.map