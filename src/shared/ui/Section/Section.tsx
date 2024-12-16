import React from "react";
import './Section.css'
import {classNames, Mods} from "../../../lib/classNames/classNames";

interface SectionProps {
    children: any,
    className?: string,
    clickable?: boolean,
    disabled?: boolean,
    max?: boolean,
    onClick?: () => void,
}

export const Section: React.FC<SectionProps> = (props) => {
    const {
        children,
        className,
        clickable,
        disabled,
        onClick = () => {
        },
        max,
    } = props


    const mods: Mods = {
        'max': max,
        'clickable': clickable,
        'disabled': disabled,
    };

    return (
        <div
            className={classNames('section', mods, [className])}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
