import { TEditor, TNode } from '@udecode/plate-core';
import { SetNodesOptions } from '../types/Transforms.types';
export declare const unsetNodes: <T extends TNode<import("@udecode/plate-core").AnyObject> = TNode<import("@udecode/plate-core").AnyObject>>(editor: TEditor, props: Exclude<keyof T, "children" | "text"> | Exclude<keyof T, "children" | "text">[], options?: SetNodesOptions) => void;
//# sourceMappingURL=unsetNodes.d.ts.map