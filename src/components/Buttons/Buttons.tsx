import React from "react";
import {Types} from "../../types/type";

interface ButtonsProps {
    isFetching: boolean;
    onSend: () => void;
    photoUrl: string | null;
    onRestart: () => void;
    error?: string | null;
    result?: string | null;
    type?: Types;
}

export const Buttons: React.FC<ButtonsProps> = ({
                                                    isFetching,
                                                    onSend,
                                                    onRestart,
                                                    photoUrl,
                                                    error,
                                                    result,
                                                    type,
                                                }) => {
    if (!photoUrl) {
        return (<button disabled={isFetching} onClick={onRestart}>
            Включить камеру
        </button>)
    }
    return (
        <div className="btn_box">
            <button disabled={isFetching} onClick={onSend}>
                {type === 'registration'&& 'Зарегистрироваться'}
                {type === 'verification'&&'Пройти проверку'}
            </button>
            <button disabled={isFetching} onClick={onRestart}>
                Переснять фото
            </button>
            {error && <div className="response" style={{color: "red"}}>{error}</div>}
            {result && <div className="response" style={{color: "green"}}>{result}</div>}
        </div>
    );
};
