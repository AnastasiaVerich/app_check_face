import axios from 'axios';
import {InterfaceResponse, Telegram} from "../../types/type";

// Берем URL API из переменной окружения
const URL = process.env.REACT_APP_API_URL

// Определяем интерфейс для данных, которые мы добавляем в FormData
export interface FormDataCheckExist {
    userId: string;
    photo: Blob
}

// Тип, который перечисляет все возможные значения для поля text
type IdentificationResponseText =
    | "missing_photo"  // Ошибка: нет фото
    | "missing_user_id"  // Ошибка: нет userId
    | "face_not_found"  // Ошибка: лицо не найдено на изображении
    | "embedding_not_found"  // Ошибка: эмбеддинг не найден в базе
    | "similarity_not_confirmed"  // Ошибка: сходство не подтверждено
    | "success"  // Успех: верификация прошла успешно
    | "server_error";  // Ошибка сервера

// Интерфейс для ответа от сервера
type IdentificationResponse = InterfaceResponse<IdentificationResponseText>;

export const identification = (
    data: FormData,// Данные для идентификации
    setIsFetching: (val: boolean) => void, // Функция для управления состоянием загрузки
    setError: (error: string | null) => void,// Функция для отображения ошибок
) => {
    const tg: Telegram | undefined = 'Telegram' in window ? window.Telegram as Telegram : undefined;
    if (tg) {
        axios
            .post<IdentificationResponse>(`${URL}api/embeddings/identification`, data)
            .then(res => {
                // Завершаем загрузку
                setIsFetching(false);
                const result = res.data;

                // Обрабатываем ответ от сервера
                // Обрабатываем ответ от сервера
                switch (result.status) {
                    case 0: // Эмбеддинг для пользователя не найден в базе ИЛИ найден, но не совпал
                    case 1: // Успешно пройдена
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

                let response: IdentificationResponse
                // Проверяем, есть ли ответ от сервера
                if (err.response) {
                    response = err.response.data as IdentificationResponse;
                    tg.WebApp.sendData(JSON.stringify(response)); // Отправляем данные из ответа
                } else {
                    // Общая ошибка (например, сеть недоступна)
                    response = {status: 2, text: "server_error"}
                    tg.WebApp.sendData(JSON.stringify(response));
                }
            })
    }
}
