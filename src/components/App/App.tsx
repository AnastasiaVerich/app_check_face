import React, {useEffect, useState} from "react";
import {api} from "../../api/api";
import {useCamera} from "../../hooks/useCamera";
import {Buttons} from "../Buttons/Buttons";
import {base64ToBlob} from "../../utils/photoUtils";
import {Camera} from "../Camera/Camera";
import './App.css'
import {Img} from "../Img/Img";
import {ParamsType} from "../../types/type";

function App() {
    const {
        isCameraOn,
        startCamera,
        stopCamera,
        photoUrl,
        videoRef,
        canvasRef,
        error,
        setError
    } = useCamera();

    const [isFetching, setIsFetching] = useState(false);
    const [params, setParams] = useState<ParamsType>(null);
    const [result, setResult] = useState<string | null>(null);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const data = JSON.parse(decodeURIComponent(urlParams?.get('data') ?? ''));
        setParams(data)

        const tg: any = 'Telegram' in window ? window.Telegram : undefined;
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
        if(params?.type === 'registration') {
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
            <Camera videoRef={videoRef} isShow={isCameraOn}/>
            <Img photoUrl={photoUrl} isShow={!isCameraOn}/>
            {isCameraOn ? (
                <>
                    <button onClick={stopCamera}>Сфотографировать</button>
                </>
            ) : (
                <Buttons
                    type={params?.type}
                    isFetching={isFetching}
                    onSend={handleSendPhoto}
                    onRestart={startCamera}
                    photoUrl={photoUrl}
                    error={error}
                    result={result}
                />
            )}
            <canvas ref={canvasRef} style={{display: "none"}}/>
        </div>
    );
}

export default App;
