import { TEditor } from '@udecode/plate-core';
import { Location, Range } from 'slate';
import { PointBeforeOptions } from './getPointBefore';
export interface RangeBeforeOptions extends PointBeforeOptions {
}
/**
 * Get range from {@link getPointBefore} to the end point of `at`.
 */
export declare const getRangeBefore: (editor: TEditor, at: Location, options?: RangeBeforeOptions | undefined) => Range | undefined;
//# sourceMappingURL=getRangeBefore.d.ts.map