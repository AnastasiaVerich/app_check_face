import React, {useEffect, useRef, useState} from "react";
import {base64ToBlob} from "../../utils/photoUtils";
import {Camera} from "../Camera/Camera";
import './App.css'
import '../../styles/variables.css'
import {Img} from "../Img/Img";
import {ParamsType, Telegram} from "../../types/type";
import {useCamera} from "../../hooks/useCamera";
import {useFaceDetection} from "../../hooks/useFaceDetection";
import {FormDataRegistration, registration} from "../../api/user/registration";
import {FormDataCheckExist, identification} from "../../api/user/identification";
import {Text} from "../../shared/ui/Text/Text";
import {
    CAMERA_DESC,
    IDENTIFICATION,
    IS_CAMERA_OFF,
    ON_CAMERA,
    PLEASE_ON_CAMERA,
    REMAKE_PHOTO,
    SEND,
    TAKE_PHOTO
} from "../../types/const";
import {Section} from "../../shared/ui/Section/Section";
import {Svg} from "../../shared/ui/Svg/Svg";
import {ReactComponent as CameraSvg} from '../../shared/assets/svg/Camea.svg'
import {ReactComponent as ArrowSvg} from '../../shared/assets/svg/Arrow.svg'
import {HStack} from "../../shared/ui/HStack/HStack";
import {CommonSection} from "../../shared/ui/CommonSection/CommonSection";
import {VStack} from "../../shared/ui/VStack/VStack";
import {Button} from "../../shared/ui/Button/Button";


function App() {

    const videoRef = useRef<HTMLVideoElement | null>(null); // Ссылка на элемент video, который будет показывать видео с камеры
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    const streamRef = useRef<MediaStream | null>(null); // Ссылка на поток видео
    const [isFetching, setIsFetching] = useState(false); // Флаг состояния загрузки
    const [params, setParams] = useState<ParamsType>(null); // Параметры приложения
    const [photoUrl, setPhotoUrl] = useState<string | null>(null); // URL фото
    const [error, setError] = useState<string | null>(null);// Сообщение об ошибке

    const {
        isCameraOn,
        startCamera,
        stopCamera,
    } = useCamera(setPhotoUrl, setError, videoRef, canvasRef, streamRef)

    const {
        isFaceDetected,
    } = useFaceDetection(isCameraOn, videoRef, canvasRef)

    useEffect(() => {

        // Получаем параметры из URL
        const urlParams = new URLSearchParams(window.location.search);
        const data = JSON.parse(decodeURIComponent(urlParams?.get('data') ?? '{}'));
        setParams(data)

        // Синхронизация стилей из Telegram WebApp
        const tg: Telegram | undefined = 'Telegram' in window ? window.Telegram as Telegram : undefined;

        tg?.WebApp.ready(); // Уведомляем Telegram, что приложение готово
        tg?.WebApp.expand(); // Разворачиваем приложение


    }, [])

    const handleSendPhoto = () => {
        const tg: any = 'Telegram' in window ? window.Telegram : undefined;
        if (params?.type === 'registration') {
            // Логика для регистрации
            if (tg) {


                if (!photoUrl) {
                    setError("Фото не сделано! Попробуйте снова.");
                    return;
                }

                const blob = base64ToBlob(photoUrl, "image/jpeg");

                // Создаем formData для отправки медиа
                const formData = new FormData();

                const data: FormDataRegistration = {
                    userPhone: params?.userPhone ?? '',
                    userId: params?.userId ?? '',
                    isSavePhoto: params?.isSavePhoto ?? '0',
                    photo: blob
                }

                formData.append('userPhone', data.userPhone);
                formData.append('userId', data.userId);
                formData.append('photo', data.photo);
                formData.append('isSavePhoto', data.isSavePhoto);

                setIsFetching(true)

                registration(
                    formData,
                    setIsFetching,
                    setError,
                )
            } else {

                setError("Приложение было открыто НЕ в Телеграмме");
            }
        } else if (params?.type === 'identification') {
            // Логика для идентификации
            if (tg) {

                if (!photoUrl) {
                    setError("Фото не сделано! Попробуйте снова.");
                    return;
                }

                const blob = base64ToBlob(photoUrl, "image/jpeg");

                const formData = new FormData();

                const data: FormDataCheckExist = {
                    userId: params?.userId ?? '',
                    photo: blob
                }

                formData.append('userId', data.userId);
                formData.append('photo', data.photo);

                setIsFetching(true)

                identification(
                    formData,
                    setIsFetching,
                    setError,
                )
            } else {
                setError("Приложение было открыто НЕ в Телеграмме");
            }
        }
    };

    return (
        <VStack className="app">


            <CommonSection
                max
                isHide={!(!photoUrl && !isCameraOn)}
            >
                <Section >
                    <Text
                        text={IDENTIFICATION}
                        type={'hint'}
                        align={'start'}
                        max
                    />
                    <VStack
                        gap={'15'}
                        style={{padding: '56px 78px'}}
                    >
                        <tgs-player
                            style={{
                                width: '130px',
                                height: '130px'
                            }}
                            width={'200px'}
                            autoplay={true}
                            loop={true}
                            mode="normal"
                            src="https://data.chpic.su/stickers/u/UtyaDuck/UtyaDuck_005.tgs"
                            id="tgsPlayer__main__UtyaDuck"
                        >

                        </tgs-player>
                        <Text
                            text={IS_CAMERA_OFF}
                            type={'text'}
                            align={'center'}
                            size={'l'}
                            max
                        />
                        <Text
                            text={PLEASE_ON_CAMERA}
                            type={'text'}
                            align={'center'}
                            max
                        />

                    </VStack>
                </Section>

                <Section clickable max onClick={startCamera}>
                    <HStack gap={'10'} max>
                        <Svg Svg={CameraSvg}/>
                        <Text
                            text={ON_CAMERA+20}
                            type={'text'}
                            max
                        />
                        <Svg width={'12px'} height={'12px'} color={'subtitle'} Svg={ArrowSvg}/>
                    </HStack>

                </Section>

            </CommonSection>


            <CommonSection
                max
                isHide={!isCameraOn}
            >
                <Camera
                    isFaceDetected={isFaceDetected}
                    videoRef={videoRef}
                    isShow={isCameraOn}
                    canvasRef={canvasRef}
                />
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
                    onClick={stopCamera}
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


            {photoUrl && (
                <VStack
                    max
                    gap={'15'}
                >

                    <Img
                        photoUrl={photoUrl}
                    />


                    <Button
                        width={'calc(100% - 20px)'}
                        onClick={startCamera}
                        text={REMAKE_PHOTO}
                        disabled={isFetching}
                    />
                    <Button
                        width={'calc(100% - 20px)'}
                        onClick={handleSendPhoto}
                        text={SEND}
                        disabled={isFetching}
                    />


                </VStack>)

            }

            <canvas ref={canvasRef} style={{display: "none"}}/>
        </VStack>
    );
}

export default App;
