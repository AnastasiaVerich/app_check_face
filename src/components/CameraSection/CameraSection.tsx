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
        isFaceDetected, modelsLoaded, isLivenessVerified, blinkCount, blinkPrompt
    } = useFaceDetection({isCameraOn, videoRef, canvasRef, videoBorderRef})

    const handleVideoLoaded = () => {
        setTimeout(() => {
            setIsLoaded(true);
        }, 0)

    };

    useEffect(() => {
        const startVideo = async () => {
            try {
                // Получаем доступ к камере с использованием API getUserMedia
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {facingMode: "user"}, // Запрашиваем видео с камеры пользователя (фронтальная)
                });
                streamRef.current = stream; // Сохраняем поток для управления (для остановки камеры)
                if (videoRef.current) videoRef.current.srcObject = stream;// Отображаем поток в элементе video
                setPhotoUrl(null); // Обнуляем URL снимка (если камера включена, не показываем старое фото)
                setError(null); // Очищаем ошибку, если она была
            } catch (err) {
                // Если не удалось получить доступ к камере, выводим ошибку
                setError("Ошибка доступа к камере");
                console.error(err);
            }
        }
        startVideo()
    }, [])

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
                    autoPlay
                    muted
                    controls={false}
                    onLoadedMetadata={handleVideoLoaded}
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
                        text={blinkPrompt ? 'Пожалуйста, моргните дважды в течение 5 секунд.':''}
                        type={'text'}
                        max
                    />
                    <Text
                        text={isLivenessVerified ? 'Проверка живости пройдена!.':''}
                        type={'text'}
                        max
                    />
                    <Text
                        text={!blinkPrompt && !isLivenessVerified ? 'Проверка не пройдена. Попробуйте снова':''}
                        type={'text'}
                        max
                    />
                </HStack>
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
