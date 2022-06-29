import { TEditor } from '@udecode/plate-core';
import { Range } from 'slate';
import { EditorAboveOptions } from '../types/Editor.types';
/**
 * Is the range (default: selection) across blocks.
 */
export declare const isRangeAcrossBlocks: (editor: TEditor, { at, ...options }?: Omit<EditorAboveOptions<import("@udecode/plate-core").TAncestor<import("@udecode/plate-core").AnyObject>>, "match" | "at"> & {
    at?: import("slate").BaseRange | null | undefined;
}) => boolean | undefined;
//# sourceMappingURL=isRangeAcrossBlocks.d.ts.map