"use strict";(self.webpackChunkapp_check_face=self.webpackChunkapp_check_face||[]).push([[485],{485:(e,t,s)=>{s.r(t),s.d(t,{default:()=>c});var a=s(43),o=s(903),n=s(579);const i=e=>{const{onClick:t,text:s,disabled:a,width:i,max:r}=e,d={disabled:a,max:r};return(0,n.jsx)("div",{style:{width:i},className:(0,o.x)("button",d,[]),onClick:t,children:s})};var r=s(179),d=s(416);const l=(e,t)=>{const s=atob(e.split(",")[1]),a=new ArrayBuffer(s.length),o=new Uint8Array(a);for(let n=0;n<s.length;n++)o[n]=s.charCodeAt(n);return new Blob([o],{type:t})};var p=s(213);const c=e=>{let{photoUrl:t,setIsCameraOn:s,params:o,setError:c}=e;const[u,h]=(0,a.useState)(!1);return t?(0,n.jsxs)(d.T,{max:!0,gap:"15",children:[(0,n.jsx)("div",{className:"img_box",children:(0,n.jsx)("img",{className:"img",src:null!==t&&void 0!==t?t:"",alt:"\u0421\u0434\u0435\u043b\u0430\u043d\u043d\u043e\u0435 \u0444\u043e\u0442\u043e"})}),(0,n.jsx)(i,{width:"calc(100% - 20px)",onClick:()=>s(!0),text:r.Xp,disabled:u}),(0,n.jsx)(i,{width:"calc(100% - 20px)",onClick:()=>{const e="Telegram"in window?window.Telegram:void 0;if("registration"===(null===o||void 0===o?void 0:o.type))if(e){var s,a,n;if(!t)return void c("\u0424\u043e\u0442\u043e \u043d\u0435 \u0441\u0434\u0435\u043b\u0430\u043d\u043e! \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.");const e=l(t,"image/jpeg"),i=new FormData,r={userPhone:null!==(s=null===o||void 0===o?void 0:o.userPhone)&&void 0!==s?s:"",userId:null!==(a=null===o||void 0===o?void 0:o.userId)&&void 0!==a?a:"",isSavePhoto:null!==(n=null===o||void 0===o?void 0:o.isSavePhoto)&&void 0!==n?n:"0",photo:e};i.append("userPhone",r.userPhone),i.append("userId",r.userId),i.append("photo",r.photo),i.append("isSavePhoto",r.isSavePhoto),h(!0),((e,t,s)=>{const a="Telegram"in window?window.Telegram:void 0;a&&p.A.post("http://localhost:5000/api/users/registration",e).then((e=>{t(!1);const o=e.data;switch(o.status){case 0:case 1:a.WebApp.sendData(JSON.stringify(o));break;case 2:s("\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.");break;default:s("\u041e\u0448\u0438\u0431\u043a\u0430. \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435."),console.warn("Unexpected response:",o)}})).catch((e=>{t(!1),s("\u041e\u0448\u0438\u0431\u043a\u0430. \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435."),a.WebApp.sendData(JSON.stringify({result:"server_error"}))}))})(i,h,c)}else c("\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0431\u044b\u043b\u043e \u043e\u0442\u043a\u0440\u044b\u0442\u043e \u041d\u0415 \u0432 \u0422\u0435\u043b\u0435\u0433\u0440\u0430\u043c\u043c\u0435");else if("identification"===(null===o||void 0===o?void 0:o.type))if(e){var i;if(!t)return void c("\u0424\u043e\u0442\u043e \u043d\u0435 \u0441\u0434\u0435\u043b\u0430\u043d\u043e! \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.");const e=l(t,"image/jpeg"),s=new FormData,a={userId:null!==(i=null===o||void 0===o?void 0:o.userId)&&void 0!==i?i:"",photo:e};s.append("userId",a.userId),s.append("photo",a.photo),h(!0),((e,t,s)=>{const a="Telegram"in window?window.Telegram:void 0;a&&p.A.post("http://localhost:5000/api/embeddings/identification",e).then((e=>{t(!1);const o=e.data;switch(o.status){case 0:case 1:a.WebApp.sendData(JSON.stringify(o));break;case 2:s("\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.");break;default:s("\u041e\u0448\u0438\u0431\u043a\u0430. \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435."),console.warn("Unexpected response:",o)}})).catch((e=>{let s;t(!1),e.response?(s=e.response.data,a.WebApp.sendData(JSON.stringify(s))):(s={status:2,text:"server_error"},a.WebApp.sendData(JSON.stringify(s)))}))})(s,h,c)}else c("\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0431\u044b\u043b\u043e \u043e\u0442\u043a\u0440\u044b\u0442\u043e \u041d\u0415 \u0432 \u0422\u0435\u043b\u0435\u0433\u0440\u0430\u043c\u043c\u0435")},text:r.JV,disabled:u})]}):(0,n.jsx)(n.Fragment,{})}}}]);
//# sourceMappingURL=485.a4c0cdf8.chunk.js.map