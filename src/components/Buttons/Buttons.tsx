import React from "react";

interface ButtonsProps {
    isFetching: boolean;
    onSend: () => void;
    photoUrl: string | null;
    onRestart: () => void;
    error?: string | null;
    result?: string | null;
}

export const Buttons: React.FC<ButtonsProps> = ({
                                                    isFetching,
                                                    onSend,
                                                    onRestart,
                                                    photoUrl,
                                                    error,
                                                    result,
                                                }) => {
    if (!photoUrl) {
        return (<button disabled={isFetching} onClick={onRestart}>
            Включить камеру
        </button>)
    }
    return (
        <div className="btn_box">
            <button disabled={isFetching} onClick={onSend}>
                Отправить
            </button>
            <button disabled={isFetching} onClick={onRestart}>
                Переснять фото
            </button>
            {error && <div className="response" style={{color: "red"}}>{error}</div>}
            {result && <div className="response" style={{color: "green"}}>{result}</div>}
        </div>
    );
};
