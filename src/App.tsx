import React, {useRef, useState} from 'react';
import './App.css';


const fetch_request = async  (url: string, method:'POST'|'GET', body:any,setError:any) => {
    try {
        const response = await fetch(`https://green-apple.io/${url}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body, // Отправляем фото в формате Base64
        });

        if (!response.ok) {
            // Если сервер вернул ошибку, выбрасываем исключение
            const errorData = await response.json();
            throw new Error(errorData.error || 'Неизвестная ошибка');
        }

        const result = await response.json();
        console.log(result);
        setError(null); // Очистить ошибку, если запрос успешен
    } catch (err: any) {
        setError(err.message || 'Произошла ошибка при отправке фото');
    }
}


function App() {
    const [error, setError] = useState(null);

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [photoUrl,setPhotoUrl ] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);


    // Функция для начала верификации
    const startVerification = async () => {
        try {
            // Получаем поток с камеры
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {facingMode: 'user'} // Предпочтительно передняя камера
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                //videoRef.current.play()
            }
            setIsCameraOn(true);
        } catch (err) {
            console.error('Ошибка доступа к камере:', err);
        }
    };
    const reStartVerification = async () => {
        setPhotoUrl(null)
        startVerification()
    };

    // Функция для остановки верификации
    const stopVerification = () => {
        takePhoto()
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setIsCameraOn(false);
    };

    // Сделать фото
    const takePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            console.log(canvas)
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

    const savePhoto = ()=>{
        fetch_request(
            'api/photos/upload-photo',
            'POST',
            JSON.stringify({ image: photoUrl }),
            setError
            )
    }

    return (
        <div>
            <h1>Фото с камеры</h1>
            {!isCameraOn
                ? photoUrl === null
                    ? (
                        <button onClick={startVerification}>Включить камеру</button>
                    )
                    : (<>
                        <button onClick={reStartVerification}>Переснять фото</button>
                        <button onClick={savePhoto}>Отправить фото</button>
                            {error && <p>{error}</p>}
                        </>
                    )
                : (
                    <button onClick={stopVerification}>Сделать фото</button>
                )}

            <div>
                <video className={'video_online'} ref={videoRef} playsInline autoPlay muted style={{
                    width: '100%',
                    height: 'auto',
                    marginTop: '20px',
                    display: isCameraOn ? '' : 'none',
                    objectFit: 'cover'
                }} controls={false}/>

                {/* Для сохранения видео */}
                {photoUrl && (
                    <div>
                        <h3>Фото:</h3>
                        <h3>{photoUrl}</h3>
                        <img
                            src={photoUrl}
                            style={{
                                width: '250px',
                                height: 'auto',
                                marginTop: '20px'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Скрытый канвас для рисования фото */}
            <canvas ref={canvasRef} style={{display: 'none'}}/>
        </div>
    );
};

export default App;
