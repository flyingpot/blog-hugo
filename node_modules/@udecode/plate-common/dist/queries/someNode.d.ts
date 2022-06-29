import { TEditor, TNode } from '@udecode/plate-core';
import { FindNodeOptions } from './findNode';
/**
 * Iterate through all of the nodes in the editor and break early for the first truthy match. Otherwise
 * returns false.
 */
export declare const someNode: <T extends TNode<import("@udecode/plate-core").AnyObject> = TNode<import("@udecode/plate-core").AnyObject>>(editor: TEditor, options: FindNodeOptions<T>) => boolean;
//# sourceMappingURL=someNode.d.ts.map