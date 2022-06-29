import { TEditor } from '@udecode/plate-core';
import { Point } from 'slate';
/**
 * Is the word at the point after a trigger (punctuation character)
 * https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/utils/string.ts#L6
 */
export declare const isWordAfterTrigger: (editor: TEditor, { at, trigger }: {
    at: Point;
    trigger: string;
}) => {
    range: import("slate").BaseRange | undefined;
    match: false | RegExpMatchArray | null;
};
//# sourceMappingURL=isWordAfterTrigger.d.ts.map