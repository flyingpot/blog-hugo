'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plateBlockQuote = require('@udecode/plate-block-quote');
var plateCodeBlock = require('@udecode/plate-code-block');
var plateHeading = require('@udecode/plate-heading');
var plateParagraph = require('@udecode/plate-paragraph');

/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
const createBasicElementPlugins = ({
  heading
} = {}) => [plateBlockQuote.createBlockquotePlugin(), plateCodeBlock.createCodeBlockPlugin(), plateHeading.createHeadingPlugin(heading), plateParagraph.createParagraphPlugin()];

exports.createBasicElementPlugins = createBasicElementPlugins;
//# sourceMappingURL=index.js.map
