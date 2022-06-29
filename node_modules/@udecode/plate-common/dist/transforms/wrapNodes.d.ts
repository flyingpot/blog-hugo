import { TEditor, TElement as TTElement, TNode } from '@udecode/plate-core';
import { WrapOptions } from '../types/Transforms.types';
import { UnhangRangeOptions } from './unhangRange';
/**
 * {@link Transforms.wrapNodes}.
 */
export declare const wrapNodes: <TElement extends TTElement<import("@udecode/plate-core").AnyObject> = TTElement<import("@udecode/plate-core").AnyObject>, TNodeMatch extends TNode<import("@udecode/plate-core").AnyObject> = TNode<import("@udecode/plate-core").AnyObject>>(editor: TEditor, element: TElement, options?: WrapOptions<TNodeMatch> & UnhangRangeOptions) => void;
//# sourceMappingURL=wrapNodes.d.ts.map