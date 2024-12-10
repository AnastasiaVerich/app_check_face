export type  Types = 'registration' | 'identification'

type ParamsRegistration = {
    userPhone: string,
    userId: string,
    isSavePhoto: '0'| '1',
    type: Types
}

export type ParamsType = ParamsRegistration | null

export interface Telegram {
    WebApp: {
        sendData: (data: string) => void;
        ready: () => void;
        expand: () => void;
        themeParams: {
            bg_color?: string;
        };
    };
}

export interface InterfaceResponse<T> {
    status: 0 | 1 | 2; // Статус выполнения запроса
    text: T; // Сообщение, которое передается в ответе
    [key: string]: any; // Дополнительные данные, которые могут быть в ответе
}
// 400 не верные параметры запроса пришли
// 200 ок
// 500 ошибка
