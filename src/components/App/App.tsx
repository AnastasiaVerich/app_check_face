import React, {useEffect, useRef, useState} from "react";
import {Buttons} from "../Buttons/Buttons";
import {base64ToBlob} from "../../utils/photoUtils";
import {Camera} from "../Camera/Camera";
import './App.css'
import '../../styles/variables.css'
import {Img} from "../Img/Img";
import {ParamsType, Telegram} from "../../types/type";
import {useCamera} from "../../hooks/useCamera";
import {useFaceDetection} from "../../hooks/useFaceDetection";
import {FormDataRegistration, registration} from "../../api/user/registration";
import {FormDataCheckExist, identification} from "../../api/user/identification";

function App() {

    const videoRef = useRef<HTMLVideoElement | null>(null); // Ссылка на элемент video, который будет показывать видео с камеры
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    const streamRef = useRef<MediaStream | null>(null); // Ссылка на поток видео
    const [isFetching, setIsFetching] = useState(false); // Флаг состояния загрузки
    const [params, setParams] = useState<ParamsType>(null); // Параметры приложения
    const [result, setResult] = useState<string | null>(null);// Результат обработки
    const [photoUrl, setPhotoUrl] = useState<string | null>(null); // URL фото
    const [error, setError] = useState<string | null>(null);// Сообщение об ошибке

    const {
        isCameraOn,
        startCamera,
        stopCamera,
    } = useCamera(setPhotoUrl, setError, videoRef, canvasRef, streamRef)

    const {
        isFaceDetected,
    } = useFaceDetection(isCameraOn, videoRef, canvasRef)

    useEffect(() => {

        // Получаем параметры из URL
        const urlParams = new URLSearchParams(window.location.search);
        const data = JSON.parse(decodeURIComponent(urlParams?.get('data') ?? '{}'));
        setParams(data)

        // Синхронизация стилей из Telegram WebApp
        const tg: Telegram | undefined = 'Telegram' in window ? window.Telegram as Telegram : undefined;

        tg?.WebApp.ready(); // Уведомляем Telegram, что приложение готово
        tg?.WebApp.expand(); // Разворачиваем приложение

        document.body.style.backgroundColor = tg?.WebApp.themeParams.bg_color || '#ffffff';

        const handleResize = () => {
            document.body.style.height = `${window.innerHeight}px`;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            // Убираем обработчик при размонтировании
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    const handleSendPhoto = () => {
        const tg: any = 'Telegram' in window ? window.Telegram : undefined;
        if (params?.type === 'registration') {
            // Логика для регистрации
            if (tg) {


                if (!photoUrl) {
                    setError("Фото не сделано! Попробуйте снова.");
                    return;
                }

                const blob = base64ToBlob(photoUrl, "image/jpeg");

                // Создаем formData для отправки медиа
                const formData = new FormData();

                const data:FormDataRegistration={
                    userPhone: params?.userPhone ?? '',
                    userId:params?.userId ?? '',
                    isSavePhoto: params?.isSavePhoto ?? '0',
                    photo:blob
                }

                formData.append('userPhone', data.userPhone);
                formData.append('userId', data.userId);
                formData.append('photo', data.photo);
                formData.append('isSavePhoto', data.isSavePhoto);

                setIsFetching(true)

                registration(
                    formData,
                    setIsFetching,
                    setError,
                )
            } else {

                setError("Приложение было открыто НЕ в Телеграмме");
            }
        } else if (params?.type === 'identification') {
            // Логика для идентификации
            if (tg) {

                if (!photoUrl) {
                    setError("Фото не сделано! Попробуйте снова.");
                    return;
                }

                const blob = base64ToBlob(photoUrl, "image/jpeg");

                const formData = new FormData();

                const data:FormDataCheckExist={
                    userId:params?.userId ?? '',
                    photo:blob
                }

                formData.append('userId', data.userId);
                formData.append('photo', data.photo);

                setIsFetching(true)

                identification(
                    formData,
                    setIsFetching,
                    setError,
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
