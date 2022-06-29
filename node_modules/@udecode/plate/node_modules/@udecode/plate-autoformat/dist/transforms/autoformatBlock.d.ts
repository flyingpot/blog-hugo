import { TEditor } from '@udecode/plate-core';
import { AutoformatBlockRule } from '../types';
export interface AutoformatBlockOptions extends AutoformatBlockRule {
    text: string;
}
export declare const autoformatBlock: (editor: TEditor, { text, trigger, match: _match, type, allowSameTypeAbove, preFormat, format, triggerAtBlockStart, }: AutoformatBlockOptions) => boolean;
//# sourceMappingURL=autoformatBlock.d.ts.map