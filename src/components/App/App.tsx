import React, {useState} from "react";
import {api} from "../../api/api";
import {useCamera} from "../../hooks/useCamera";
import {Buttons} from "../Buttons/Buttons";
import {base64ToBlob} from "../../utils/photoUtils";
import {Camera} from "../Camera/Camera";
import './App.css'
import {Img} from "../Img/Img";

function App() {
    const {
        isCameraOn,
        startCamera,
        stopCamera,
        photoUrl,
        videoRef,
        canvasRef
    } = useCamera();
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const handleSendPhoto = () => {
        const tg : any = 'Telegram' in window ? window.Telegram : undefined;
        if(tg){
            const urlParams = new URLSearchParams(window.location.search);
            const data = JSON.parse(decodeURIComponent(urlParams?.get('data')??''));
            const chatId = data?.chat_id
            console.log(chatId)
            if (!chatId) {
                setError('Не удалось получить chat_id');
                return;
            }

            if (!photoUrl) {
                setError("Фото не сделано! Попробуйте снова.");
                return;
            }

            const blob = base64ToBlob(photoUrl, "image/jpeg");

            // Создаем formData для отправки медиа
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', blob);
            api.send_photo_to_bot(
                formData,
                setIsFetching,
                setError,
                setResult
            )
        }
        setError("Приложение было открыто НЕ в Телеграмме");
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
