import React from "react";

interface ImgProps {
    photoUrl:string | null;
    isShow:Boolean
}

export const Img: React.FC<ImgProps> = ({ photoUrl, isShow }) => {

    if(!photoUrl){
        return <></>
    }
    return (
        <div className="img_box" style={{
            display: isShow ? '' : 'none',
        }}>
            <img
                className="img"
                src={photoUrl ?? ''}
                alt="Сделанное фото"
            />
        </div>
    );
};
