import React from "react";
import './Button.css'
import {classNames, Mods} from "../../../lib/classNames/classNames";

interface ButtonProps {
    onClick: () => void;
    text: string,
    disabled: boolean,
    max?: boolean,
}

export const Button: React.FC<ButtonProps> = (props) => {
    const {
        onClick,
        text,
        disabled,
        max,
    } = props

    const mods: Mods = {
        'disabled': disabled,
        'max': max,
    }

    return (
        <div
            className={classNames('button', mods, [])}
            onClick={onClick}
        >
            {text}
        </div>
    );
};
