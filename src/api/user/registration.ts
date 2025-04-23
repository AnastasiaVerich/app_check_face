import axios from 'axios';
import {InterfaceResponse, Telegram} from "../../types/type";

// Берем URL API из переменной окружения
const URL = process.env.REACT_APP_API_URL

// Определяем интерфейс для данных, которые мы добавляем в FormData
export interface FormDataRegistration {
    userPhone: string;
    userId: string;
    photo: Blob;
    isSavePhoto: '0' | '1';
}

// Тип, который перечисляет все возможные значения для поля text
type RegistrationResponseText =
    | "missing_photo"
    | "missing_user_id"
    | "missing_user_phone"
    | "user_exist_number"
    | "user_exist_id"
    | "face_not_found"
    | "user_exist_face"
    | "success"
    | "server_error";

// Интерфейс для ответа от сервера
type RegistrationResponse = InterfaceResponse<RegistrationResponseText>;

export const registration=(
    data: FormData,// Данные для регистрации
    setIsFetching: (val: boolean) => void, // Функция для управления состоянием загрузки
    setError: (error: string | null) => void,// Функция для отображения ошибок
) => {
    const tg: Telegram | undefined = 'Telegram' in window ? window.Telegram as Telegram : undefined;
    if (tg) {
        axios
            .post<RegistrationResponse>(`${URL}api/users/registration`, data)
            .then(res => {
                alert(res)
                // Завершаем загрузку
                setIsFetching(false);
                const result = res.data;

                // Обрабатываем ответ от сервера
                switch (result.status) {
                    case 0: // Пользователь существует
                    case 1: // Успешная регистрация
                        tg.WebApp.sendData(JSON.stringify(result));
                        break;

                    case 2: // Ошибки валидации или системная ошибка
                        setError('Попробуйте еще раз.'); // Устанавливаем текст ошибки для отображения
                        break;

                    default: // Непредвиденный статус
                        setError("Ошибка. Пожалуйста, попробуйте позже.");
                        console.warn("Unexpected response:", result);
                        break;
                }

            })
            .catch(err => {
                setIsFetching(false);// Завершаем загрузку
                setError("Ошибка. Пожалуйста, попробуйте позже."); // Показываем общее сообщение об ошибке

                tg.WebApp.sendData(JSON.stringify({result: 'server_error'}));

            })
    }
}
