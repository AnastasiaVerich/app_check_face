import React, {useRef, useState} from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Функция для начала верификации
  const startVerification = async () => {
    try {
      // Получаем поток с камеры
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' } // Предпочтительно передняя камера
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Запускаем запись видео
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Ошибка доступа к камере:', err);
    }
  };

  // Функция для остановки верификации
  const stopVerification = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Сделать фото (сохранить кадр с видео)
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const photoUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhotoUrl(photoUrl);
      }
    }

    setIsRecording(false);
  };

  return (
      <div>
        <h1>Верификация камеры</h1>
        {!isRecording ? (
            <button onClick={startVerification}>Начать верификацию</button>
        ) : (
            <button onClick={stopVerification}>Остановить</button>
        )}

        <div>
          {/* Видео с камеры */}
          <video ref={videoRef} autoPlay muted style={{ width: '100%', marginTop: '20px' }} />

          {/* Для сохранения снимка */}
          {photoUrl && (
              <div>
                <h3>Фото:</h3>
                <img src={photoUrl} alt="Фото верификации" style={{ width: '200px', marginTop: '20px' }} />
              </div>
          )}

          {/* Для сохранения видео */}
          {videoUrl && (
              <div>
                <h3>Видео:</h3>
                <video controls src={videoUrl} style={{ width: '100%', marginTop: '20px' }} />
              </div>
          )}
        </div>

        {/* Скрытый канвас для рисования фото */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
  );
};

export default App;
