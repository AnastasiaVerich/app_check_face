import React, {useEffect, useRef, useState} from "react";
import './CameraSection.css'
import {Section} from "../../shared/ui/Section/Section";
import {HStack} from "../../shared/ui/HStack/HStack";
import {Text} from "../../shared/ui/Text/Text";
import {CAMERA_DESC, TAKE_PHOTO} from "../../types/const";
import {Svg} from "../../shared/ui/Svg/Svg";
import {CommonSection} from "../../shared/ui/CommonSection/CommonSection";
import {ReactComponent as CameraSvg} from '../../shared/assets/svg/Camea.svg'
import {ReactComponent as ArrowSvg} from '../../shared/assets/svg/Arrow.svg'
import {useFaceDetection} from "../../hooks/useFaceDetection";


interface CameraProps {
    setError: any,    // Признак, что лицо было обнаружено на видео

    setPhotoUrl: any, // Функция для установки URL снимка (состояние для изображения)
    setIsCameraOn: any
    isCameraOn: any
}

const CameraSection: React.FC<CameraProps> = ({
                                                  setPhotoUrl,
                                                  isCameraOn,
                                                  setIsCameraOn,
                                                  setError,
                                              }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const videoBorderRef = useRef<HTMLDivElement | null>(null); // Ссылка на элемент video, который будет показывать видео с камеры
    const videoRef = useRef<HTMLVideoElement | null>(null); // Ссылка на элемент video, который будет показывать видео с камеры
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    const streamRef = useRef<MediaStream | null>(null); // Ссылка на поток видео

    const {
        isFaceDetected,
    } = useFaceDetection(isCameraOn, videoRef, canvasRef, videoBorderRef)

    useEffect(() => {
        const startVideo = async () => {
            try {
                // Получаем доступ к камере
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user"}, // Фронтальная камера
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    // Привязываем поток
                    videoRef.current.srcObject = stream;

                    // Дополнительные события для диагностики
                    videoRef.current.addEventListener('loadeddata', () => {
                        console.log(`Данные видео загружены: ${new Date().toLocaleTimeString()}`);
                    }, { once: true });
                    videoRef.current.addEventListener('waiting', () => {
                        console.log(`Видео ожидает данные: ${new Date().toLocaleTimeString()}`);
                    });
                    videoRef.current.addEventListener('stalled', () => {
                        console.log(`Видео приостановлено: ${new Date().toLocaleTimeString()}`);
                    });
                    // Обрабатываем событие canplay для уверенности, что видео готово
                    videoRef.current.addEventListener('canplay', () => {
                        // Явно вызываем play для надёжности
                        if (videoRef.current){
                            videoRef.current.play()
                                .then(res=>{
                                    setIsLoaded(true);
                                    console.log(`Воспроизвели ${new Date().toLocaleTimeString()}`);

                                })
                                .catch(err => {
                                console.error(`Ошибка воспроизведения видео ${new Date().toLocaleTimeString()}:`, err);
                                setError("Не удалось воспроизвести видео");
                            });
                        }

                        console.log(`Видео готово к воспроизведению ${new Date().toLocaleTimeString()}`);

                    }, { once: true });

                    setPhotoUrl(null);
                    setError(null);
                } else {
                    console.warn("videoRef не готов");
                    setError("Ошибка инициализации видео");
                }
            } catch (err) {
                setError("Ошибка доступа к камере");
                console.error("Ошибка getUserMedia:", err);
            }
        };

        startVideo();

        // Очистка при размонтировании
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const takePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current; // Получаем ссылку на канвас
            const context = canvas.getContext("2d"); // Получаем контекст рисования канваса
            if (context) {
                // Устанавливаем размеры канваса, чтобы они соответствовали видео
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                // Рисуем изображение с видео на канвасе
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                // Устанавливаем фото как DataURL с форматом JPEG
                setPhotoUrl(canvas.toDataURL("image/jpeg"));
            } else {
                setPhotoUrl(null) // Если не удалось сделать снимок, сбрасываем URL
                if (streamRef.current) {

                    // Останавливаем все треки (видео и аудио), связанные с камерой
                    streamRef.current.getTracks().forEach((track: { stop: () => any; }) => track.stop());
                }
            }
        } else {
            setPhotoUrl(null) // Если не удалось сделать снимок, сбрасываем URL
            if (streamRef.current) {

                // Останавливаем все треки (видео и аудио), связанные с камерой
                streamRef.current.getTracks().forEach((track: { stop: () => any; }) => track.stop());
            }
        }

        setIsCameraOn(false);
    };
    return (
        <CommonSection
            max
        >
            <Section className={`video_box ${isLoaded ? '' : 'hide'}`}>

                <video
                    className="video_online"
                    ref={videoRef}
                    playsInline
                    webkit-playsinline="true"
                    muted
                    controls={false}
                    onLoadedMetadata={() => console.log(`onLoadedMetadata: ${new Date().toLocaleTimeString()}`)}
                    onPlay={() => console.log(`Video started playing at: ${new Date().toLocaleTimeString()}`)}
                    onPause={() => console.log(`Video paused at: ${new Date().toLocaleTimeString()}`)}
                    onEnded={() => console.log(`Video ended at: ${new Date().toLocaleTimeString()}`)}
                    onSeeking={() => console.log(`Video seeking started at: ${new Date().toLocaleTimeString()}`)}
                    onSeeked={() => console.log(`Video seeking finished at: ${new Date().toLocaleTimeString()}`)}
                    onTimeUpdate={() => console.log(`Video time updated at: ${new Date().toLocaleTimeString()}`)}
                    onError={() => console.log(`Video error occurred at: ${new Date().toLocaleTimeString()}`)}
                />
                <div ref={videoBorderRef} className="video_box__wrapper"/>
                <canvas
                    ref={canvasRef}
                    className={'canvas'}
                />
                {/* Оверлей для отображения информации о распознавании лица */}
                <div
                    className={`face_overlay ${isFaceDetected ? 'ok' : 'err'}`}

                />
            </Section>
            <Section max>
                <HStack max>
                    <Text
                        text={CAMERA_DESC}
                        type={'text'}
                        max
                    />
                </HStack>
            </Section>
            <Section
                clickable
                max
                onClick={takePhoto}
                disabled={!isFaceDetected}
            >
                <HStack gap={'10'} max>
                    <Svg Svg={CameraSvg}/>
                    <Text
                        text={TAKE_PHOTO}
                        type={'text'}
                        max
                    />
                    <Svg width={'12px'} height={'12px'} color={'subtitle'} Svg={ArrowSvg}/>
                </HStack>

            </Section>
        </CommonSection>
    );
};

export default CameraSection
