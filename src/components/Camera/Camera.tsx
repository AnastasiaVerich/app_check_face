import React from "react";

interface CameraProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    isShow:Boolean
}

export const Camera: React.FC<CameraProps> = ({ videoRef, isShow }) => {
    return (
        <div className="video_box" style={{
            display: isShow ? '' : 'none',
        }}>
            <video
                className="video_online"
                ref={videoRef}
                playsInline
                autoPlay
                muted
                controls={false}

            />
        </div>
    );
};
