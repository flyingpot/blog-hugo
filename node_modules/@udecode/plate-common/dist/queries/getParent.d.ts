import { TAncestor, TEditor } from '@udecode/plate-core';
import { Location, NodeEntry } from 'slate';
import { EditorParentOptions } from '../types/Editor.types';
/**
 * See {@link Editor.parent}.
 * Returns undefined if there is no parent.
 */
export declare const getParent: <T extends TAncestor<import("@udecode/plate-core").AnyObject> = TAncestor<import("@udecode/plate-core").AnyObject>>(editor: TEditor, at: Location, options?: EditorParentOptions | undefined) => NodeEntry<T> | undefined;
//# sourceMappingURL=getParent.d.ts.map