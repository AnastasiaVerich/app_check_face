import React, {useState} from "react";
import {GEOLOCATION, PLEASE_SEND_GEOLOCATION, SEND_GEOLOCATION, SEND_GEOLOCATION_BTN} from "../../types/const";
import {VStack} from "../../shared/ui/VStack/VStack";
import {ReactComponent as GeolocationSvg} from '../../shared/assets/svg/Geolocation.svg'
import {ReactComponent as ArrowSvg} from '../../shared/assets/svg/Arrow.svg'
import {CommonSection} from "../../shared/ui/CommonSection/CommonSection";
import {Section} from "../../shared/ui/Section/Section";
import {Text} from "../../shared/ui/Text/Text";
import {HStack} from "../../shared/ui/HStack/HStack";
import {Svg} from "../../shared/ui/Svg/Svg";
import {ParamsType} from "../../types/type";


const Geolocation: React.FC<ParamsType> = (params) => {
    const [error, setError] = useState<string | null>(null);

    function onGetGeolocation() {
        const tg: any = 'Telegram' in window ? window.Telegram : undefined;

        setError(null)
        if ("geolocation" in navigator) {
            console.log(1)
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;

                    if (tg) {
                        tg.WebApp.sendData(JSON.stringify({latitude, longitude}));
                    }
                },
                (error) => {
                    console.log(error)
                    setError("У вас отключен доступ к геолокации на устройстве")
                }
            );
        } else {
            setError("Геолокация не поддерживается");
        }
    }

    return (
        <>
            <CommonSection
                max
            >
                <Section>
                    <Text
                        text={GEOLOCATION}
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
                            src="https://data.chpic.su/stickers/u/UtyaDuck/UtyaDuck_027.tgs"
                            id="tgsPlayer__main__UtyaDuck"
                        >

                        </tgs-player>
                        <Text
                            text={SEND_GEOLOCATION}
                            type={'text'}
                            align={'center'}
                            size={'l'}
                            max
                        />
                        <Text
                            text={PLEASE_SEND_GEOLOCATION}
                            type={'text'}
                            align={'center'}
                            max
                        />

                    </VStack>
                </Section>

                 <Section clickable max onClick={onGetGeolocation}>
                    <HStack gap={'10'} max>
                        <Svg Svg={GeolocationSvg}/>
                        <Text
                            text={SEND_GEOLOCATION_BTN}
                            type={'text'}
                            max
                        />
                        <Svg width={'12px'} height={'12px'} color={'subtitle'} Svg={ArrowSvg}/>
                    </HStack>
                </Section>

            </CommonSection>
            { error
                && <Section clickable max onClick={onGetGeolocation}>
                    <HStack gap={'10'} max>
                        <Text
                            text={error}
                            type={'hint'}
                            align={'start'}
                            max
                        />
                    </HStack>

                </Section>}

        </>
    )

};
export default Geolocation
