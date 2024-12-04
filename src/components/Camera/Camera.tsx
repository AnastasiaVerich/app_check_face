import React from "react";

interface CameraProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    isShow:Boolean,
    isFaceDetected:Boolean,
}

export const Camera: React.FC<CameraProps> = ({ videoRef, isShow,isFaceDetected }) => {
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
            <div
                className="video_border"
                style={{
                    border: `4px solid ${isFaceDetected ? 'green' : 'red'}`,
                    boxShadow: `0 0 20px ${isFaceDetected ? 'green' : 'red'}`,
                }}
            />
        </div>
    );
};
