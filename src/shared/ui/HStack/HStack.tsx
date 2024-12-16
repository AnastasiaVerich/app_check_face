import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import './HStack.css'
import {classNames, Mods} from "../../../lib/classNames/classNames";

export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around';
export type FlexAlign = 'start' | 'center' | 'end';
export type FlexWrap = 'nowrap' | 'wrap';
export type FlexGap = '5' | '10' | '15' | '25' | '30';

const justifyClasses: Record<FlexJustify, string> = {
    start: 'justifyStart',
    center: 'justifyCenter',
    end: 'justifyEnd',
    between: 'justifyBetween',
    around: 'justifyAround',
};

const alignClasses: Record<FlexAlign, string> = {
    start: 'alignStart',
    center: 'alignCenter',
    end: 'alignEnd',
};



const gapClasses: Record<FlexGap, string> = {
    5: 'gap5',
    10: 'gap10',
    15: 'gap15',
    25: 'gap25',
    30: 'gap30',
};

type DivProps = DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>;

export interface FlexProps extends DivProps {
    className?: string;
    children: ReactNode;
    justify?: FlexJustify;
    align?: FlexAlign;
    wrap?: FlexWrap;
    gap?: FlexGap;
    max?: boolean;
}

export const HStack = (props: FlexProps) => {
    const {
        className,
        children,
        justify = 'start',
        align = 'center',
        wrap = 'nowrap',
        gap,
        max,
        ...otherProps
    } = props;

    const classes = [
        className,
        justifyClasses[justify],
        alignClasses[align],
        wrap,
        gap && gapClasses[gap],
    ];

    const mods: Mods = {
        'max': max,
    };

    return (
        <div className={classNames('HStack', mods, classes)} {...otherProps}>
            {children}
        </div>
    );
};
