import React from "react";
import './Text.css'
import {classNames, Mods} from "../../../lib/classNames/classNames";

export type FlexSize = 's' | 'm' | 'l'

const sizeClasses: Record<FlexSize, string> = {
    s: 'size_s',
    m: 'size_m',
    l: 'size_l',
};

interface TextProps {
    text: string;
    type: 'hint' | 'text',

    className?: string;
    align?: 'center' | 'start',
    size?: FlexSize;
    max?: boolean,
}

export const Text: React.FC<TextProps> = (props) => {
    const {
        text,
        type,

        className,
        align='start',
        size='m',
        max,

    } = props

    const classes = [
        type,
        className,
        sizeClasses[size],
        align,

    ]
    const mods: Mods = {
        'max': max,
    };

    return (
        <div
            className={classNames('text_box', mods, classes)}
        >
            {text}
        </div>

    );
};
