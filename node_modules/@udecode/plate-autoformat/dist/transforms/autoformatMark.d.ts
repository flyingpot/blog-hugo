import { TEditor } from '@udecode/plate-core';
import { AutoformatMarkRule } from '../types';
export interface AutoformatMarkOptions extends AutoformatMarkRule {
    text: string;
}
export declare const autoformatMark: (editor: TEditor, { type, text, trigger, match: _match, ignoreTrim }: AutoformatMarkOptions) => boolean;
//# sourceMappingURL=autoformatMark.d.ts.map