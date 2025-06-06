import React, {useState} from "react";
import {IDENTIFICATION, IS_CAMERA_OFF, ON_CAMERA, PLEASE_ON_CAMERA} from "../../types/const";
import {VStack} from "../../shared/ui/VStack/VStack";
import {ReactComponent as CameraSvg} from '../../shared/assets/svg/Camea.svg'
import {ReactComponent as ArrowSvg} from '../../shared/assets/svg/Arrow.svg'
import {CommonSection} from "../../shared/ui/CommonSection/CommonSection";
import {Section} from "../../shared/ui/Section/Section";
import {Text} from "../../shared/ui/Text/Text";
import {HStack} from "../../shared/ui/HStack/HStack";
import {Svg} from "../../shared/ui/Svg/Svg";
import CameraSection from "../CameraSection/CameraSection";
import PhotoSendSection from "../PhotoSendSection/PhotoSendSection";
import {ParamsType} from "../../types/type";


const Photo: React.FC<ParamsType> = (params) => {

    const [photoUrl, setPhotoUrl] = useState<string | null>(null); // URL фото
    const [log, setLog] = useState<string | null>(null);// Сообщение об ошибке
    const [isCameraOn, setIsCameraOn] = useState(false);// Состояние, показывающее включена ли камера


    return (
        <>
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

            </CommonSection>

            {isCameraOn &&
                <CameraSection
                    log={log}
                    setLog={setLog}
                    setPhotoUrl={setPhotoUrl}
                    setIsCameraOn={setIsCameraOn}
                    isCameraOn={isCameraOn}
                />

            }
            {!isCameraOn && photoUrl && (
                <PhotoSendSection
                    photoUrl={photoUrl}
                    params={params}
                    setIsCameraOn={setIsCameraOn}
                    setError={setLog}
                />

            )

            }
        </>
    )

};
export default Photo
