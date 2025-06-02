import React, {useEffect, useState} from "react";
import './App.css'
import '../../styles/variables.css'
import {ParamsType, Telegram} from "../../types/type";
import {Text} from "../../shared/ui/Text/Text";
import {IDENTIFICATION, IS_CAMERA_OFF, ON_CAMERA, PLEASE_ON_CAMERA, SEND_GEOLOCATION} from "../../types/const";
import {Section} from "../../shared/ui/Section/Section";
import {Svg} from "../../shared/ui/Svg/Svg";
import {ReactComponent as CameraSvg} from '../../shared/assets/svg/Camea.svg'
import {ReactComponent as GeolocationSvg} from '../../shared/assets/svg/Geolocation.svg'
import {ReactComponent as ArrowSvg} from '../../shared/assets/svg/Arrow.svg'
import {HStack} from "../../shared/ui/HStack/HStack";
import {CommonSection} from "../../shared/ui/CommonSection/CommonSection";
import {VStack} from "../../shared/ui/VStack/VStack";
import CameraSection from "../CameraSection/CameraSection";
import PhotoSendSection from "../PhotoSendSection/PhotoSendSection";


function App() {

    const [location, setLocation] = useState<string | null>(null);
    const [params, setParams] = useState<ParamsType>(null); // Параметры приложения
    const [photoUrl, setPhotoUrl] = useState<string | null>(null); // URL фото
    const [error, setError] = useState<string | null>(null);// Сообщение об ошибке
    const [isCameraOn, setIsCameraOn] = useState(false);// Состояние, показывающее включена ли камера

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

    function onGetGeolocation() {

        if ("geolocation" in navigator) {

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;

                    setLocation(JSON.stringify({latitude, longitude}))
                },
                (error) => {
                    console.log("Ошибка: " + error.message)
                }
            );
        } else {
            console.log("Геолокация не поддерживается");
        }
    }

    return (
        <VStack className="app">

            <CommonSection
                max
                isHide={!(!photoUrl && !isCameraOn)}
            >
                <Section>
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

                <Section clickable max onClick={() => setIsCameraOn(true)}>
                    <HStack gap={'10'} max>
                        <Svg Svg={CameraSvg}/>
                        <Text
                            text={ON_CAMERA}
                            type={'text'}
                            max
                        />
                        <Svg width={'12px'} height={'12px'} color={'subtitle'} Svg={ArrowSvg}/>
                    </HStack>

                </Section>
                <Section clickable max onClick={onGetGeolocation}>
                    <HStack gap={'10'} max>
                        <Svg Svg={GeolocationSvg}/>
                        <Text
                            text={SEND_GEOLOCATION}
                            type={'text'}
                            max
                        />
                        <Svg width={'12px'} height={'12px'} color={'subtitle'} Svg={ArrowSvg}/>
                    </HStack>

                </Section>

            </CommonSection>
            {location && <Section clickable max onClick={onGetGeolocation}>
                <HStack gap={'10'} max>
                    <Text
                        text={location}
                        type={'hint'}
                        align={'start'}
                        max
                    />
                </HStack>

            </Section>}


            {isCameraOn &&
                /* <Suspense fallback={<CommonSection max>
                     <Skeleton
                         width="100%"
                         height={`calc(var(--tg-viewport-height) / 2 )`}
                     />
                 </CommonSection>}>*/
                <CameraSection
                    setError={setError}
                    setPhotoUrl={setPhotoUrl}
                    setIsCameraOn={setIsCameraOn}
                    isCameraOn={isCameraOn}
                />
                /* </Suspense>*/

            }
            {!isCameraOn && photoUrl && (
                /*   <Suspense fallback={<CommonSection max>
                       <Skeleton
                           width="100%"
                           height={`calc(var(--tg-viewport-height) / 2 )`}
                       />
                       <Skeleton
                           width="100%"
                           height={`60px`}
                       />
                       <Skeleton
                           width="100%"
                           height={`65px`}
                       />
                   </CommonSection>}>*/
                <PhotoSendSection
                    photoUrl={photoUrl}
                    params={params}
                    setIsCameraOn={setIsCameraOn}
                    setError={setError}
                />
                /*</Suspense>*/

            )

            }


        </VStack>
    );
}

export default App;
