import { TNode } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { QueryNodeOptions } from '../types/QueryNodeOptions';
/**
 * Query the node entry.
 */
export declare const queryNode: <T extends TNode<import("@udecode/plate-core").AnyObject>>(entry?: NodeEntry<T> | undefined, { filter, allow, exclude }?: QueryNodeOptions) => boolean;
//# sourceMappingURL=queryNode.d.ts.map