import { CSSProperties, memo } from 'react';
import './Skeleton.css';
import {classNames} from "../../../lib/classNames/classNames";

interface SkeletonProps {
    className?: string;
    height?: string | number;
    width?: string | number;
    border?: string;
}

export const Skeleton = memo((props: SkeletonProps) => {
    const { className, height, width, border } = props;

    const styles: CSSProperties = {
        width,
        height,
        borderRadius: border,
    };

    return (
        <div
            className={classNames('Skeleton', {}, [className])}
            style={styles}
        />
    );
});
