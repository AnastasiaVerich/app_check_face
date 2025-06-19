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
import {StatusBar} from "../../shared/ui/StatusBar/StatusBar";
import {useFaceDetection2} from "../../hooks/useFaceDetection2";
import {VStack} from "../../shared/ui/VStack/VStack";
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
        detectionStart,
        humanLoaded,
        humanInstance,
        selectedBackend,
        valuesFaceId
    } = useFaceDetection(isCameraOn, videoRef, canvasRef, videoBorderRef,isLoaded)

    useEffect(() => {
        const startVideo = async () => {
            try {

                // Получаем доступ к камере
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {facingMode: "user"}, // Фронтальная камера
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    // Привязываем поток
                    videoRef.current.srcObject = stream;

                    // Обрабатываем событие canplay для уверенности, что видео готово
                    videoRef.current.addEventListener('canplay', () => {
                        // Явно вызываем play для надёжности
                        if (videoRef.current) {
                            videoRef.current.play()
                                .catch(err => {
                                    console.error(`Ошибка воспроизведения видео ${new Date().toLocaleTimeString()}:`, err);
                                    setError("Не удалось воспроизвести видео");
                                });
                        }

                    }, {once: true});

                    videoRef.current.addEventListener('timeupdate', () => {
                        setIsLoaded(true);
                    }, {once: true});
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

    const isFaceIdOk = Object.values(valuesFaceId).filter(e=>e === false).length >0?false:true

    return (
        <CommonSection
            max
        >
            <Section className={`video_box`}>

                <video
                    className={`video_online ${detectionStart ? '' : 'hide'}`}
                    ref={videoRef}
                    playsInline
                    webkit-playsinline="true"
                    muted
                    controls={false}
                />
                <div ref={videoBorderRef} className="video_box__wrapper"/>
                <canvas
                    ref={canvasRef}
                    className={'canvas'}
                />
                {/* Оверлей для отображения информации о распознавании лица */}
                <div
                    className={`face_overlay ${isFaceIdOk ? 'ok' : 'err'} ${detectionStart ? 'detection_start' : 'detection_loaded'}`}

                />
                <VStack className={'face_id_status_bar'} gap={'5'}>
                    {/*<StatusBar isActive={valuesFaceId.blinkDetected || false}/>*/}
                    {/*<StatusBar isActive={valuesFaceId.antispoofCheck || false}/>*/}
                    <StatusBar isActive={valuesFaceId.livenessCheck || false}/>
                    <StatusBar isActive={valuesFaceId.faceConfidence || false}/>
                    <StatusBar isActive={valuesFaceId.faceSize || false}/>
                    <StatusBar isActive={valuesFaceId.distance || false}/>
                    <StatusBar isActive={valuesFaceId.faceInCenter || false}/>
                </VStack>
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
                disabled={!isFaceIdOk}
            >
                <HStack gap={'10'} max>
                    <Svg Svg={CameraSvg} color={isFaceIdOk?'accent':'subtitle'}/>
                    <Text
                        text={TAKE_PHOTO}
                        type={'text'}
                        max
                    />
                    <Svg width={'12px'} height={'12px'} color={'subtitle'} Svg={ArrowSvg}/>
                </HStack>


            </Section>


             <Section
                max
            >
                <HStack gap={'5'} max>
                   <StatusBar isActive={humanLoaded}/>
                   <StatusBar isActive={isCameraOn}/>
                   <StatusBar isActive={isLoaded}/>
                   <StatusBar isActive={Boolean(videoRef.current)}/>
                   <StatusBar isActive={Boolean(canvasRef.current)}/>
                   <StatusBar isActive={Boolean(videoBorderRef.current)}/>
                   <StatusBar isActive={Boolean(humanInstance)}/>
                   <StatusBar isActive={selectedBackend === 'webgl'}/>
                </HStack>

            </Section>
        </CommonSection>
    );
};

export default CameraSection
