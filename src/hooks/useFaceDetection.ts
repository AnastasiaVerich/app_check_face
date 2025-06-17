import {useState, useEffect} from "react";
import Human, {Config, FaceResult} from "@vladmandic/human";
import {Circle, isRectangleCoveredByCircle, Rectangle} from "../utils/faceUtils";

// Конфигурация для Human
const config: Partial<Config> = {
    modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models/", // Путь к моделям
    face: {
        enabled: true, // Включаем детекцию лиц
        detector: {rotation: false, maxDetected: 1, minConfidence: 0.3}, // Ограничиваем до 1 лица для оптимизации
        mesh: {enabled: false}, // Отключаем 3D-сетку лица, если не нужна
        iris: {enabled: false}, // Отключаем детекцию радужки
        description: {
            enabled: false, // Отключаем анализ лица (возраст, пол и т.д.)
            minConfidence: 0.5// Минимальная уверенность для детекции лица
        },
        emotion: {enabled: false}, // Отключаем анализ эмоций
    },
    body: {enabled: false}, // Отключаем детекцию тела
    hand: {enabled: false}, // Отключаем детекцию рук
    gesture: {enabled: false}, // Отключаем детекцию жестов
    cacheSensitivity: 0, // Отключаем кэширование для реального времени
};

// Интерфейс для размеров
interface Dimensions {
    width: number;
    height: number;
}

// Интерфейс для масштабированного FaceResult
interface ScaledFaceResult extends FaceResult {
    box: [number, number, number, number]; // [x, y, width, height]
}

// Функция проверки поддержки WebGL
const isWebGLSupported = (): boolean => {
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!gl && gl instanceof WebGLRenderingContext;
    } catch (e) {
        console.error("WebGL check failed:", e);
        return false;
    }
};
// Функция масштабирования
function resizeResults<T extends FaceResult | FaceResult[]>(
    results: T,
    inputDimensions: Dimensions,
    targetDimensions: Dimensions
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

    const scaleFaceResult = (face: FaceResult): ScaledFaceResult => {
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

export const useFaceDetection = (
    isCameraOn: boolean, // Пропс, который говорит, включена ли камера
    videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
    canvasRef: React.RefObject<HTMLCanvasElement>, // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    videoBorderRef: React.RefObject<HTMLDivElement>,
    isLoaded: boolean,
) => {
    //https://anastasiaverich.github.io/app_check_face/
    const [isFaceDetected, setIsFaceDetected] = useState(false);// Состояние для отслеживания, было ли найдено лицо
    const [selectedBackend, setSelectedBackend] = useState('');// Состояние для отслеживания, было ли найдено лицо
    const [humanLoaded, setHumanLoaded] = useState(false);
    const [detectionStart, setDetectionStart] = useState(false);
    const [humanInstance, setHumanInstance] = useState<Human | null>(null);
    const [isDraw] = useState(false);// Состояние для отслеживания, загружены ли модели

// Инициализация Human
    useEffect(() => {
        const initHuman = async () => {
            console.log("Начало инициализации Human:", new Date().toISOString());
            try {
                const selectedBackend = isWebGLSupported() ? "webgl" : "wasm";
                const humanConfig: Partial<Config> = { ...config, backend: selectedBackend };
                console.log(`Выбран backend: ${selectedBackend}`);
                setSelectedBackend(selectedBackend)
                const human = new Human(humanConfig);
                await human.load();
                //const res = await human.warmup();
                //console.log(res)
                setHumanInstance(human);
                setHumanLoaded(true);
                console.log("Human инициализирован:", new Date().toISOString());
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
            let i = 0
            const detectFace = async () => {

                const now = Date.now();
                try {
                    i++
                    let y = i
                    if (videoRef.current && canvasRef.current && videoBorderRef.current) { // Если video и canvas элементы существуют
                        setDetectionStart(true)
                        if (now - lastDetectionTime >= 200) { // Детекция каждые 200 мс

                            const video = videoRef.current;
                            const canvas = canvasRef.current;
                            const video_border = videoBorderRef.current;

                            // Настроим размеры канваса, чтобы он соответствовал размеру видео
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
                            const result = await humanInstance.detect(video); // Выполняем детекцию

                            faces = result.face || []; // Извлекаем массив лиц
                            lastDetectionTime = now;

                            const resizedFaces = resizeResults(faces, inputSize, displaySize);

                            let ctx: any = null
                            if (isDraw) {
                                ctx = canvas.getContext('2d');
                                if (!ctx) return
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                            }


                            // Проверяем, попадает ли лицо в оверлей
                            const circle: Circle = {cx: canvas.clientWidth / 2, cy: canvas.clientHeight / 2, r: 150}; // Создаем круг в центре видео с радиусом 150px

                            let faceDetected = false// Флаг для проверки, было ли найдено лицо в области круга
                            resizedFaces.forEach((face) => {
                                    // Извлекаем координаты bounding box лица
                                    let [x, y, width, height] = face.box;

                                    const transformedX = canvas.clientWidth - (x + width);

                                    const rectangle: Rectangle = {x: transformedX, y, width, height}

                                    faceDetected = isRectangleCoveredByCircle(circle, rectangle, 0.8)
                                    if (isDraw && ctx) {
                                        // Рисуем рамку
                                        ctx.lineWidth = 4;
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


                    }
                } catch (error) {
                    console.error('Ошибка в detectFace:', error);
                } finally {
                    animationFrameId = requestAnimationFrame(detectFace);
                }
            };
            detectFace()
        }

    }, [humanLoaded, isCameraOn, isLoaded, humanInstance,selectedBackend]);

    return {isFaceDetected, detectionStart, humanLoaded,humanInstance,selectedBackend};
};

