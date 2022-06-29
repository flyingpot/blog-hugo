import { TAncestor, TEditor } from '@udecode/plate-core';
import { EditorAboveOptions } from '../types/Editor.types';
/**
 * Get the block above a location (default: selection).
 */
export declare const getBlockAbove: <T extends TAncestor<import("@udecode/plate-core").AnyObject> = TAncestor<import("@udecode/plate-core").AnyObject>>(editor: TEditor, options?: EditorAboveOptions<T>) => import("slate").NodeEntry<T> | undefined;
//# sourceMappingURL=getBlockAbove.d.ts.map