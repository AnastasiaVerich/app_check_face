import React from "react";
import {Types} from "../../types/type";
import './Buttons.css'

interface ButtonsProps {
    isFetching: boolean;
    isFaceDetected: boolean;
    isCameraOn: boolean;

    photoUrl: string | null;

    onStart: () => void;
    onStop: () => void;
    onRestart: () => void;
    onSend: () => void;

    error?: string | null;
    result?: string | null;

    type?: Types;
}

export const Buttons: React.FC<ButtonsProps> = (props) => {
    const {
        isFetching,
        isFaceDetected,
        isCameraOn,

        photoUrl,

        onStart,
        onStop,
        onRestart,
        onSend,

        error,
        result,

        type,
    } = props

    if (!photoUrl && !isCameraOn) {
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
    }
    return (
        <div className="btn_box">
            {isCameraOn && (
                <button
                    onClick={onStop}
                    disabled={!isFaceDetected}>
                    Сфотографировать
                </button>
            )}
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
            {error && <div className="error">{error}</div>}
            {result && <div className="response">{result}</div>}
        </div>
    );
};
