import React from "react";
import './Button.css'
import {classNames, Mods} from "../../../lib/classNames/classNames";

interface ButtonProps {
    onClick: () => void;
    text: string,
    disabled: boolean,
    width?: string,
    max?: boolean,
}

export const Button: React.FC<ButtonProps> = (props) => {
    const {
        onClick,
        text,
        disabled,
        width,
        max,
    } = props

    const mods: Mods = {
        'disabled': disabled,
        'max': max,
    }

    return (
        <div
            style={{width:width}}
            className={classNames('button', mods, [])}
            onClick={onClick}
        >
            {text}
        </div>
    );
};
