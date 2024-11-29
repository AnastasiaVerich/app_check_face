import React, { useRef, useState } from 'react';
import './App.css';


// Функция для отправки запроса
const fetch_request = async (url: string, method: 'POST' | 'GET', body: FormData, setIsFetch: any, setError: any, setRes: any) => {
    try {
        const Telegram:any = 'Telegram' in window ? window.Telegram:undefined;
        const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
            method: method,
            body: body, // Отправляем FormData
        });
        setIsFetch(false)
        if (!response.ok) {
            // Если сервер вернул ошибку, выбрасываем исключение
            const errorData = await response.json();

            setError(errorData.error || 'Произошла ошибка при отправке фото');
            throw new Error( 'Неизвестная ошибка');
        }

        const result = await response.json();
        console.log(result);



        if(Telegram){
            if(result ==='Совпадений не найдено.'){
                Telegram.WebApp.sendData(JSON.stringify({ result: "new_face" }));
                setRes('Совпадений не найдено!');
            }
            if(Array.isArray(result)) {
                Telegram.WebApp.sendData(JSON.stringify({ result: 'user_exist' }));
                setRes('Найдено!');
            }
        }
    } catch (err: any) {
        console.log(err)
    }
};

function App() {
    const [isFetch, setIsFetch] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);
    const [res, setRes] = useState<string | null>(null);
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
            setPhotoUrl(null);
        } catch (err) {
            console.error('Ошибка доступа к камере:', err);
            setError('Не удалось получить доступ к камере.');
        }
    };

    // Перезагрузка камеры
    const reStartVerification = async () => {

        setError(null);
        setRes(null);
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
        setIsFetch(true)
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
            setIsFetch,
            setError,
            setRes
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
            setIsFetch,
            setError,
            setRes
        );
    };

    return (
        <div className={'app'}>


            <div className={'video_box'} style={{
                display:isCameraOn?'':'none',
            }}>
                <video
                    className={'video_online'}
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    controls={false}
                />
            </div>

            {/* Для отображения фото */}
            {photoUrl && (
                <div className={'photo_box'}>
                    <img
                        src={photoUrl}
                        alt="Сделанное фото"
                    />
                </div>
            )}

            {!isCameraOn ? (
                photoUrl === null ? (
                    <button className={'button'} onClick={startVerification}>Включить камеру</button>
                ) : (
                    <div className={'btn_box'}>
                        <button disabled={isFetch} onClick={find_user}>Отправить</button>
                        <button disabled={isFetch} onClick={reStartVerification}>Переснять фото</button>
                        {/*  <button onClick={saveUserPhoto}>Сохранить новое фото</button>*/}
                        {error && <div className={'response'} style={{color: 'red'}}>{error}</div>}
                        {res && <div className={'response'} style={{color: 'rgb(100, 202, 102)'}}>{res}</div>}
                    </div>
                )
            ) : (
                <button onClick={stopVerification}>Сфотографировать</button>
            )}

            {/* Скрытый канвас для рисования фото */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}

export default App;
