import React from "react";
import {Types} from "../../types/type";
import './Buttons.css'

interface ButtonsProps {
    isFetching: boolean; // Флаг загрузки: кнопки должны блокироваться во время выполнения запросов
    isFaceDetected: boolean; // Флаг распознавания лица: доступность кнопки "Сфотографировать"
    isCameraOn: boolean; // Флаг включения камеры: для отображения соответствующих кнопок


    onStop: () => void; // Обработчик нажатия на кнопку "Сфотографировать"
    onRestart: () => void; // Обработчик нажатия на кнопку "Переснять фото"
    onSend: () => void; // Обработчик нажатия на кнопку отправки

    error?: string | null; // Сообщение об ошибке: отображается под кнопками
    result?: string | null; // Результат выполнения действия: отображается под кнопками

    type?: Types; // Тип действия: регистрация или идентификация
}

export const Buttons: React.FC<ButtonsProps> = (props) => {
    const {
        isFetching,
        isFaceDetected,
        isCameraOn,


        onStop,
        onRestart,
        onSend,


        type,
    } = props

    // Если нет фото и камера выключена, отображается кнопка "Включить камеру"
/*    if (!photoUrl && !isCameraOn) {
        return (
            <div className="btn_box">
                <button
                    disabled={isFetching}
                    onClick={onStart}
                >
                    Включить камеру
                </button>
            </div>
        )
    }*/
    // Основной рендеринг кнопок в зависимости от состояния

    return (
        <div className="btn_box">
            {/* Если камера включена, показывается кнопка "Сфотографировать" */}
           {/* {isCameraOn && (
                <button
                    onClick={onStop}
                    disabled={!isFaceDetected}>
                    Сфотографировать
                </button>
            )}*/}
            {/* Если камера выключена, отображаются кнопки "Отправить" и "Переснять фото" */}

            {!isCameraOn && (
                <>
                    <button disabled={isFetching} onClick={onSend}>
                        {type === 'registration' && 'Зарегистрироваться'}
                        {type === 'identification' && 'Пройти фотоконтроль'}
                    </button>
                    <button disabled={isFetching} onClick={onRestart}>
                        Переснять фото
                    </button>
                </>
            )}
        </div>
    );
};
