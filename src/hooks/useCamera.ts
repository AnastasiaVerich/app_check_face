import React, {useState} from "react";

// Хук для управления камерой: запуск камеры, остановка и создание снимков
export const useCamera = (
    setPhotoUrl: any, // Функция для установки URL снимка (состояние для изображения)
    setError: any, // Функция для установки ошибки
    videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
    canvasRef: React.RefObject<HTMLCanvasElement>, // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    streamRef: any // Ссылка для сохранения потока камеры (чтобы управлять треками)
) => {
    const [isCameraOn, setIsCameraOn] = useState(false);// Состояние, показывающее включена ли камера

    // Функция для старта камеры
    const startCamera = async () => {
        const startVideo = async () => {
            try {
                // Получаем доступ к камере с использованием API getUserMedia
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {facingMode: "user"}, // Запрашиваем видео с камеры пользователя (фронтальная)
                });
                streamRef.current = stream; // Сохраняем поток для управления (для остановки камеры)
                if (videoRef.current) videoRef.current.srcObject = stream;// Отображаем поток в элементе video
                setIsCameraOn(true);
                setPhotoUrl(null); // Обнуляем URL снимка (если камера включена, не показываем старое фото)
                setError(null); // Очищаем ошибку, если она была
            } catch (err) {
                // Если не удалось получить доступ к камере, выводим ошибку
                setError("Ошибка доступа к камере");
                console.error(err);
            }
        }
        startVideo()
    };

    // Функция для остановки камеры
    const stopCamera = () => {

        takePhoto()// Делаем снимок перед остановкой камеры
        if (streamRef.current) {

            // Останавливаем все треки (видео и аудио), связанные с камерой
            streamRef.current.getTracks().forEach((track: { stop: () => any; }) => track.stop());
        }
        setIsCameraOn(false);
    };

    // Функция для захвата снимка с камеры
    const takePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current; // Получаем ссылку на канвас
            const context = canvas.getContext("2d"); // Получаем контекст рисования канваса
            if (context) {
                // Устанавливаем размеры канваса, чтобы они соответствовали видео
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                // Рисуем изображение с видео на канвасе
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                // Устанавливаем фото как DataURL с форматом JPEG
                setPhotoUrl(canvas.toDataURL("image/jpeg"));
                return // Выход из функции, если фото успешно сделано
            }
        }
        setPhotoUrl(null) // Если не удалось сделать снимок, сбрасываем URL
    };

    return {
        isCameraOn,
        startCamera,
        stopCamera,
    };
};
