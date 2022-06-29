import { HTMLAttributes } from 'react';
import { TippyProps } from '@tippyjs/react';
import { StyledProps } from '@udecode/plate-styled-components';
export interface PopoverProps extends TippyProps, StyledProps {
    rootProps?: HTMLAttributes<HTMLDivElement>;
}
export declare const Popover: ({ rootProps, content, ...props }: PopoverProps) => JSX.Element;
//# sourceMappingURL=Popover.d.ts.map