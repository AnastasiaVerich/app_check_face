import React, { useRef, useState } from 'react';
import './App.css';
const isDev = false
//const URL_= isDev?'http://localhost:5000/': 'https://green-apple.io/'
// Функция для отправки запроса
const fetch_request = async (url: string, method: 'POST' | 'GET', body: FormData, setError: any) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
            method: method,
            body: body, // Отправляем FormData
        });

        if (!response.ok) {
            // Если сервер вернул ошибку, выбрасываем исключение
            const errorData = await response.json();
            setError(errorData.error || 'Произошла ошибка при отправке фото');
            throw new Error( 'Неизвестная ошибка');
        }

        const result = await response.json();
        console.log(result);
        setError('Это не ошибка!'+result); // Очистить ошибку, если запрос успешен
    } catch (err: any) {
        console.log(err)
    }
};

function App() {
    const [error, setError] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Включение камеры
    const startVerification = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOn(true);
        } catch (err) {
            console.error('Ошибка доступа к камере:', err);
            setError('Не удалось получить доступ к камере.');
        }
    };

    // Перезагрузка камеры
    const reStartVerification = async () => {
        setPhotoUrl(null);
        startVerification();
    };

    // Остановка камеры
    const stopVerification = () => {
        takePhoto();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsCameraOn(false);
    };

    // Сделать фото
    const takePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const photo = canvas.toDataURL('image/jpeg');
                setPhotoUrl(photo); // Сохранить ссылку на фото
            }
        }
    };

    // Сохранить фото
    const find_user = () => {
        if (!photoUrl) {
            setError('Фото не сделано! Попробуйте снова.');
            return;
        }

        // Преобразуем Base64 в Blob
        const byteString = atob(photoUrl.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });

        // Создаём объект FormData
        const formData = new FormData();
        formData.append('photo', blob); // Добавляем Blob с именем файла
        formData.append('location', 'Минск');

        // Отправляем FormData
        fetch_request(
            'api/photos/find_user_by_photo',
            'POST',
            formData,
            setError
        );
    };

    // Сохранить фото
    const saveUserPhoto = () => {
        if (!photoUrl) {
            setError('Фото не сделано! Попробуйте снова.');
            return;
        }

        // Преобразуем Base64 в Blob
        const byteString = atob(photoUrl.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });

        // Создаём объект FormData
        const formData = new FormData();
        formData.append('photo', blob); // Добавляем Blob с именем файла
        formData.append('location', 'Минск');

        // Отправляем FormData
        fetch_request(
            'api/photos/save_user_photo',
            'POST',
            formData,
            setError
        );
    };

    return (
        <div>
            <h1>Фото с камеры</h1>
            {!isCameraOn ? (
                photoUrl === null ? (
                    <button onClick={startVerification}>Включить камеру</button>
                ) : (
                    <>
                        <button onClick={reStartVerification}>Переснять фото</button>
                        <button onClick={find_user}>Найти пользователя</button>
                        <button onClick={saveUserPhoto}>Сохранить новое фото</button>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </>
                )
            ) : (
                <button onClick={stopVerification}>Сделать фото</button>
            )}

            <div>
                <video
                    className={'video_online'}
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '20px',
                        display: isCameraOn ? '' : 'none',
                        objectFit: 'cover',
                    }}
                    controls={false}
                />

                {/* Для отображения фото */}
                {photoUrl && (
                    <div>
                        <h3>Фото:</h3>
                        <img
                            src={photoUrl}
                            alt="Сделанное фото"
                            style={{
                                width: '250px',
                                height: 'auto',
                                marginTop: '20px',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Скрытый канвас для рисования фото */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}

export default App;
