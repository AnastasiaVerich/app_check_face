import {useState, useEffect} from "react";
import {
    nets, matchDimensions,
    TinyFaceDetectorOptions,
    detectAllFaces,
    resizeResults
} from "@vladmandic/face-api";
import {Circle, isRectangleCoveredByCircle, Rectangle} from "../utils/faceUtils";

export const useFaceDetection = (
    isCameraOn: boolean, // Пропс, который говорит, включена ли камера
    videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
    canvasRef: React.RefObject<HTMLCanvasElement>, // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    videoBorderRef: React.RefObject<HTMLDivElement>
) => {
    const [isFaceDetected, setIsFaceDetected] = useState(false);// Состояние для отслеживания, было ли найдено лицо
    const [modelsLoaded, setModelsLoaded] = useState(false);// Состояние для отслеживания, загружены ли модели
    const [isDraw] = useState(false);// Состояние для отслеживания, загружены ли модели

    // Загружаем модели детекции лиц при монтировании компонента
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "ia_models"; // Путь к моделям (например, на сервере)
            await Promise.all([
                nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        };
        loadModels(); // Вызываем функцию загрузки моделей
    }, []);

    // Детекция лиц
    useEffect(() => {
        let interval: any
        // Если модели загружены и камера включена
        if (modelsLoaded && isCameraOn) {
            const detectFace = async () => {
                if (videoRef.current && canvasRef.current && videoBorderRef.current) { // Если video и canvas элементы существуют
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const video_border = videoBorderRef.current;

                    // Настроим размеры канваса, чтобы он соответствовал размеру видео
                    const displaySize = {
                        width: video_border.offsetWidth,
                        height: video_border.offsetHeight
                    };
                    // Настроим канвас для масштабирования детекций
                    matchDimensions(canvas, displaySize);

                    // Детекция всех лиц с использованием опций для детектора
                    const options = new TinyFaceDetectorOptions({inputSize: 416, scoreThreshold: 0.3});
                    const detections = await detectAllFaces(video, options); // Получаем все обнаруженные лица на видео
                    const resizedDetections = resizeResults(detections, displaySize); // Масштабируем результаты детекции под размер видео

                    let ctx: any = null
                    if (isDraw) {
                        ctx = canvas.getContext('2d');
                        if (!ctx) return
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }


                    // Проверяем, попадает ли лицо в оверлей
                    const circle: Circle = {cx: canvas.clientWidth / 2, cy: canvas.clientHeight / 2, r: 150}; // Создаем круг в центре видео с радиусом 150px

                    let faceDetected = false// Флаг для проверки, было ли найдено лицо в области круга
                    resizedDetections.forEach((detection) => {
                            // Извлекаем информацию о прямоугольнике, в котором расположено лицо
                            const {x, y, width, height} = detection.box;
                            // Если применен scaleX(-1), нужно скорректировать координаты
                            const transformedX = canvas.clientWidth - (x + width);
                            //const rectangle: Rectangle = {x: transformedX, y, width, height};
                            const rectangle: Rectangle = {x: transformedX, y, width, height}

                            // Проверяем, перекрывает ли прямоугольник (лицо) круг более чем на 80%
                            // И что бы круг был не больше чем в 5 раз больше прямоугольник , инчае слишко далеко лицо
                            faceDetected = isRectangleCoveredByCircle(circle, rectangle, 0.8)
                            if (isDraw && ctx) {
                                // Рисуем рамку
                                ctx.lineWidth = 4;
                                ctx.lineCap = 'square';
                                ctx.lineJoin = 'bevel';
                                ctx.strokeStyle = '#5199d9';


                                //ctx.strokeRect(transformedX, y, width, height);
                                ctx.strokeRect(transformedX, y, width, height);
                            }
                        }
                    );
                    setIsFaceDetected(faceDetected);
                    if (isDraw && ctx) {
                        ctx.beginPath();
                        ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI); // Рисуем круг
                        ctx.fillStyle = faceDetected ? 'transparent' : 'transparent'; // Зеленый если лицо внутри круга, красный если нет
                        ctx.fill();
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = faceDetected ? 'green' : 'red';
                        ctx.stroke();
                    }
                }
            };

            interval = setInterval(detectFace, 100);// Запускаем детекцию лиц каждые 100 миллисекунд
        }
        return () => clearInterval(interval); // Останавливаем детекцию при размонтировании компонента

    }, [modelsLoaded, isCameraOn]);

    return {isFaceDetected, modelsLoaded};
};
