import React, { memo } from 'react';
import './Svg.css';
import {classNames, Mods} from "../../../lib/classNames/classNames";


interface SvgProps {
    width?:string,
    height?:string,
    Svg: React.VFC<React.SVGProps<SVGSVGElement>>;
    color?:'accent'| 'subtitle'
}

export const Svg = memo((props: SvgProps) => {
    const {
        Svg,
        width = '46px',
        height = '46px',
        color='accent',
    } = props;

    const mods: Mods = {
    };

    return (
        <div
            style={{
                width: width,
                height: height,
            }}
            className={classNames('SvgContainer', mods, [color])}
        >
            <Svg
                className='Svg'
                width={width}
                height={height}
            />
        </div>

    );
});
