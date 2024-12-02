import axios from 'axios';
import {DataFromTgType} from "../types/type";
const URL = process.env.REACT_APP_API_URL
const BOT_TOKEN = process.env.REACT_APP_BOT_TOKEN

const Telegram: any = 'Telegram' in window ? window.Telegram : undefined;

export const api = {

    registration(data:FormData,setIsFetch:any,setError:any,setRes:any){
        axios
            .post(`${URL}api/photos/find_user_by_photo`,data)
            .then(res=>{
                setIsFetch(false);
                const result = res.data;

                if (Telegram) {
                    if (result === "Совпадений не найдено.") {
                        Telegram.WebApp.sendData(JSON.stringify({ result: "new_face" }));
                        setRes("Совпадений не найдено!");
                    }
                    if (Array.isArray(result)) {
                        Telegram.WebApp.sendData(JSON.stringify({ result: "user_exist" }));
                        setRes("Найдено!");
                    }
                }

            })
            .catch(err=>{
                setIsFetch(false);

                if (axios.isAxiosError(err)) {
                    const errorMessage = err.response?.data?.error || "Произошла ошибка при отправке фото";
                    setError(errorMessage);
                } else {
                    setError("Неизвестная ошибка");
                }
            })
    },
  /*  send_photo_to_bot(data:FormData,setIsFetch:any,setError:any,setRes:any){
        axios
            .post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,data)
            .then(res=>{
                setIsFetch(false);
                if(res.data.ok){
                    setRes('Медиа успешно отправлено!');
                } else {
                    setError('Ошибка при отправке медиа: ' + res.data.description);
                }

               /!* if (Telegram) {
                    if (result === "Совпадений не найдено.") {
                        Telegram.WebApp.sendData(JSON.stringify({ result: "new_face" }));
                        setRes("Совпадений не найдено!");
                    }
                    if (Array.isArray(result)) {
                        Telegram.WebApp.sendData(JSON.stringify({ result: "user_exist" }));
                        setRes("Найдено!");
                    }
                }*!/

            })
            .catch(err=>{
                setIsFetch(false);

                if (axios.isAxiosError(err)) {
                    const errorMessage = err.response?.data?.error || "Произошла ошибка при отправке фото";
                    setError(errorMessage);
                } else {
                    setError("Неизвестная ошибка");
                }
            })
    },*/
}
