import {useState, useRef, useEffect} from "react";
import * as faceapi from '@vladmandic/face-api';

export const useCamera = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string| null>('');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFaceDetected, setIsFaceDetected] = useState(false);

    useEffect(()=>{
        if(isCameraOn){
            const detectFace = async () => {
                if (videoRef.current) {
                    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
                    const detections = await faceapi.detectAllFaces(videoRef.current, options);
                    setIsFaceDetected(detections.length > 0);
                }
            };

            const interval = setInterval(detectFace, 100);
            return () => clearInterval(interval);
        }
    },[isCameraOn])

    console.log(__dirname)
    const startCamera = async () => {
        const loadModels = async () => {
            const MODEL_URL = 'ia_models'; // Укажите путь к папке с моделями
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        };
        const startVideo = async () =>{
            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
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
        loadModels().then(startVideo);
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

    return { isCameraOn, startCamera, stopCamera, videoRef, canvasRef,photoUrl,error, setError,isFaceDetected };
};
