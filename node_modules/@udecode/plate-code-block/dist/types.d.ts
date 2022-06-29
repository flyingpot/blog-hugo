import { InsertNodesOptions } from '@udecode/plate-common';
import { PlatePluginOptions } from '@udecode/plate-core';
export interface CodeBlockPluginOptions extends PlatePluginOptions {
    syntax?: boolean;
    syntaxPopularFirst?: boolean;
    deserializers?: string[];
}
export interface CodeBlockNodeData {
    lang?: string;
}
export interface WithCodeBlockOptions {
}
export interface CodeBlockInsertOptions extends Pick<PlatePluginOptions, 'defaultType'> {
    level?: number;
    insertNodesOptions?: Omit<InsertNodesOptions, 'match'>;
}
//# sourceMappingURL=types.d.ts.map