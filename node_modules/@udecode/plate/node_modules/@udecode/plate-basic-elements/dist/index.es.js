import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';

/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
const createBasicElementPlugins = ({
  heading
} = {}) => [createBlockquotePlugin(), createCodeBlockPlugin(), createHeadingPlugin(heading), createParagraphPlugin()];

export { createBasicElementPlugins };
//# sourceMappingURL=index.es.js.map
