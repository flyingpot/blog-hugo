/// <reference types="jest" />
import { TEditor } from '@udecode/plate-core';
import { Location } from 'slate';
export declare const deleteFragment: (editor: TEditor, options?: {
    at?: Location;
    distance?: number;
    unit?: 'character' | 'word' | 'line' | 'block';
    reverse?: boolean;
    hanging?: boolean;
    voids?: boolean;
    test?: any;
}) => void;
//# sourceMappingURL=deleteFragment.d.ts.map