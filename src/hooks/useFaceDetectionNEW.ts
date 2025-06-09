import * as H from '@vladmandic/human';
import { useEffect, useRef, useState } from 'react';

const humanConfig:any = {
    cacheSensitivity: 0.01,
    modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models/",
    filter: { enabled: true, equalization: true },
    debug: true,
    face: {
        enabled: true,
        detector: { rotation: true, return: true, mask: false },
        description: { enabled: true },
        iris: { enabled: true },
        emotion: { enabled: false },
        antispoof: { enabled: true },
        liveness: { enabled: true },
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: true },
};

const matchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 };

const options = {
    minConfidence: 0.6,
    minSize: 224,
    maxTime: 30000,
    blinkMin: 10,
    blinkMax: 800,
    threshold: 0.5,
    distanceMin: 0.4,
    distanceMax: 1.0,
    mask: humanConfig.face.detector.mask,
    rotation: humanConfig.face.detector.rotation,
    ...matchOptions,
};

export const useFaceDetectionNew = (
    isCameraOn: boolean, // Пропс, который говорит, включена ли камера
    videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
    canvasRef: React.RefObject<HTMLCanvasElement>, // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
    videoBorderRef: React.RefObject<HTMLDivElement>,
    isLoaded: boolean,
    setLog: any
) => {

    const [isFaceDetected, setIsFaceDetected] = useState(false);// Состояние для отслеживания, было ли найдено лицо

    const [detectionStart, setDetectionStart] = useState(false);

    const human = useRef<any>(new H.Human(humanConfig));
    const logRef = useRef<any>(null);
    const fpsRef = useRef<any>(null);
    const matchRef = useRef<any>(null);
    const nameRef = useRef<any>(null);
    const saveRef = useRef<any>(null);
    const deleteRef = useRef<any>(null);
    const retryRef = useRef<any>(null);
    const sourceRef = useRef<any>(null);
    const okRef = useRef<any>(null);
    const ok = useRef<any>({
        faceCount: { status: false, val: 0 },
        faceConfidence: { status: false, val: 0 },
        facingCenter: { status: false, val: 0 },
        lookingCenter: { status: false, val: 0 },
        blinkDetected: { status: false, val: 0 },
        faceSize: { status: false, val: 0 },
        antispoofCheck: { status: false, val: 0 },
        livenessCheck: { status: false, val: 0 },
        distance: { status: false, val: 0 },
        age: { status: false, val: 0 },
        gender: { status: false, val: 0 },
        timeout: { status: true, val: 0 },
        descriptor: { status: false, val: 0 },
        elapsedMs: { status: undefined, val: 0 },
        detectFPS: { status: undefined, val: 0 },
        drawFPS: { status: undefined, val: 0 },
    });
    const current = useRef<any>({ face: null, record: null });
    const blink = useRef<any>({ start: 0, end: 0, time: 0 });
    const timestamp = useRef<any>({ detect: 0, draw: 0 });
    const startTime = useRef<any>(0);

    const allOk = () => ok.current.faceCount.status
        && ok.current.faceSize.status
        && ok.current.blinkDetected.status
        && ok.current.facingCenter.status
        && ok.current.lookingCenter.status
        && ok.current.faceConfidence.status
        && ok.current.antispoofCheck.status
        && ok.current.livenessCheck.status
        && ok.current.distance.status
        && ok.current.descriptor.status
        && ok.current.age.status
        && ok.current.gender.status;

    const log = (...msg: any[]) => {
        console.log(...msg);
    };


    const detectionLoop = async () => {
        const video = videoRef.current;
        if (!video || video.paused) return;
        if (current.current.face?.tensor) human.current.tf.dispose(current.current.face.tensor);
        await human.current.detect(video);
        const now = human.current.now();
        ok.current.detectFPS.val = Math.round(10000 / (now - timestamp.current.detect)) / 10;
        timestamp.current.detect = now;
        requestAnimationFrame(detectionLoop);
    };

    const drawValidationTests = () => {
        const okDiv = okRef.current;
        if (!okDiv) return;
        let y = 32;
        for (const [key, val] of Object.entries(ok.current)) {
            let el = document.getElementById(`ok-${key}`);
            if (!el) {
                el = document.createElement('div');
                el.id = `ok-${key}`;
                el.className = 'ok';
                el.style.top = `${y}px`;
                okDiv.appendChild(el);
            }
            // @ts-ignore
            if (typeof val.status === 'boolean') el.style.backgroundColor = val.status ? 'lightgreen' : 'lightcoral';
            // @ts-ignore
            const status = val.status ? 'ok' : 'fail';
            // @ts-ignore
            el.innerText = `${key}: ${val.val === 0 ? status : val.val}`;
            y += 28;
        }
    };

    const validationLoop = () => {
        return new Promise(async (resolve) => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) return;
            const interpolated = human.current.next(human.current.result);
            human.current.draw.canvas(video, canvas);
            await human.current.draw.all(canvas, interpolated);
            const now = human.current.now();
            ok.current.drawFPS.val = Math.round(10000 / (now - timestamp.current.draw)) / 10;
            timestamp.current.draw = now;
            ok.current.faceCount.val = human.current.result.face.length;
            ok.current.faceCount.status = ok.current.faceCount.val === 1;
            if (ok.current.faceCount.status) {
                // @ts-ignore
                const gestures = Object.values(human.current.result.gesture).map(gesture => gesture.gesture);
                if (gestures.includes('blink left eye') || gestures.includes('blink right eye')) blink.current.start = human.current.now();
                if (blink.current.start > 0 && !gestures.includes('blink left eye') && !gestures.includes('blink right eye')) blink.current.end = human.current.now();
                ok.current.blinkDetected.status = ok.current.blinkDetected.status || (Math.abs(blink.current.end - blink.current.start) > options.blinkMin && Math.abs(blink.current.end - blink.current.start) < options.blinkMax);
                if (ok.current.blinkDetected.status && blink.current.time === 0) blink.current.time = Math.trunc(blink.current.end - blink.current.start);
                ok.current.facingCenter.status = gestures.includes('facing center');
                ok.current.lookingCenter.status = gestures.includes('looking center');
                ok.current.faceConfidence.val = human.current.result.face[0].faceScore || human.current.result.face[0].boxScore || 0;
                ok.current.faceConfidence.status = ok.current.faceConfidence.val >= options.minConfidence;
                ok.current.antispoofCheck.val = human.current.result.face[0].real || 0;
                ok.current.antispoofCheck.status = ok.current.antispoofCheck.val >= options.minConfidence;
                ok.current.livenessCheck.val = human.current.result.face[0].live || 0;
                ok.current.livenessCheck.status = ok.current.livenessCheck.val >= options.minConfidence;
                ok.current.faceSize.val = Math.min(human.current.result.face[0].box[2], human.current.result.face[0].box[3]);
                ok.current.faceSize.status = ok.current.faceSize.val >= options.minSize;
                ok.current.distance.val = human.current.result.face[0].distance || 0;
                ok.current.distance.status = (ok.current.distance.val >= options.distanceMin) && (ok.current.distance.val <= options.distanceMax);
                ok.current.descriptor.val = human.current.result.face[0].embedding?.length || 0;
                ok.current.descriptor.status = ok.current.descriptor.val > 0;
                ok.current.age.val = human.current.result.face[0].age || 0;
                ok.current.age.status = ok.current.age.val > 0;
                ok.current.gender.val = human.current.result.face[0].genderScore || 0;
                ok.current.gender.status = ok.current.gender.val >= options.minConfidence;
            }
            ok.current.timeout.status = ok.current.elapsedMs.val <= options.maxTime;
            drawValidationTests();
            if (allOk() || !ok.current.timeout.status) {
                video.pause();
                resolve(human.current.result.face[0]);
                return;
            }
            ok.current.elapsedMs.val = Math.trunc(human.current.now() - startTime.current);
            setTimeout(async () => {
                await validationLoop();
                resolve(human.current.result.face[0]);
            }, 30);
        });
    };

    const detectFace = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !current.current?.face?.tensor || !current.current?.face?.embedding) return false;
        canvas.style.height = '';
        canvas.getContext('2d')?.clearRect(0, 0, options.minSize, options.minSize);
        console.log('face record:', current.current.face);
        log(`detected face: ${current.current.face.gender} ${current.current.face.age || 0}y distance ${100 * (current.current.face.distance || 0)}cm/${Math.round(100 * (current.current.face.distance || 0) / 2.54)}in`);
        await human.current.draw.tensor(current.current.face.tensor, canvas);
        log('face database is empty: nothing to compare face with');
        document.body.style.background = 'black';
        if (deleteRef.current) deleteRef.current.style.display = 'none';
        return false;
    };

    const main = async () => {
        ok.current.faceCount.status = false;
        ok.current.faceConfidence.status = false;
        ok.current.facingCenter.status = false;
        ok.current.blinkDetected.status = false;
        ok.current.faceSize.status = false;
        ok.current.antispoofCheck.status = false;
        ok.current.livenessCheck.status = false;
        ok.current.age.status = false;
        ok.current.gender.status = false;
        ok.current.elapsedMs.val = 0;
        if (matchRef.current) matchRef.current.style.display = 'none';
        if (retryRef.current) retryRef.current.style.display = 'none';
        if (sourceRef.current) sourceRef.current.style.display = 'none';
        if (canvasRef.current) canvasRef.current.style.height = '50%';
        document.body.style.background = 'black';
        await detectionLoop();
        startTime.current = human.current.now();
        current.current.face = await validationLoop();
        const canvas = canvasRef.current;
        const source = sourceRef.current;
        if (canvas && current.current.face?.tensor) {
            canvas.width = current.current.face.tensor.shape[1] || options.minSize;
            canvas.height = current.current.face.tensor.shape[0] || options.minSize;
            if (source) {
                source.width = canvas.width;
                source.height = canvas.height;
            }
            canvas.style.width = '';
        }
        if (matchRef.current) matchRef.current.style.display = 'flex';
        if (saveRef.current) saveRef.current.style.display = 'flex';
        if (deleteRef.current) deleteRef.current.style.display = 'flex';
        if (retryRef.current) retryRef.current.style.display = 'block';
        if (!allOk()) {
            log('did not find valid face');
            return false;
        }
        return detectFace();
    };

    useEffect(() => {
        human.current.env.perfadd = false;
        human.current.draw.options.font = 'small-caps 18px "Lato"';
        human.current.draw.options.lineHeight = 20;

        const init = async () => {
            log('human version:', human.current.version, '| tfjs version:', human.current.tf.version['tfjs-core']);
            log('options:', JSON.stringify(options).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ' '));
            log('loading human models...');
            await human.current.load();
            log('initializing human...');
            log('face embedding model:', humanConfig.face.description.enabled ? 'faceres' : '', humanConfig.face['mobilefacenet']?.enabled ? 'mobilefacenet' : '', humanConfig.face['insightface']?.enabled ? 'insightface' : '');
            log('loading face database...');
            if (retryRef.current) retryRef.current.addEventListener('click', main);
            await human.current.warmup();
            await main();
        };

        init();

        const video = videoRef.current;
        if (video) {
            video.onclick = () => {
                if (video.paused) video.play();
                else video.pause();
            };
        }

        return () => {
            if (retryRef.current) retryRef.current.removeEventListener('click', main);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                if ("getTracks" in stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        };
    }, []);

    return {
        isFaceDetected,
        detectionStart
    }
};
