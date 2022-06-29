import { TEditor } from '@udecode/plate-core';
import { EditorNodesOptions } from '../types/Editor.types';
export interface ToggleNodeTypeOptions {
    /**
     * If there is no node type above the selection, set the selected node type to activeType.
     */
    activeType?: string;
    /**
     * If there is a node type above the selection, set the selected node type to inactiveType.
     */
    inactiveType?: string;
}
/**
 * Toggle the type of the selected node.
 * Don't do anything if activeType === inactiveType.
 */
export declare const toggleNodeType: (editor: TEditor, options: ToggleNodeTypeOptions, editorNodesOptions?: Omit<EditorNodesOptions<import("@udecode/plate-core").TNode<import("@udecode/plate-core").AnyObject>>, "match"> | undefined) => void;
//# sourceMappingURL=toggleNodeType.d.ts.map