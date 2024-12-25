import {useState, useEffect} from "react";
import * as faceapi from "@vladmandic/face-api";
import {Circle, isRectangleCoveredByCircle, Rectangle} from "../utils/faceUtils";

export const useFaceDetection = (
    isCameraOn: boolean, // Пропс, который говорит, включена ли камера
    videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
    canvasRef: React.RefObject<HTMLCanvasElement> // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
) => {
    const [isFaceDetected, setIsFaceDetected] = useState(false);// Состояние для отслеживания, было ли найдено лицо
    const [modelsLoaded, setModelsLoaded] = useState(false);// Состояние для отслеживания, загружены ли модели

    // Загружаем модели детекции лиц при монтировании компонента
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "ia_models"; // Путь к моделям (например, на сервере)
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        };
        loadModels(); // Вызываем функцию загрузки моделей
    }, []);

    // Детекция лиц
    useEffect(() => {
        // Если модели загружены и камера включена
        if (modelsLoaded && isCameraOn) {
            const detectFace = async () => {
                if (videoRef.current && canvasRef.current) { // Если video и canvas элементы существуют
                    const video = videoRef.current;
                    const canvas = canvasRef.current;

                    // Настроим размеры канваса, чтобы он соответствовал размеру видео
                    const displaySize = {width: video.clientWidth, height: video.clientHeight};
                    // Настроим канвас для масштабирования детекций
                    faceapi.matchDimensions(canvas, displaySize);

                    // Детекция всех лиц с использованием опций для детектора
                    const options = new faceapi.TinyFaceDetectorOptions({inputSize: 416, scoreThreshold: 0.3});
                    const detections = await faceapi.detectAllFaces(video, options); // Получаем все обнаруженные лица на видео
                    const resizedDetections = faceapi.resizeResults(detections, displaySize); // Масштабируем результаты детекции под размер видео

                    // Проверяем, попадает ли лицо в оверлей
                    const circle: Circle = {cx: video.clientWidth / 2, cy: video.clientHeight / 2, r: 150}; // Создаем круг в центре видео с радиусом 150px

                    let faceDetected = false// Флаг для проверки, было ли найдено лицо в области круга
                    resizedDetections.forEach((detection) => {
                        // Извлекаем информацию о прямоугольнике, в котором расположено лицо
                        const {x, y, width, height} = detection.box;
                        const rectangle:Rectangle = {x, y, width, height}
                        // Проверяем, перекрывает ли прямоугольник (лицо) круг более чем на 80%
                            faceDetected = isRectangleCoveredByCircle(circle, rectangle, 0.8)
                        }

                    );
                    setIsFaceDetected(faceDetected);
                }
            };

            const interval = setInterval(detectFace, 100);// Запускаем детекцию лиц каждые 100 миллисекунд
            return () => clearInterval(interval); // Останавливаем детекцию при размонтировании компонента
        }
    }, [modelsLoaded, isCameraOn]);

    return {isFaceDetected, modelsLoaded};
};
