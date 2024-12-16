import React from "react";
import './CommonSection.css'
import {classNames, Mods} from "../../../lib/classNames/classNames";

interface SectionProps {
    children: any,
    max?:boolean
    isHide?:boolean
}

export const CommonSection: React.FC<SectionProps> = (props) => {
    const {
        children,
        max,
        isHide = false,
    } = props


    const mods: Mods = {
        'max': max,
        'hide': isHide,
    };

    return (
        <div
            className={classNames('common_section', mods, [])}
        >
            {children}
        </div>
    );
};
