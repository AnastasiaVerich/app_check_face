import { useState, useRef } from "react";

export const useCamera = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string| null>('');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {

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

    return { isCameraOn, startCamera, stopCamera, videoRef, canvasRef,photoUrl,error, setError };
};
