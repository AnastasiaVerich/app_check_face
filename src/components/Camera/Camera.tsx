import React from "react";

interface CameraProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasBorderRef: React.RefObject<HTMLCanvasElement>;
    isShow:Boolean,
    isFaceDetected:Boolean,
}

export const Camera: React.FC<CameraProps> = ({ videoRef, isShow,isFaceDetected,canvasBorderRef }) => {
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
            <canvas
                ref={canvasBorderRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none', // Чтобы клики проходили на видео
                }}
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
