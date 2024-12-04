import React from "react";
import './Camera.css'

interface CameraProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isShow:Boolean,
    isFaceDetected:Boolean,
}

export const Camera: React.FC<CameraProps> = ({ videoRef, isShow,isFaceDetected,canvasRef }) => {
    return (
        <div className={`video_box ${isShow?'':'hide'}`}>
            <video
                className="video_online"
                ref={videoRef}
                playsInline
                autoPlay
                muted
                controls={false}

            />
            <canvas
                ref={canvasRef}
                className={'canvas'}
            />
            <div
                className={`face_overlay ${isFaceDetected?'ok':'err'}`}

            />
        </div>
    );
};
