/**
 * Iterate through all of the nodes in the editor and return the first match. If
 * no match is found, return undefined.
 */
import { TEditor, TNode } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { FindNodeOptions } from './findNode';
/**
 * Get the first descendant node matching the condition.
 */
export declare const findDescendant: <T extends TNode<import("@udecode/plate-core").AnyObject> = TNode<import("@udecode/plate-core").AnyObject>>(editor: TEditor, options: FindNodeOptions<T>) => NodeEntry<T> | undefined;
//# sourceMappingURL=findDescendant.d.ts.map