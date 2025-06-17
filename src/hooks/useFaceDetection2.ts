import {useState, useEffect} from "react";
import Human, {Config, FaceResult} from "@vladmandic/human";
import {Circle, isRectangleCoveredByCircle, Rectangle} from "../utils/faceUtils";

const config = {
    cacheSensitivity: 0.01,
    modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
    filter: {enabled: true, equalization: true}, // lets run with histogram equilizer
    debug: true,
    face: {
        enabled: true,
        detector: {rotation: true, return: true, mask: false}, // return tensor is used to get detected face image
        description: {enabled: true}, // default model for face descriptor extraction is faceres
        // mobilefacenet: { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' }, // alternative model
        insightface: {
            enabled: true,
            modelPath: 'https://vladmandic.github.io/insightface/models/insightface-mobilenet-swish.json'
        }, // alternative model
        iris: {enabled: true}, // needed to determine gaze direction
        emotion: {enabled: false}, // not needed
        antispoof: {enabled: true}, // enable optional antispoof module
        liveness: {enabled: true}, // enable optional liveness module
    },
    body: {enabled: false},
    hand: {enabled: false},
    object: {enabled: false},
    gesture: {enabled: true}, // parses face and iris gestures
};
const options = {
    minConfidenceAntispoof: 0.6,
    minConfidenceLiveness: 0.6,
    minConfidenceFace: 0.6,
    minFaceSize: 224, // минимальный размер лица в пикселях
    blinkMin: 10, // minimum duration of a valid blink
    blinkMax: 800, // maximum duration of a valid blink
    distanceMin: 0.3, // минимальное расстояние в метрах (40 см)
    distanceMax: 1.0, // максимальное расстояние в метрах (100 см)
}
const blink = { // internal timers for blink start/end/duration
    start: 0,
    end: 0,
    time: 0,
};
const ok: Record<string, { status: boolean | undefined, val: number }> = {
    blinkDetected: {status: false, val: 0},
    antispoofCheck: {status: false, val: 0},
    livenessCheck: {status: false, val: 0},
    faceConfidence: {status: false, val: 0},
    faceSize: {status: false, val: 0},
    distance: {status: false, val: 0},
};

export const useFaceDetection2 = (
    isCameraOn: boolean, // Пропс, который говорит, включена ли камера
    videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
    canvasRef: React.RefObject<HTMLCanvasElement>, // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    videoBorderRef: React.RefObject<HTMLDivElement>,
    isLoaded: boolean,
) => {
    const [blinkDetected, setBlinkDetected] = useState(false);
    const [antispoofCheck, setAntispoofCheck] = useState(false);
    const [livenessCheck, setLivenessCheck] = useState(false);
    const [faceConfidence, setFaceConfidence] = useState(false);
    const [faceSize, setFaceSize] = useState(false);
    const [distance, setDistance] = useState(false);
    const [faceInCenter, setFaceInCenter] = useState(false);

    const [selectedBackend, setSelectedBackend] = useState('');// Состояние для отслеживания, было ли найдено лицо
    const [humanLoaded, setHumanLoaded] = useState(false);
    const [detectionStart, setDetectionStart] = useState(false);
    const [humanInstance, setHumanInstance] = useState<Human | null>(null);
    const [isDraw] = useState(false);// Состояние для отслеживания, загружены ли модели


    // Инициализация Human
    useEffect(() => {
        const initHuman = async () => {
            try {
                const selectedBackend = isWebGLSupported() ? "webgl" : "wasm";
                const humanConfig: Partial<Config> = {...config, backend: selectedBackend};
                setSelectedBackend(selectedBackend)
                const human = new Human(humanConfig);
                await human.load();
                await human.warmup();
                setHumanInstance(human);
                setHumanLoaded(true);
            } catch (error) {
                console.error("Ошибка инициализации Human:", error);
            }
        };
        initHuman();
    }, []);

    // Детекция лиц
    useEffect(() => {
        let animationFrameId = null;
        let lastDetectionTime = 0;

        if (humanLoaded &&
            isCameraOn &&
            isLoaded &&
            videoRef.current &&
            canvasRef.current &&
            videoBorderRef.current &&
            humanInstance
        ) {

            const detectFace = async () => {

                const now = Date.now();

                try {
                    if (videoRef.current && canvasRef.current && videoBorderRef.current) {
                        setDetectionStart(true)
                        if (now - lastDetectionTime >= 200) {

                            const video = videoRef.current;
                            const canvas = canvasRef.current;
                            const video_border = videoBorderRef.current;


                            const displaySize = {
                                width: video_border.offsetWidth,
                                height: video_border.offsetHeight
                            };

                            canvas.width = displaySize.width;
                            canvas.height = displaySize.height;

                            const inputSize = {
                                width: video.videoWidth,
                                height: video.videoHeight,
                            };

                            if (!inputSize.width || !inputSize.height) return;

                            let faces: FaceResult[] = [];
                            const result = await humanInstance.detect(video);

                            faces = result.face || [];
                            const firstFace = faces[0];
                            lastDetectionTime = now;


                            if (firstFace) {

                                const resizedFaces = resizeResults([firstFace], inputSize, displaySize);

                                let ctx: any = null
                                if (isDraw) {
                                    ctx = canvas.getContext('2d');
                                    if (!ctx) return
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                }

                                const circle: Circle = {
                                    cx: canvas.clientWidth / 2,
                                    cy: canvas.clientHeight / 2,
                                    r: 150
                                }; // Создаем круг в центре видео с радиусом 150px

                                let faceInCircle = false// Флаг для проверки, было ли найдено лицо в области круга
                                resizedFaces.forEach((face) => {
                                    // Извлекаем координаты bounding box лица
                                    let [x, y, width, height] = face.box;

                                    const transformedX = canvas.clientWidth - (x + width);

                                    const rectangle: Rectangle = {x: transformedX, y, width, height}

                                    faceInCircle = isRectangleCoveredByCircle(circle, rectangle, 0.8)
                                    if (isDraw && ctx) {
                                        // Рисуем рамку
                                        ctx.lineWidth = 4;
                                        ctx.lineJoin = 'bevel';
                                        ctx.strokeStyle = '#5199d9';


                                        //ctx.strokeRect(transformedX, y, width, height);
                                        ctx.strokeRect(transformedX, y, width, height);
                                    }
                                });
                                if (isDraw && ctx) {
                                    ctx.beginPath();
                                    ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI); // Рисуем круг
                                    ctx.fillStyle = faceInCircle ? 'transparent' : 'transparent'; // Зеленый если лицо внутри круга, красный если нет
                                    ctx.fill();
                                    ctx.lineWidth = 4;
                                    ctx.strokeStyle = faceInCircle ? 'green' : 'red';
                                    ctx.stroke();
                                }

                                setFaceInCenter(faceInCircle)

                                const gestures = Object.values(humanInstance.result.gesture).map(gesture => gesture.gesture);

                                if (gestures.includes('blink left eye') || gestures.includes('blink right eye')) blink.start = humanInstance.now();
                                if (blink.start > 0 && !gestures.includes('blink left eye') && !gestures.includes('blink right eye')) blink.end = humanInstance.now();

                                ok.blinkDetected.status = ok.blinkDetected.status || (
                                    Math.abs(blink.end - blink.start) > options.blinkMin &&
                                    Math.abs(blink.end - blink.start) < options.blinkMax
                                );
                                setBlinkDetected(ok.blinkDetected.status)

                                ok.antispoofCheck.val = firstFace.real || 0;
                                ok.antispoofCheck.status = ok.antispoofCheck.val >= options.minConfidenceAntispoof;
                                setAntispoofCheck(ok.antispoofCheck.status)


                                ok.livenessCheck.val = firstFace.live || 0;
                                ok.livenessCheck.status = ok.livenessCheck.val >= options.minConfidenceLiveness;
                                setLivenessCheck(ok.livenessCheck.status)

                                ok.faceConfidence.val = firstFace.faceScore || firstFace.boxScore || 0;
                                ok.faceConfidence.status = ok.faceConfidence.val >= options.minConfidenceFace;
                                setFaceConfidence(ok.faceConfidence.status)

                                ok.faceSize.val = Math.min(firstFace.box[2], firstFace.box[3]);
                                ok.faceSize.status = ok.faceSize.val >= options.minFaceSize;
                                setFaceSize(ok.faceSize.status)

                                ok.distance.val = firstFace.distance || 0;
                                ok.distance.status = (ok.distance.val >= options.distanceMin) && (ok.distance.val <= options.distanceMax);
                                setDistance(ok.distance.status)

                            }

                        }


                    }
                } catch (error) {
                    console.error('Ошибка в detectFace:', error);
                } finally {
                    animationFrameId = requestAnimationFrame(detectFace);
                }
            };
            detectFace()
        }

    }, [humanLoaded, isCameraOn, isLoaded, humanInstance, selectedBackend]);

    // Функция масштабирования
    function resizeResults<T extends FaceResult | FaceResult[]>(
        results: T,
        inputDimensions: {
            width: number;
            height: number;
        },
        targetDimensions: {
            width: number;
            height: number;
        }
    ): T {
        // Эмулируем inputSize: 416, как в TinyFaceDetector
        const modelInputSize = 416;
        const videoAspectRatio = inputDimensions.width / inputDimensions.height;
        let modelWidth = modelInputSize;
        let modelHeight = modelInputSize;

        // Сохраняем пропорции видео
        if (videoAspectRatio > 1) {
            modelHeight = modelInputSize / videoAspectRatio;
        } else {
            modelWidth = modelInputSize * videoAspectRatio;
        }

        // Масштабируем от разрешения видео к modelInputSize
        const scaleXModel = modelWidth / inputDimensions.width;
        const scaleYModel = modelHeight / inputDimensions.height;

        // Масштабируем от modelInputSize к канвасу
        const scaleXCanvas = targetDimensions.width / modelWidth;
        const scaleYCanvas = targetDimensions.height / modelHeight;

        const scaleFaceResult = (face: FaceResult): {box: [number, number, number, number]} => {
            const [x, y, width, height] = face.box;
            // Сначала масштабируем к modelInputSize
            const modelX = x * scaleXModel;
            const modelY = y * scaleYModel;
            const modelWidthScaled = width * scaleXModel;
            const modelHeightScaled = height * scaleYModel;
            // Затем масштабируем к канвасу
            return {
                ...face,
                box: [
                    modelX * scaleXCanvas,
                    modelY * scaleYCanvas,
                    modelWidthScaled * scaleXCanvas,
                    modelHeightScaled * scaleYCanvas,
                ],
            };
        };

        if (Array.isArray(results)) {
            return results.map(scaleFaceResult) as T;
        }
        return scaleFaceResult(results) as T;
    }


// Функция проверки поддержки WebGL
    function isWebGLSupported():boolean {
        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            return !!gl && gl instanceof WebGLRenderingContext;
        } catch (e) {
            console.error("WebGL check failed:", e);
            return false;
        }
    };

    const valuesFaceId = {
        blinkDetected: blinkDetected,
        antispoofCheck: antispoofCheck,
        livenessCheck: livenessCheck,
        faceConfidence: faceConfidence,
        faceSize: faceSize,
        distance: distance,
        faceInCenter: faceInCenter
    }
    return {detectionStart, humanLoaded, humanInstance, selectedBackend,valuesFaceId}
};

