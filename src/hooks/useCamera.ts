import React, {useState, useRef} from "react";

export const useCamera = (
    setPhotoUrl:any,
    setError:any,
    videoRef:React.RefObject<HTMLVideoElement>,
    canvasRef:React.RefObject<HTMLCanvasElement>,
    streamRef:any
) => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const startCamera = async () => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {facingMode: "user"},
                });
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
                setIsCameraOn(true);
                setPhotoUrl(null)
                setError(null)
            } catch (err) {
                setError("Ошибка доступа к камере");
                console.error(err);
            }
        }
        startVideo()
    };

    const stopCamera = () => {
        takePhoto()
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track: { stop: () => any; }) => track.stop());
        }
        setIsCameraOn(false);
    };

    const takePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            if (context) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                setPhotoUrl(canvas.toDataURL("image/jpeg"));
                return
            }
        }
        setPhotoUrl(null)
    };

    return {
        isCameraOn,
        startCamera,
        stopCamera,
    };
};
