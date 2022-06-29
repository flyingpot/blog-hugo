import { TEditor } from '@udecode/plate-core';
import { AutoformatTextRule } from '../types';
export interface AutoformatTextOptions extends AutoformatTextRule {
    text: string;
}
export declare const autoformatText: (editor: TEditor, { text, match: _match, trigger, format }: AutoformatTextOptions) => boolean;
//# sourceMappingURL=autoformatText.d.ts.map