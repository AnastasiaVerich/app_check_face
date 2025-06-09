import React, {useEffect, useState} from "react";
import './App.css'
import '../../styles/variables.css'
import {ParamsType, Telegram} from "../../types/type";
import {VStack} from "../../shared/ui/VStack/VStack";
import {PhotoAsync} from "../Photo/Photo.async";
import {GeolocationAsync} from "../Geolocation/Geolocation.async";
import Photo from "../Photo/Photo";


function App() {

    const [params, setParams] = useState<ParamsType>({
        type:'registration',
        isSavePhoto:'1', userId: "", userPhone: ""

    }); // Параметры приложения

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


    return (
        <VStack className="app">
            {
                (params?.type === 'registration' || params?.type === 'identification')
                && <Photo
                    {...params}
                />
            }
            {
                (params?.type === 'geolocation')
                && <GeolocationAsync
                    {...params}
                />
            }

        </VStack>
    );
}

export default App;
