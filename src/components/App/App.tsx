import React, {useEffect, useRef, useState} from "react";
import {api} from "../../api/api";
import {Buttons} from "../Buttons/Buttons";
import {base64ToBlob} from "../../utils/photoUtils";
import {Camera} from "../Camera/Camera";
import './App.css'
import '../../styles/variables.css'
import {Img} from "../Img/Img";
import {ParamsType} from "../../types/type";
import {useCamera} from "../../hooks/useCamera";
import {useFaceDetection} from "../../hooks/useFaceDetection";

function App() {

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [params, setParams] = useState<ParamsType>(null);
    const [result, setResult] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        isCameraOn,
        startCamera,
        stopCamera,
    }=useCamera(setPhotoUrl,setError,videoRef,canvasRef, streamRef)
    const {
        isFaceDetected,
    } = useFaceDetection(isCameraOn,videoRef,canvasRef)

    useEffect(() => {
        // синхронизация стилей юзера из телеграма с веб прил
        // записываем данные юзера, которые пришли в url
        const tg: any = 'Telegram' in window ? window.Telegram : undefined;
        const urlParams = new URLSearchParams(window.location.search);
        const data = JSON.parse(decodeURIComponent(urlParams?.get('data') ?? '{}'));
        setParams(data)

        tg.WebApp.ready();
        tg.WebApp.expand();

        document.body.style.backgroundColor = tg.WebApp.themeParams.bg_color || '#ffffff';

        const handleResize = () => {
            document.body.style.height = `${window.innerHeight}px`;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    const handleSendPhoto = () => {
        const tg: any = 'Telegram' in window ? window.Telegram : undefined;
        if (params?.type === 'registration') {
            if (tg) {

                const userPhone = params?.userPhone ?? ''
                const userId = params?.userId ?? ''
                const isSavePhoto = params?.isSavePhoto ?? '0'


                if (!photoUrl) {
                    setError("Фото не сделано! Попробуйте снова.");
                    return;
                }

                const blob = base64ToBlob(photoUrl, "image/jpeg");

                // Создаем formData для отправки медиа
                const formData = new FormData();
                formData.append('userPhone', userPhone);
                formData.append('userId', userId);
                formData.append('photo', blob);
                formData.append('isSavePhoto', isSavePhoto);
                api.registration(
                    formData,
                    setIsFetching,
                    setError,
                    setResult
                )
            } else {

                setError("Приложение было открыто НЕ в Телеграмме");
            }
        } else if (params?.type === 'identification') {
            if (tg) {

                const userId = params?.userId ?? ''


                if (!photoUrl) {
                    setError("Фото не сделано! Попробуйте снова.");
                    return;
                }

                const blob = base64ToBlob(photoUrl, "image/jpeg");

                // Создаем formData для отправки медиа
                const formData = new FormData();
                formData.append('userId', userId);
                formData.append('photo', blob);
                api.identification(
                    formData,
                    setIsFetching,
                    setError,
                    setResult
                )
            } else {

                setError("Приложение было открыто НЕ в Телеграмме");
            }
        }
    };

    return (
        <div className="app">
            <Camera
                isFaceDetected={isFaceDetected}
                videoRef={videoRef}
                isShow={isCameraOn}
                canvasRef={canvasRef}
            />
            <Img
                photoUrl={photoUrl}
                isShow={!isCameraOn}
            />

            <Buttons
                isFetching={isFetching}
                isFaceDetected={isFaceDetected}
                isCameraOn={isCameraOn}

                photoUrl={photoUrl}

                onStart={startCamera}
                onStop={stopCamera}
                onRestart={startCamera}
                onSend={handleSendPhoto}

                error={error}
                result={result}

                type={params?.type}
            />

            <canvas ref={canvasRef} style={{display: "none"}}/>
        </div>
    );
}

export default App;
