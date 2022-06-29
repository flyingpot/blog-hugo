import { OnChange } from '@udecode/plate-core';
/**
 * For each combobox state (byId):
 * - if the selection is collapsed
 * - if the cursor follows the trigger
 * - if there is text without whitespaces after the trigger
 * - open the combobox: set id, search, targetRange in the store
 * Close the combobox if needed
 */
export declare const getComboboxOnChange: () => OnChange;
//# sourceMappingURL=getComboboxOnChange.d.ts.map