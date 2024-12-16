import React from "react";
import './Img.css'

interface ImgProps {
    photoUrl: string | null;
}

export const Img: React.FC<ImgProps> = ({photoUrl}) => {

    if (!photoUrl) {
        return <></>
    }
    return (
        <div
            className={`img_box`}
        >
            <img
                className="img"
                src={photoUrl ?? ''}
                alt="Сделанное фото"
            />
        </div>
    );
};
