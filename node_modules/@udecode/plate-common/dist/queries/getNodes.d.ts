import { TEditor, TNode } from '@udecode/plate-core';
import { UnhangRangeOptions } from '../transforms/unhangRange';
import { EditorNodesOptions } from '../types/Editor.types';
export declare const getNodes: <T extends TNode<import("@udecode/plate-core").AnyObject>>(editor: TEditor, options?: EditorNodesOptions & UnhangRangeOptions) => Generator<import("slate").NodeEntry<T>, void, undefined>;
//# sourceMappingURL=getNodes.d.ts.map