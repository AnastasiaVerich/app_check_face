import React, {useState} from "react";
import './PhotoSendSection.css'
import {Button} from "../../shared/ui/Button/Button";
import {REMAKE_PHOTO, SEND} from "../../types/const";
import {VStack} from "../../shared/ui/VStack/VStack";
import {base64ToBlob} from "../../utils/photoUtils";
import {FormDataRegistration, registration} from "../../api/user/registration";
import {FormDataCheckExist, identification} from "../../api/user/identification";

interface ImgProps {
    photoUrl: string | null;
    setIsCameraOn:any,
    params:any,
    setError:any,
}

const PhotoSendSection: React.FC<ImgProps> = ({photoUrl,
                                                  setIsCameraOn,
                                                  params,
                                                  setError,
                                              }) => {

    const [isFetching, setIsFetching] = useState(false); // Флаг состояния загрузки

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

    if (!photoUrl) {
        return <></>
    }
    return (
        <VStack
            max
            gap={'15'}
        >
        <div
            className={`img_box`}
        >
            <img
                className="img"
                src={photoUrl ?? ''}
                alt="Сделанное фото"
            />
        </div>
            <Button
                width={'calc(100% - 20px)'}
                onClick={()=>setIsCameraOn(true)}
                text={REMAKE_PHOTO}
                disabled={isFetching}
            />
            <Button
                width={'calc(100% - 20px)'}
                onClick={handleSendPhoto}
                text={SEND}
                disabled={isFetching}
            />


        </VStack>
    );
};
export default PhotoSendSection
