import { TEditor, TNode } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { EditorNodesOptions } from '../types';
export declare type FindNodeOptions<T extends TNode = TNode> = EditorNodesOptions<T>;
/**
 * Find node matching the condition.
 */
export declare const findNode: <T extends TNode<import("@udecode/plate-core").AnyObject> = TNode<import("@udecode/plate-core").AnyObject>>(editor: TEditor, options?: FindNodeOptions<T>) => NodeEntry<T> | undefined;
//# sourceMappingURL=findNode.d.ts.map