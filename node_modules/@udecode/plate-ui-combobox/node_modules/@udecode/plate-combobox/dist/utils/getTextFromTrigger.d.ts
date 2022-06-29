import { Editor, Point } from 'slate';
/**
 * Get text and range from trigger to cursor.
 * Starts with trigger and ends with non-whitespace character.
 */
export declare const getTextFromTrigger: (editor: Editor, { at, trigger, searchPattern, }: {
    at: Point;
    trigger: string;
    searchPattern?: string | undefined;
}) => {
    range: import("slate").BaseRange;
    textAfterTrigger: string;
} | undefined;
//# sourceMappingURL=getTextFromTrigger.d.ts.map