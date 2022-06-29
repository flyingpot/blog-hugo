import { TAncestor, TDescendant } from '@udecode/plate-core';
import { NodeEntry, Path } from 'slate';
/**
 * Get the last child of a node or null if no children.
 */
export declare const getLastChild: (nodeEntry: NodeEntry<TAncestor<import("@udecode/plate-core").AnyObject>>) => NodeEntry<TDescendant> | null;
/**
 * Get last child path. If there is no child, last index is 0.
 */
export declare const getLastChildPath: (nodeEntry: NodeEntry<TAncestor<import("@udecode/plate-core").AnyObject>>) => Path;
/**
 * Is the child path the last one of the parent.
 */
export declare const isLastChild: (parentEntry: NodeEntry<TAncestor<import("@udecode/plate-core").AnyObject>>, childPath: Path) => boolean;
//# sourceMappingURL=getLastChild.d.ts.map