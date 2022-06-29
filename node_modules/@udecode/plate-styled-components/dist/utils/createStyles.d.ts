import { CSSProp } from 'styled-components';
import { StyledProps } from '../types/StyledProps';
export interface Style {
    css: CSSProp[];
    className: string;
}
export declare const createStyles: <T extends {
    styles?: NonNullable<T["styles"]> | undefined;
    classNames?: any;
    prefixClassNames?: string | undefined;
} = StyledProps<{}>>(props: T, styles: NonNullable<T["styles"]> | NonNullable<T["styles"]>[]) => {
    root: Style;
} & Record<keyof NonNullable<T["styles"]>, Style | undefined>;
//# sourceMappingURL=createStyles.d.ts.map