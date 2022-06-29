import React from 'react';
import * as PopperJS from '@popperjs/core';
import { Modifier } from '@popperjs/core';
export declare type UsePopperOptions = Omit<Partial<PopperJS.Options>, 'modifiers'> & {
    createPopper?: typeof PopperJS.createPopper;
    modifiers?: ReadonlyArray<Partial<Modifier<string, object>>>;
};
export interface UsePopperReturnType {
    styles: {
        [key: string]: React.CSSProperties;
    };
    attributes: {
        [key: string]: {
            [key: string]: string;
        } | undefined;
    };
    state: PopperJS.State | null;
    update: PopperJS.Instance['update'] | null;
    forceUpdate: PopperJS.Instance['forceUpdate'] | null;
}
export interface UsePopperPositionOptions {
    popperElement: HTMLElement | null;
    /**
     * Container element of editor popper,
     * if no scroll container provided, it will take document.documentElement as scrolling container
     */
    popperContainer?: Document | HTMLElement | null;
    popperOptions?: Partial<UsePopperOptions>;
    modifiers?: UsePopperOptions['modifiers'];
    placement?: PopperJS.Placement;
    isHidden?: boolean;
    getBoundingClientRect?: any;
    offset?: number[];
}
export declare const virtualReference: PopperJS.VirtualElement;
/**
 * TODO: duplicate
 */
export declare const usePopperPosition: ({ popperElement, popperContainer, popperOptions, modifiers, offset, placement, isHidden, getBoundingClientRect, }: UsePopperPositionOptions) => UsePopperReturnType;
//# sourceMappingURL=usePopperPosition.d.ts.map