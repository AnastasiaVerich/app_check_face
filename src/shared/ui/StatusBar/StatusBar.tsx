import React from 'react';
import './StatusBar.css';
import { classNames, Mods } from '../../../lib/classNames/classNames';

interface StatusBarProps {
    isActive: boolean;
    width?: string;
    height?: string;
}

export const StatusBar: React.FC<StatusBarProps> = (props) => {
    const {
        isActive,
        width = '100%',
        height = '8px',
    } = props;

    const mods: Mods = {
        'active': isActive,
    };

    return (
        <div
            style={{ width, height }}
            className={classNames('statusBar', mods, [])}
        />
    );
};
