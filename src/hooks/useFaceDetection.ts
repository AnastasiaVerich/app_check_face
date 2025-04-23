// import {useState, useEffect} from "react";
// import {
//     nets, matchDimensions,
//     TinyFaceDetectorOptions,
//     detectAllFaces,
//     resizeResults
// } from "@vladmandic/face-api";
// import {Circle, isRectangleCoveredByCircle, Rectangle} from "../utils/faceUtils";
//
// export const useFaceDetection = (
//     isCameraOn: boolean, // Пропс, который говорит, включена ли камера
//     videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
//     canvasRef: React.RefObject<HTMLCanvasElement>, // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
//     videoBorderRef: React.RefObject<HTMLDivElement>
// ) => {
//     const [isFaceDetected, setIsFaceDetected] = useState(false);// Состояние для отслеживания, было ли найдено лицо
//     const [modelsLoaded, setModelsLoaded] = useState(false);// Состояние для отслеживания, загружены ли модели
//     const [isDraw] = useState(false);// Состояние для отслеживания, загружены ли модели
//
//     // Загружаем модели детекции лиц при монтировании компонента
//     useEffect(() => {
//         const loadModels = async () => {
//             const MODEL_URL = "ia_models"; // Путь к моделям (например, на сервере)
//             await Promise.all([
//                 nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//             ]);
//             setModelsLoaded(true);
//         };
//         loadModels(); // Вызываем функцию загрузки моделей
//     }, []);
//
//     // Детекция лиц
//     useEffect(() => {
//         let interval: any
//         // Если модели загружены и камера включена
//         if (modelsLoaded && isCameraOn) {
//             const detectFace = async () => {
//                 if (videoRef.current && canvasRef.current && videoBorderRef.current) { // Если video и canvas элементы существуют
//                     const video = videoRef.current;
//                     const canvas = canvasRef.current;
//                     const video_border = videoBorderRef.current;
//
//                     // Настроим размеры канваса, чтобы он соответствовал размеру видео
//                     const displaySize = {
//                         width: video_border.offsetWidth,
//                         height: video_border.offsetHeight
//                     };
//                     // Настроим канвас для масштабирования детекций
//                     matchDimensions(canvas, displaySize);
//
//                     // Детекция всех лиц с использованием опций для детектора
//                     const options = new TinyFaceDetectorOptions({inputSize: 416, scoreThreshold: 0.3});
//                     const detections = await detectAllFaces(video, options); // Получаем все обнаруженные лица на видео
//                     const resizedDetections = resizeResults(detections, displaySize); // Масштабируем результаты детекции под размер видео
//
//                     let ctx: any = null
//                     if (isDraw) {
//                         ctx = canvas.getContext('2d');
//                         if (!ctx) return
//                         ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     }
//
//
//                     // Проверяем, попадает ли лицо в оверлей
//                     const circle: Circle = {cx: canvas.clientWidth / 2, cy: canvas.clientHeight / 2, r: 150}; // Создаем круг в центре видео с радиусом 150px
//
//                     let faceDetected = false// Флаг для проверки, было ли найдено лицо в области круга
//                     resizedDetections.forEach((detection) => {
//                             // Извлекаем информацию о прямоугольнике, в котором расположено лицо
//                             const {x, y, width, height} = detection.box;
//                             // Если применен scaleX(-1), нужно скорректировать координаты
//                             const transformedX = canvas.clientWidth - (x + width);
//                             //const rectangle: Rectangle = {x: transformedX, y, width, height};
//                             const rectangle: Rectangle = {x: transformedX, y, width, height}
//
//                             // Проверяем, перекрывает ли прямоугольник (лицо) круг более чем на 80%
//                             // И что бы круг был не больше чем в 5 раз больше прямоугольник , инчае слишко далеко лицо
//                             faceDetected = isRectangleCoveredByCircle(circle, rectangle, 0.8)
//                             if (isDraw && ctx) {
//                                 // Рисуем рамку
//                                 ctx.lineWidth = 4;
//                                 ctx.lineCap = 'square';
//                                 ctx.lineJoin = 'bevel';
//                                 ctx.strokeStyle = '#5199d9';
//
//
//                                 //ctx.strokeRect(transformedX, y, width, height);
//                                 ctx.strokeRect(transformedX, y, width, height);
//                             }
//                         }
//                     );
//                     setIsFaceDetected(faceDetected);
//                     if (isDraw && ctx) {
//                         ctx.beginPath();
//                         ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI); // Рисуем круг
//                         ctx.fillStyle = faceDetected ? 'transparent' : 'transparent'; // Зеленый если лицо внутри круга, красный если нет
//                         ctx.fill();
//                         ctx.lineWidth = 4;
//                         ctx.strokeStyle = faceDetected ? 'green' : 'red';
//                         ctx.stroke();
//                     }
//                 }
//             };
//
//             interval = setInterval(detectFace, 100);// Запускаем детекцию лиц каждые 100 миллисекунд
//         }
//         return () => clearInterval(interval); // Останавливаем детекцию при размонтировании компонента
//
//     }, [modelsLoaded, isCameraOn]);
//
//     return {isFaceDetected, modelsLoaded};
// };
import React, { useState, useEffect } from "react";
import {
    nets,
    matchDimensions,
    TinyFaceDetectorOptions,
    detectAllFaces,
    resizeResults,
    FaceLandmarks68,
    WithFaceLandmarks,
    FaceDetection
} from "@vladmandic/face-api";
import { Circle, isRectangleCoveredByCircle, Rectangle } from "../utils/faceUtils";

interface UseFaceDetectionProps {
    isCameraOn: boolean;
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    videoBorderRef: React.RefObject<HTMLDivElement>;
}
interface UseFaceDetectionReturn {
    isFaceDetected: boolean;
    modelsLoaded: boolean;
    isLivenessVerified: boolean;
    blinkCount: number;
    blinkPrompt: boolean;
}

export const useFaceDetection = ({
                                     isCameraOn,
                                     videoRef,
                                     canvasRef,
                                     videoBorderRef
                                 }: UseFaceDetectionProps): UseFaceDetectionReturn => {
    const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);
    const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
    const [isDraw] = useState<boolean>(false);
    const [blinkCount, setBlinkCount] = useState<number>(0);
    const [isLivenessVerified, setIsLivenessVerified] = useState<boolean>(false);
    const [blinkPrompt, setBlinkPrompt] = useState<boolean>(true);
    const REQUIRED_BLINKS = 2;
    const BLINK_TIMEOUT = 5000;

    // Загружаем модели детекции лиц и landmarks
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "ia_models";
            await Promise.all([
                nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        };
        loadModels();
    }, []);

    // Функция для вычисления Eye Aspect Ratio (EAR)
    const getEyeAspectRatio = (eyePoints: { x: number; y: number }[]): number => {
        const A = Math.hypot(eyePoints[1].x - eyePoints[5].x, eyePoints[1].y - eyePoints[5].y);
        const B = Math.hypot(eyePoints[2].x - eyePoints[4].x, eyePoints[2].y - eyePoints[4].y);
        const C = Math.hypot(eyePoints[0].x - eyePoints[3].x, eyePoints[0].y - eyePoints[3].y);
        return (A + B) / (2.0 * C);
    };

    // Детекция лиц и проверка моргания
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        let timeout: NodeJS.Timeout | undefined;

        if (modelsLoaded && isCameraOn) {
            const detectFace = async () => {
                if (videoRef.current && canvasRef.current && videoBorderRef.current) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const video_border = videoBorderRef.current;

                    const displaySize = {
                        width: video_border.offsetWidth,
                        height: video_border.offsetHeight,
                    };
                    matchDimensions(canvas, displaySize);

                    // Детекция лиц с landmarks
                    const options = new TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 });
                    const detections = await detectAllFaces(video, options).withFaceLandmarks() as WithFaceLandmarks<
                        { detection: FaceDetection },
                        FaceLandmarks68
                    >[];
                    const resizedDetections = resizeResults(detections, displaySize);

                    let ctx: CanvasRenderingContext2D | null = null;
                    if (isDraw) {
                        ctx = canvas.getContext("2d");
                        if (!ctx) return;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }

                    const circle: Circle = { cx: canvas.clientWidth / 2, cy: canvas.clientHeight / 2, r: 150 };
                    let faceDetected = false;
                    let isBlinking = false;

                    resizedDetections.forEach((detection) => {
                        const { x, y, width, height } = detection.detection.box;
                        const transformedX = canvas.clientWidth - (x + width);
                        const rectangle: Rectangle = { x: transformedX, y, width, height };
                        faceDetected = isRectangleCoveredByCircle(circle, rectangle, 0.8);

                        // Проверка моргания
                        if (faceDetected && blinkPrompt) {
                            const landmarks = detection.landmarks;
                            const leftEye = landmarks.getLeftEye();
                            const rightEye = landmarks.getRightEye();

                            const leftEAR = getEyeAspectRatio(leftEye);
                            const rightEAR = getEyeAspectRatio(rightEye);
                            const avgEAR = (leftEAR + rightEAR) / 2;

                            const BLINK_THRESHOLD = 0.25;
                            if (avgEAR < BLINK_THRESHOLD) {
                                isBlinking = true;
                            }
                        }

                        if (isDraw && ctx) {
                            ctx.lineWidth = 4;
                            ctx.strokeStyle = "#5199d9";
                            ctx.strokeRect(transformedX, y, width, height);
                        }
                    });

                    setIsFaceDetected(faceDetected);

                    // Подсчет морганий
                    if (faceDetected && blinkPrompt && isBlinking) {
                        setBlinkCount((prev) => {
                            const newCount = prev + 1;
                            if (newCount >= REQUIRED_BLINKS) {
                                setIsLivenessVerified(true);
                                setBlinkPrompt(false);
                            }
                            return newCount;
                        });
                    }

                    if (isDraw && ctx) {
                        ctx.beginPath();
                        ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI);
                        ctx.fillStyle = "transparent";
                        ctx.fill();
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = faceDetected && isLivenessVerified ? "green" : "red";
                        ctx.stroke();
                    }
                }
            };

            interval = setInterval(detectFace, 100);

            // Таймер для ограничения времени на моргание
            if (blinkPrompt) {
                timeout = setTimeout(() => {
                    if (blinkCount < REQUIRED_BLINKS) {
                        setBlinkPrompt(false);
                        setIsLivenessVerified(false);
                    }
                }, BLINK_TIMEOUT);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timeout) clearTimeout(timeout);
        };
    }, [modelsLoaded, isCameraOn, blinkCount, blinkPrompt]);

    return { isFaceDetected, modelsLoaded, isLivenessVerified, blinkCount, blinkPrompt };
};
