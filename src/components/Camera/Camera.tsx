import React, {useState} from "react";
import './Camera.css'
import {Section} from "../../shared/ui/Section/Section";

interface CameraProps {
    videoRef: React.RefObject<HTMLVideoElement>; // Ссылка на элемент video, который будет показывать видео с камеры
    canvasRef: React.RefObject<HTMLCanvasElement>; // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    isShow:Boolean, // Признак того, нужно ли показывать камеру
    isFaceDetected:Boolean,    // Признак, что лицо было обнаружено на видео
}

export const Camera: React.FC<CameraProps> = ({ videoRef, isShow,isFaceDetected,canvasRef }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleVideoLoaded = () => {
        setTimeout(()=>{
            setIsLoaded(true);
        },0)

    };

    return (
        <Section className={`video_box ${isShow && isLoaded?'':'hide'}`}>

            <video
                className="video_online"
                ref={videoRef}
                playsInline
                autoPlay
                muted
                controls={false}
                onLoadedMetadata={handleVideoLoaded}
            />
            <div className="video_box__wrapper"/>
            <canvas
                ref={canvasRef}
                className={'canvas'}
            />
            {/* Оверлей для отображения информации о распознавании лица */}
            <div
                className={`face_overlay ${isFaceDetected?'ok':'err'}`}

            />
        </Section>
    );
};
