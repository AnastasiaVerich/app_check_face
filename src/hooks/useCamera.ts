import {useState, useRef, useEffect} from "react";
import * as faceapi from '@vladmandic/face-api';

interface Circle {
    cx: number;
    cy: number;
    r: number;
}

interface Rectangle {
    x: number; // Нижний левый угол X
    y: number; // Нижний левый угол Y
    width: number;
    height: number;
}

export const useCamera = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>('');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasBorderRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        // @ts-ignore
        window.videoRef = videoRef
        if (isCameraOn) {
            const detectFace = async () => {
                if (videoRef.current && canvasBorderRef.current && modelsLoaded) {
                    const canvas = canvasBorderRef.current;
                    const video = videoRef.current;


                    // Настройка Canvas
                    const displaySize = {width: video.clientWidth, height: video.clientHeight};
                    faceapi.matchDimensions(canvas, displaySize);

                    // Детекция лиц на видео
                    const options = new faceapi.TinyFaceDetectorOptions({inputSize: 416, scoreThreshold: 0.3});
                    const detections = await faceapi.detectAllFaces(video, options);
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    const ctx = canvas.getContext('2d');
                    if (!ctx) return

                    // Очистка Canvas перед рисованием
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Рисуем круг поверх видео
                    const circleRadius = 150; //
                    const circleX = video.clientWidth / 2; // Центр круга по X
                    const circleY = video.clientHeight / 2; // Центр круга по Y


                    // Проверяем, попадает ли лицо в круг
                    let faceInCircle = false;

                    resizedDetections.forEach((detection) => {
                        const {x, y, width, height} = detection.box;


                        if (isRectangleCoveredByCircle(
                            {cx: circleX, cy: circleY, r: circleRadius},
                            {x: x, y: y, width: width, height: height}
                            ,0.8
                        )) {
                            faceInCircle = true; // Лицо внутри овала
                        }
                   /*     // Рисуем рамку
                        ctx.lineWidth = 4;
                        ctx.lineCap = 'square';
                        ctx.lineJoin = 'bevel';
                        ctx.strokeStyle = '#5199d9';


                        ctx.strokeRect(x, y, width, height);*/
                    });
                    setIsFaceDetected(faceInCircle);

                   /* // Рисуем круг (красный или зеленый в зависимости от состояния)
                    ctx.beginPath();
                    ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI); // Рисуем круг
                    ctx.fillStyle = faceInCircle ? 'transparent' : 'transparent'; // Зеленый если лицо внутри круга, красный если нет
                    ctx.fill();
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = faceInCircle ? 'green' : 'red';
                    ctx.stroke();*/


                }
            };

            const interval = setInterval(detectFace, 100);
            return () => clearInterval(interval);
        }
    }, [isCameraOn])

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = 'ia_models'; // Укажите путь к папке с моделями
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        };
        loadModels();
    }, [])

    /**
     * Вычисляет площадь пересечения прямоугольника и круга.
     */
    function calculateIntersectionArea(circle: Circle, rect: Rectangle): number {
        const { cx, cy, r } = circle;
        const { x: rx, y: ry, width: rw, height: rh } = rect;

        // Шаг для численного расчета (чем меньше, тем точнее)
        const step = Math.min(rw, rh) / 100;

        let intersectionArea = 0;

        // Перебираем точки в пределах прямоугольника
        for (let x = rx; x <= rx + rw; x += step) {
            for (let y = ry; y <= ry + rh; y += step) {
                // Проверяем, находится ли точка внутри круга
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= r * r) {
                    // Точка внутри круга
                    intersectionArea += step * step;
                }
            }
        }

        return intersectionArea;
    }
    /**
     * Проверяет, покрывается ли прямоугольник кругом на заданный процент
     * и находится ли его центр внутри круга на расстоянии r/4.
     */
    function isRectangleCoveredByCircle(circle: Circle, rect: Rectangle, threshold = 0.8): boolean {
        const rectArea = rect.width * rect.height; // Площадь прямоугольника
        const intersectionArea = calculateIntersectionArea(circle, rect);

        // Доля пересечения
        const overlapRatio = intersectionArea / rectArea;

        // Координаты центра прямоугольника
        const rectCenterX = rect.x + rect.width / 2;
        const rectCenterY = rect.y + rect.height / 2; // Учитываем, что Y идет снизу вверх

        // Проверяем, лежит ли центр прямоугольника внутри круга
        const dx = rectCenterX - circle.cx;
        const dy = rectCenterY - circle.cy;
        const distanceSquared = dx * dx + dy * dy;

        const isCenterInsideCircle = distanceSquared <= circle.r * circle.r;
        const isCenterWithinRadiusHalf = distanceSquared <= (circle.r / 4) * (circle.r / 2);

        //console.log(isCenterWithinRadiusHalf)
        // Возвращаем true только если все условия выполнены
        return overlapRatio >= threshold && isCenterInsideCircle && isCenterWithinRadiusHalf;
    }

    const startCamera = async () => {

        const startVideo = async () => {
            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {facingMode: "user"},
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraOn(true);
                setPhotoUrl(null)
                setError(null)
            } catch (err) {
                console.error("Ошибка доступа к камере:", err);
            }
        }
        startVideo()
    };

    const stopCamera = () => {
        takePhoto()
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsCameraOn(false);
    };

    const takePhoto = (): void => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            if (context) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                setPhotoUrl(canvas.toDataURL("image/jpeg"))
                return
            }
        }
        console.log('1')
        setPhotoUrl(null)
    };

    return {
        isCameraOn,
        startCamera,
        stopCamera,
        videoRef,
        canvasRef,
        photoUrl,
        error,
        setError,
        isFaceDetected,
        canvasBorderRef
    };
};
