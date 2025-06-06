// import Human, {Config, FaceResult, GestureResult} from "@vladmandic/human";
// import {useEffect, useState} from "react";
// import {Circle, isRectangleCoveredByCircle, Rectangle} from "../utils/faceUtils";
//
// const humanConfig = { // user configuration for human, used to fine-tune behavior
//     cacheSensitivity: 0.01,
//     modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models/", // Путь к моделям
//     filter: { enabled: true, equalization: true }, // lets run with histogram equilizer
//     debug: true,
//     face: {
//         enabled: true,
//         detector: { rotation: true, return: true, mask: false }, // return tensor is used to get detected face image
//         description: { enabled: true }, // default model for face descriptor extraction is faceres
//         // mobilefacenet: { enabled: true, modelPath: 'https://vladmandic.github.io/human-models/models/mobilefacenet.json' }, // alternative model
//         // insightface: { enabled: true, modelPath: 'https://vladmandic.github.io/insightface/models/insightface-mobilenet-swish.json' }, // alternative model
//         iris: { enabled: true }, // needed to determine gaze direction
//         emotion: { enabled: false }, // not needed
//         antispoof: { enabled: true }, // enable optional antispoof module
//         liveness: { enabled: true }, // enable optional liveness module
//     },
//     body: { enabled: false },
//     hand: { enabled: false },
//     object: { enabled: false },
//     gesture: { enabled: true }, // parses face and iris gestures
// };
//
// // const matchOptions = { order: 2, multiplier: 1000, min: 0.0, max: 1.0 }; // for embedding model
// const matchOptions = { order: 2, multiplier: 25, min: 0.2, max: 0.8 }; // for faceres model
//
// const options = {
//     minConfidence: 0.6, // overal face confidence for box, face, gender, real, live
//     minSize: 224, // min input to face descriptor model before degradation
//     maxTime: 30000, // max time before giving up
//     blinkMin: 10, // minimum duration of a valid blink
//     blinkMax: 800, // maximum duration of a valid blink
//     threshold: 0.5, // minimum similarity
//     distanceMin: 0.4, // closest that face is allowed to be to the cammera in cm
//     distanceMax: 1.0, // farthest that face is allowed to be to the cammera in cm
//     mask: humanConfig.face.detector.mask,
//     rotation: humanConfig.face.detector.rotation,
//     ...matchOptions,
// };
//
// const ok: Record<string, { status: boolean | undefined, val: number }> = { // must meet all rules
//     faceCount: { status: false, val: 0 },
//     faceConfidence: { status: false, val: 0 },
//     facingCenter: { status: false, val: 0 },
//     lookingCenter: { status: false, val: 0 },
//     blinkDetected: { status: false, val: 0 },
//     faceSize: { status: false, val: 0 },
//     antispoofCheck: { status: false, val: 0 },
//     livenessCheck: { status: false, val: 0 },
//     distance: { status: false, val: 0 },
//     age: { status: false, val: 0 },
//     gender: { status: false, val: 0 },
//     timeout: { status: true, val: 0 },
//     descriptor: { status: false, val: 0 },
//     elapsedMs: { status: undefined, val: 0 }, // total time while waiting for valid face
//     detectFPS: { status: undefined, val: 0 }, // mark detection fps performance
//     drawFPS: { status: undefined, val: 0 }, // mark redraw fps performance
// };
//
// const allOk = () => ok.faceCount.status
//     && ok.faceSize.status
//     && ok.blinkDetected.status
//     && ok.facingCenter.status
//     && ok.lookingCenter.status
//     && ok.faceConfidence.status
//     && ok.antispoofCheck.status
//     && ok.livenessCheck.status
//     && ok.distance.status
//     && ok.descriptor.status
//     && ok.age.status
//     && ok.gender.status;
//
// const current: { face: FaceResult | null, record:  null } = { face: null, record: null }; // current face record and matched database record
//
// const blink = { // internal timers for blink start/end/duration
//     start: 0,
//     end: 0,
//     time: 0,
// };
//
// // let db: Array<{ name: string, source: string, embedding: number[] }> = []; // holds loaded face descriptor database
// const human = new Human(humanConfig); // create instance of human with overrides from user configuration
//
// human.env.perfadd = false; // is performance data showing instant or total values
// human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
// human.draw.options.lineHeight = 20;
//
// const dom = { // grab instances of dom objects so we dont have to look them up later
//     video: document.getElementById('video') as HTMLVideoElement,
//     canvas: document.getElementById('canvas') as HTMLCanvasElement,
//     log: document.getElementById('log') as HTMLPreElement,
//     fps: document.getElementById('fps') as HTMLPreElement,
//     match: document.getElementById('match') as HTMLDivElement,
//     name: document.getElementById('name') as HTMLInputElement,
//     save: document.getElementById('save') as HTMLSpanElement,
//     delete: document.getElementById('delete') as HTMLSpanElement,
//     retry: document.getElementById('retry') as HTMLDivElement,
//     source: document.getElementById('source') as HTMLCanvasElement,
//     ok: document.getElementById('ok') as HTMLDivElement,
// };
// const timestamp = { detect: 0, draw: 0 }; // holds information used to calculate performance and possible memory leaks
// let startTime = 0;
//
// const log = (...msg:any[]) => { // helper method to output messages
//     dom.log.innerText += msg.join(' ') + '\n';
//     console.log(...msg); // eslint-disable-line no-console
// };
//
// async function webCam() {
//
//     // initialize webcam
//                           // @ts-ignore resizeMode is not yet defined in tslib
//     const cameraOptions: MediaStreamConstraints = { audio: false, video: { facingMode: 'user', resizeMode: 'none', width: { ideal: document.body.clientWidth } } };
//     const stream: MediaStream = await navigator.mediaDevices.getUserMedia(cameraOptions);
//     const ready = new Promise((resolve) => { dom.video.onloadeddata = () => resolve(true); });
//     dom.video.srcObject = stream;
//     void dom.video.play();
//     await ready;
//     dom.canvas.width = dom.video.videoWidth;
//     dom.canvas.height = dom.video.videoHeight;
//     dom.canvas.style.width = '50%';
//     dom.canvas.style.height = '50%';
//     if (human.env.initial) log('video:', dom.video.videoWidth, dom.video.videoHeight, '|', stream.getVideoTracks()[0].label);
//     dom.canvas.onclick = () => { // pause when clicked on screen and resume on next click
//         if (dom.video.paused) void dom.video.play();
//         else dom.video.pause();
//     };
// }
//
// async function detectionLoop() { // main detection loop
//     if (!dom.video.paused) {
//         if (current.face?.tensor) human.tf.dispose(current.face.tensor); // dispose previous tensor
//         await human.detect(dom.video); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
//         const now = human.now();
//         ok.detectFPS.val = Math.round(10000 / (now - timestamp.detect)) / 10;
//         timestamp.detect = now;
//         requestAnimationFrame(detectionLoop); // start new frame immediately
//     }
// }
//
// function drawValidationTests() {
//     let y = 32;
//     for (const [key, val] of Object.entries(ok)) {
//         let el = document.getElementById(`ok-${key}`);
//         if (!el) {
//             el = document.createElement('div');
//             el.id = `ok-${key}`;
//             el.innerText = key;
//             el.className = 'ok';
//             el.style.top = `${y}px`;
//             dom.ok.appendChild(el);
//         }
//         if (typeof val.status === 'boolean') el.style.backgroundColor = val.status ? 'lightgreen' : 'lightcoral';
//         const status = val.status ? 'ok' : 'fail';
//         el.innerText = `${key}: ${val.val === 0 ? status : val.val}`;
//         y += 28;
//     }
// }
//
// async function validationLoop(): Promise<FaceResult> { // main screen refresh loop
//     const interpolated = human.next(human.result); // smoothen result using last-known results
//     human.draw.canvas(dom.video, dom.canvas); // draw canvas to screen
//     await human.draw.all(dom.canvas, interpolated); // draw labels, boxes, lines, etc.
//     const now = human.now();
//     ok.drawFPS.val = Math.round(10000 / (now - timestamp.draw)) / 10;
//     timestamp.draw = now;
//     ok.faceCount.val = human.result.face.length;
//     ok.faceCount.status = ok.faceCount.val === 1; // must be exactly detected face
//     if (ok.faceCount.status) { // skip the rest if no face
//         const gestures: string[] = Object.values(human.result.gesture).map((gesture: GestureResult) => gesture.gesture); // flatten all gestures
//         if (gestures.includes('blink left eye') || gestures.includes('blink right eye')) blink.start = human.now(); // blink starts when eyes get closed
//         if (blink.start > 0 && !gestures.includes('blink left eye') && !gestures.includes('blink right eye')) blink.end = human.now(); // if blink started how long until eyes are back open
//         ok.blinkDetected.status = ok.blinkDetected.status || (Math.abs(blink.end - blink.start) > options.blinkMin && Math.abs(blink.end - blink.start) < options.blinkMax);
//         if (ok.blinkDetected.status && blink.time === 0) blink.time = Math.trunc(blink.end - blink.start);
//         ok.facingCenter.status = gestures.includes('facing center');
//         ok.lookingCenter.status = gestures.includes('looking center'); // must face camera and look at camera
//         ok.faceConfidence.val = human.result.face[0].faceScore || human.result.face[0].boxScore || 0;
//         ok.faceConfidence.status = ok.faceConfidence.val >= options.minConfidence;
//         ok.antispoofCheck.val = human.result.face[0].real || 0;
//         ok.antispoofCheck.status = ok.antispoofCheck.val >= options.minConfidence;
//         ok.livenessCheck.val = human.result.face[0].live || 0;
//         ok.livenessCheck.status = ok.livenessCheck.val >= options.minConfidence;
//         ok.faceSize.val = Math.min(human.result.face[0].box[2], human.result.face[0].box[3]);
//         ok.faceSize.status = ok.faceSize.val >= options.minSize;
//         ok.distance.val = human.result.face[0].distance || 0;
//         ok.distance.status = (ok.distance.val >= options.distanceMin) && (ok.distance.val <= options.distanceMax);
//         ok.descriptor.val = human.result.face[0].embedding?.length || 0;
//         ok.descriptor.status = ok.descriptor.val > 0;
//         ok.age.val = human.result.face[0].age || 0;
//         ok.age.status = ok.age.val > 0;
//         ok.gender.val = human.result.face[0].genderScore || 0;
//         ok.gender.status = ok.gender.val >= options.minConfidence;
//     }
//     // run again
//     ok.timeout.status = ok.elapsedMs.val <= options.maxTime;
//     drawValidationTests();
//     if (allOk() || !ok.timeout.status) { // all criteria met
//         dom.video.pause();
//         return human.result.face[0];
//     }
//     ok.elapsedMs.val = Math.trunc(human.now() - startTime);
//     return new Promise((resolve) => {
//         setTimeout(async () => {
//             await validationLoop(); // run validation loop until conditions are met
//             resolve(human.result.face[0]); // recursive promise resolve
//         }, 30); // use to slow down refresh from max refresh rate to target of 30 fps
//     });
// }
//
//
//
// async function detectFace() {
//  /*   dom.canvas.style.height = '';
//     dom.canvas.getContext('2d')?.clearRect(0, 0, options.minSize, options.minSize);
//     if (!current?.face?.tensor || !current?.face?.embedding) return false;
//     console.log('face record:', current.face); // eslint-disable-line no-console
//     log(`detected face: ${current.face.gender} ${current.face.age || 0}y distance ${100 * (current.face.distance || 0)}cm/${Math.round(100 * (current.face.distance || 0) / 2.54)}in`);
//     await human.draw.tensor(current.face.tensor, dom.canvas);
//
//     const db = await indexDb.load();
//     const descriptors = db.map((rec) => rec.descriptor).filter((desc) => desc.length > 0);
//     const res = human.match.find(current.face.embedding, descriptors, matchOptions);
//     current.record = db[res.index] || null;
//     if (current.record) {
//         log(`best match: ${current.record.name} | id: ${current.record.id} | similarity: ${Math.round(1000 * res.similarity) / 10}%`);
//         dom.name.value = current.record.name;
//         dom.source.style.display = '';
//         dom.source.getContext('2d')?.putImageData(current.record.image, 0, 0);
//     }
//     document.body.style.background = res.similarity > options.threshold ? 'darkgreen' : 'maroon';
//     return res.similarity > options.threshold;*/
//     return true
// }
//
// async function main() { // main entry point
//     ok.faceCount.status = false;
//     ok.faceConfidence.status = false;
//     ok.facingCenter.status = false;
//     ok.blinkDetected.status = false;
//     ok.faceSize.status = false;
//     ok.antispoofCheck.status = false;
//     ok.livenessCheck.status = false;
//     ok.age.status = false;
//     ok.gender.status = false;
//     ok.elapsedMs.val = 0;
//     dom.match.style.display = 'none';
//     dom.retry.style.display = 'none';
//     dom.source.style.display = 'none';
//     dom.canvas.style.height = '50%';
//     document.body.style.background = 'black';
//     await webCam();
//     await detectionLoop(); // start detection loop
//     startTime = human.now();
//     current.face = await validationLoop(); // start validation loop
//     dom.canvas.width = current.face?.tensor?.shape[1] || options.minSize;
//     dom.canvas.height = current.face?.tensor?.shape[0] || options.minSize;
//     dom.source.width = dom.canvas.width;
//     dom.source.height = dom.canvas.height;
//     dom.canvas.style.width = '';
//     dom.match.style.display = 'flex';
//     dom.save.style.display = 'flex';
//     dom.delete.style.display = 'flex';
//     dom.retry.style.display = 'block';
//     if (!allOk()) { // is all criteria met?
//         log('did not find valid face');
//         return false;
//     }
//     return detectFace();
// }
//
// async function init() {
//     log('human version:', human.version, '| tfjs version:', human.tf.version['tfjs-core']);
//     log('options:', JSON.stringify(options).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ' '));
//     log('initializing webcam...');
//     await webCam(); // start webcam
//     log('loading human models...');
//     await human.load(); // preload all models
//     log('initializing human...');
//     // @ts-ignore
//     log('face embedding model:', humanConfig.face.description.enabled ? 'faceres' : '',  humanConfig.face['mobilefacenet']?.enabled ? 'mobilefacenet' : '', humanConfig.face['insightface']?.enabled ? 'insightface' : '');
//     log('loading face database...');
//     dom.retry.addEventListener('click', main);
//     await human.warmup(); // warmup function to initialize backend for future faster detection
//     await main();
// }
//
// window.onload = init;
//
//
// // Интерфейс для масштабированного FaceResult
// interface ScaledFaceResult extends FaceResult {
//     box: [number, number, number, number]; // [x, y, width, height]
// }
//
// // Функция масштабирования
// function resizeResults<T extends FaceResult | FaceResult[]>(
//     results: T,
//     inputDimensions: Dimensions,
//     targetDimensions: Dimensions
// ): T {
//     // Эмулируем inputSize: 416, как в TinyFaceDetector
//     const modelInputSize = 416;
//     const videoAspectRatio = inputDimensions.width / inputDimensions.height;
//     let modelWidth = modelInputSize;
//     let modelHeight = modelInputSize;
//
//     // Сохраняем пропорции видео
//     if (videoAspectRatio > 1) {
//         modelHeight = modelInputSize / videoAspectRatio;
//     } else {
//         modelWidth = modelInputSize * videoAspectRatio;
//     }
//
//     // Масштабируем от разрешения видео к modelInputSize
//     const scaleXModel = modelWidth / inputDimensions.width;
//     const scaleYModel = modelHeight / inputDimensions.height;
//
//     // Масштабируем от modelInputSize к канвасу
//     const scaleXCanvas = targetDimensions.width / modelWidth;
//     const scaleYCanvas = targetDimensions.height / modelHeight;
//
//     const scaleFaceResult = (face: FaceResult): ScaledFaceResult => {
//         const [x, y, width, height] = face.box;
//         // Сначала масштабируем к modelInputSize
//         const modelX = x * scaleXModel;
//         const modelY = y * scaleYModel;
//         const modelWidthScaled = width * scaleXModel;
//         const modelHeightScaled = height * scaleYModel;
//         // Затем масштабируем к канвасу
//         return {
//             ...face,
//             box: [
//                 modelX * scaleXCanvas,
//                 modelY * scaleYCanvas,
//                 modelWidthScaled * scaleXCanvas,
//                 modelHeightScaled * scaleYCanvas,
//             ],
//         };
//     };
//
//     if (Array.isArray(results)) {
//         return results.map(scaleFaceResult) as T;
//     }
//     return scaleFaceResult(results) as T;
// }
//
// export const useFaceDetection = (
//     isCameraOn: boolean, // Пропс, который говорит, включена ли камера
//     videoRef: React.RefObject<HTMLVideoElement>, // Ссылка на элемент video, который будет показывать видео с камеры
//     canvasRef: React.RefObject<HTMLCanvasElement>, // Ссылка на элемент canvas, на котором будет отображаться сделанное фото
//     videoBorderRef: React.RefObject<HTMLDivElement>,
//     isLoaded: boolean
// ) => {
//     const [isFaceDetected, setIsFaceDetected] = useState(false);// Состояние для отслеживания, было ли найдено лицо
//     const [humanLoaded, setHumanLoaded] = useState(false);
//     const [detectionStart, setDetectionStart] = useState(false);
//     const [humanInstance, setHumanInstance] = useState<Human | null>(null);
//     const [isDraw] = useState(false);// Состояние для отслеживания, загружены ли модели
//
//     async function detectionLoop() { // main detection loop
//         if (humanInstance) {
//             if (current.face?.tensor) humanInstance.tf.dispose(current.face.tensor); // dispose previous tensor
//             await human.detect(videoRef.current); // actual detection; were not capturing output in a local variable as it can also be reached via human.result
//             const now = humanInstance.now();
//             ok.detectFPS.val = Math.round(10000 / (now - timestamp.detect)) / 10;
//             timestamp.detect = now;
//             requestAnimationFrame(detectionLoop); // start new frame immediately
//         }
//     }
// // Инициализация Human
//     useEffect(() => {
//         const initHuman = async () => {
//             console.log("Начало инициализации Human:", new Date().toISOString());
//             try {
//                 const human = new Human(humanConfig);
//                 await human.load(); // Загружаем модели
//                 await human.warmup(); // Прогреваем модель для ускорения первого вызова
//                 setHumanInstance(human);
//                 setHumanLoaded(true);
//                 console.log("Human инициализирован:", new Date().toISOString());
//             } catch (error) {
//                 console.error("Ошибка инициализации Human:", error);
//             }
//         };
//         initHuman();
//     }, []);
//
//     // Детекция лиц
//     useEffect(() => {
//         let animationFrameId = null;
//         let lastDetectionTime = 0;
//         console.log(`${humanLoaded}${isCameraOn}${isLoaded}${videoRef.current}${canvasRef.current}${videoBorderRef.current}${humanInstance}${new Date()}`)
//         if (humanLoaded &&
//             isCameraOn &&
//             isLoaded &&
//             videoRef.current &&
//             canvasRef.current &&
//             videoBorderRef.current &&
//             humanInstance
//         ) {
//
//             ok.faceCount.status = false;
//             ok.faceConfidence.status = false;
//             ok.facingCenter.status = false;
//             ok.blinkDetected.status = false;
//             ok.faceSize.status = false;
//             ok.antispoofCheck.status = false;
//             ok.livenessCheck.status = false;
//             ok.age.status = false;
//             ok.gender.status = false;
//             ok.elapsedMs.val = 0;
//
//            const res =  detectionLoop().then(async res => {
//                 startTime = humanInstance.now();
//                 current.face = await validationLoop(); // start validation loop
//                 if (!allOk()) { // is all criteria met?
//                     log('did not find valid face');
//                     return false;
//                 }
//                 return detectFace();
//             })
//                 .catch(err=>{
//                     return false;
//
//                 })
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//             let i = 0
//             const detectFace = async () => {
//
//                 const now = Date.now();
//                 try {
//                     i++
//                     let y = i
//                     if (videoRef.current && canvasRef.current && videoBorderRef.current) { // Если video и canvas элементы существуют
//                         setDetectionStart(true)
//                         if (now - lastDetectionTime >= 200) { // Детекция каждые 200 мс
//
//                             const video = videoRef.current;
//                             const canvas = canvasRef.current;
//                             const video_border = videoBorderRef.current;
//
//                             // Настроим размеры канваса, чтобы он соответствовал размеру видео
//                             const displaySize = {
//                                 width: video_border.offsetWidth,
//                                 height: video_border.offsetHeight
//                             };
//
//                             canvas.width = displaySize.width;
//                             canvas.height = displaySize.height;
//
//                             const inputSize = {
//                                 width: video.videoWidth,
//                                 height: video.videoHeight,
//                             };
//
//                             if (!inputSize.width || !inputSize.height) return;
//
//                             let faces: FaceResult[] = [];
//                             const result = await humanInstance.detect(video); // Выполняем детекцию
//
//                             faces = result.face || []; // Извлекаем массив лиц
//                             lastDetectionTime = now;
//
//                             const resizedFaces = resizeResults(faces, inputSize, displaySize);
//
//                             let ctx: any = null
//                             if (isDraw) {
//                                 ctx = canvas.getContext('2d');
//                                 if (!ctx) return
//                                 ctx.clearRect(0, 0, canvas.width, canvas.height);
//                             }
//
//
//                             // Проверяем, попадает ли лицо в оверлей
//                             const circle: Circle = {cx: canvas.clientWidth / 2, cy: canvas.clientHeight / 2, r: 150}; // Создаем круг в центре видео с радиусом 150px
//
//                             let faceDetected = false// Флаг для проверки, было ли найдено лицо в области круга
//                             resizedFaces.forEach((face) => {
//                                     // Извлекаем координаты bounding box лица
//                                     let [x, y, width, height] = face.box;
//
//                                     const transformedX = canvas.clientWidth - (x + width);
//
//                                     const rectangle: Rectangle = {x: transformedX, y, width, height}
//
//                                     faceDetected = isRectangleCoveredByCircle(circle, rectangle, 0.8)
//                                     if (isDraw && ctx) {
//                                         // Рисуем рамку
//                                         ctx.lineWidth = 4;
//                                         ctx.lineCap = 'square';
//                                         ctx.lineJoin = 'bevel';
//                                         ctx.strokeStyle = '#5199d9';
//
//
//                                         //ctx.strokeRect(transformedX, y, width, height);
//                                         ctx.strokeRect(transformedX, y, width, height);
//                                     }
//                                 }
//                             );
//                             setIsFaceDetected(faceDetected);
//                             if (isDraw && ctx) {
//                                 ctx.beginPath();
//                                 ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI); // Рисуем круг
//                                 ctx.fillStyle = faceDetected ? 'transparent' : 'transparent'; // Зеленый если лицо внутри круга, красный если нет
//                                 ctx.fill();
//                                 ctx.lineWidth = 4;
//                                 ctx.strokeStyle = faceDetected ? 'green' : 'red';
//                                 ctx.stroke();
//                             }
//                         }
//
//
//                     }
//                 } catch (error) {
//                     console.error('Ошибка в detectFace:', error);
//                 } finally {
//                     animationFrameId = requestAnimationFrame(detectFace);
//                 }
//             };
//             detectFace()
//         }
//
//     }, [humanLoaded, isCameraOn, isLoaded, humanInstance]);
//
//     return {isFaceDetected, detectionStart};
// };

export  function x (){
    return
}
