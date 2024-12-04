import {useState, useEffect} from "react";
import * as faceapi from "@vladmandic/face-api";
import {Circle, isRectangleCoveredByCircle, Rectangle} from "../utils/faceUtils";

export const useFaceDetection = (
    isCameraOn: boolean,
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
) => {
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "/ia_models";
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (modelsLoaded && isCameraOn) {
            const detectFace = async () => {
                if (videoRef.current && canvasRef.current) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;

                    // Настройка Canvas
                    const displaySize = {width: video.clientWidth, height: video.clientHeight};
                    faceapi.matchDimensions(canvas, displaySize);

                    // Детекция лиц
                    const options = new faceapi.TinyFaceDetectorOptions({inputSize: 416, scoreThreshold: 0.3});
                    const detections = await faceapi.detectAllFaces(video, options);
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);


                    // Проверка попадания лица в круг
                    const circle: Circle = {cx: video.clientWidth / 2, cy: video.clientHeight / 2, r: 150};

                    let faceDetected = false
                    resizedDetections.forEach((detection) => {
                        const {x, y, width, height} = detection.box;
                        const rectangle:Rectangle = {x, y, width, height}
                            faceDetected = isRectangleCoveredByCircle(circle, rectangle, 0.8)
                        }

                    );
                    setIsFaceDetected(faceDetected);
                }
            };

            const interval = setInterval(detectFace, 100);
            return () => clearInterval(interval);
        }
    }, [modelsLoaded, isCameraOn]);

    return {isFaceDetected, modelsLoaded};
};
