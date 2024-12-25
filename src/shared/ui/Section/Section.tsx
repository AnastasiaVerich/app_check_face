import React, { forwardRef } from "react";
import './Section.css';
import { classNames, Mods } from "../../../lib/classNames/classNames";

interface SectionProps {
    children: any;
    className?: string;
    clickable?: boolean;
    disabled?: boolean;
    max?: boolean;
    onClick?: () => void;
}

// Используем forwardRef для передачи ref внутрь компонента
export const Section = forwardRef<HTMLDivElement, SectionProps>((props, ref) => {
    const {
        children,
        className,
        clickable,
        disabled,
        onClick = () => {},
        max,
    } = props;

    const mods: Mods = {
        'max': max,
        'clickable': clickable,
        'disabled': disabled,
    };

    return (
        <div
            ref={ref as React.Ref<HTMLDivElement>}
            className={classNames('section', mods, [className])}
            onClick={onClick}
        >
            {children}
        </div>
    );
});
