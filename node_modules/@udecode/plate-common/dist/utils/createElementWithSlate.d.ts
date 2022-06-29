import React from 'react';
import { SlateProps } from '@udecode/plate-core';
import { ReactEditor } from 'slate-react';
/**
 * Create a React element wrapped in a Slate provider.
 * By default, it will use an empty editor.
 * TODO: allow other providers
 */
export declare const createElementWithSlate: (slateProps?: Partial<SlateProps> | undefined) => React.FunctionComponentElement<{
    editor: ReactEditor;
    value: import("slate").Descendant[];
    children: React.ReactNode;
    onChange: (value: import("slate").Descendant[]) => void;
}>;
//# sourceMappingURL=createElementWithSlate.d.ts.map