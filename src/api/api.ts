import axios from 'axios';

const URL = process.env.REACT_APP_API_URL


export const api = {

    registration(data: FormData, setIsFetch: any, setError: any, setRes: any) {
        const tg: any = 'Telegram' in window ? window.Telegram : undefined;

        axios
            .post(`${URL}api/users/registration`, data)
            .then(res => {
                setIsFetch(false);
                const result = res.data;


                if (result.status === 2) {
                    setError(result.text);
                }
                if (result.status === 0) {
                    setError(result.text);
                    tg.WebApp.sendData(JSON.stringify({result: "user_exist"}));
                }

                if (result.status === 1) {
                    setError(result.text);
                    tg.WebApp.sendData(JSON.stringify({result: "new_face"}));
                }


            })
            .catch(err => {
                setIsFetch(false);

                const errorMessage = "Произошла ошибка при отправке фото";
                setError(errorMessage);

            })
    },
    verification(data: FormData, setIsFetch: any, setError: any, setRes: any) {

        const tg: any = 'Telegram' in window ? window.Telegram : undefined;

        axios
            .post(`${URL}api/embeddings/verification`, data)
            .then(res => {
                setIsFetch(false);
                const result = res.data;


                if (result.status === 2) {
                    setError(result.text);
                }
                if (result.status === 0) {
                    setError(result.text);
                    tg.WebApp.sendData(JSON.stringify({result: "different_face"}));
                }

                if (result.status === 3) {
                    setError(result.text);
                    tg.WebApp.sendData(JSON.stringify({result: "none_face_db"}));
                }

                if (result.status === 1) {
                    setError(result.text);
                    tg.WebApp.sendData(JSON.stringify({result: "similar_face"}));
                }

            })
            .catch(err => {
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
