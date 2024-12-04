import axios from 'axios';

const URL = process.env.REACT_APP_API_URL


export const api = {

    registration(data: FormData, setIsFetching: any, setError: any, setRes: any) {
        const tg: any = 'Telegram' in window ? window.Telegram : undefined;

        axios
            .post(`${URL}api/users/registration`, data)
            .then(res => {
                setIsFetching(false);
                const result = res.data;


                if (result.status === 0) {
                    tg.WebApp.sendData(JSON.stringify({result: result.text}));
                } else if (result.status === 1) {
                    tg.WebApp.sendData(JSON.stringify({result: result.text}));
                } else if (result.status === 2) {
                    setError(result.text);
                }


            })
            .catch(err => {
                setIsFetching(false);
                tg.WebApp.sendData(JSON.stringify({result: 'server_error'}));

            })
    },
    identification(data: FormData, setIsFetching: any, setError: any, setRes: any) {

        const tg: any = 'Telegram' in window ? window.Telegram : undefined;

        axios
            .post(`${URL}api/embeddings/identification`, data)
            .then(res => {
                setIsFetching(false);
                const result = res.data;

                if (result.status === 0) {
                    tg.WebApp.sendData(JSON.stringify({result: result.text}));
                } else if (result.status === 1) {
                    tg.WebApp.sendData(JSON.stringify({result: result.text}));
                } else if (result.status === 2) {
                    setError(result.text);
                }

            })
            .catch(err => {
                setIsFetching(false);
                tg.WebApp.sendData(JSON.stringify({result: 'server_error'}));
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
