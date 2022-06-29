import { FunctionComponent } from 'react';
import { TElement, TText } from '@udecode/plate-core';
import { CSSProperties } from 'styled-components';
/**
 * HOC mapping element/leaf props to component styles
 */
export declare const withStyledProps: <T extends {
    element: TElement;
    leaf: TText;
}>(Component: FunctionComponent<any>, { elementProps, leafProps, }: {
    elementProps?: {
        [key: string]: keyof CSSProperties | (keyof CSSProperties)[];
    } | undefined;
    leafProps?: {
        [key: string]: keyof CSSProperties | (keyof CSSProperties)[];
    } | undefined;
}) => FunctionComponent<any>;
//# sourceMappingURL=withStyledProps.d.ts.map