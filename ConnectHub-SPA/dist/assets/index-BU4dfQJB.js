const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/FeedPage-DXB8TMLf.js","assets/vendor-jjZ8v68s.js","assets/firebase-DwCCq129.js","assets/timeAgo-DQ0zXR-a.js","assets/state-BLQyNfo5.js","assets/StoriesPage-BpiKa_Ju.js","assets/LivePage-CzOB2q6I.js","assets/TrendingPage-DwbGCynJ.js","assets/GroupsPage-ApKRmhmB.js","assets/MessagesPage-D0OQOVEb.js","assets/NotificationsPage-BzG1z-96.js","assets/ProfilePage-D0Fg-Gtk.js","assets/FriendsPage-BI5Ca2xu.js","assets/DatingPage-Cf3G6-Mq.js","assets/EventsPage-0YFICNOE.js","assets/GamingPage-Cs9tiVaA.js","assets/MarketplacePage-B6jhe42f.js","assets/MediaHubPage-BdD9iv4W.js","assets/MusicPage-BAHfd95f.js","assets/VideoCallsPage-DHX7BiB4.js","assets/LiveStreamPage-DNblqB4d.js","assets/ARVRPage-Po2notF_.js","assets/SavedPage-BaegrFXK.js","assets/SearchPage-DkM0vwxL.js","assets/SettingsPage-BKZ4zXgo.js","assets/BusinessPage-E6rPLJm-.js","assets/CreatorPage-BuMOBaqZ.js","assets/HelpPage-CcCrMkbT.js"])))=>i.map(i=>d[i]);
import{r as u,a as Me,u as ce,b as q,O as Ve,c as $e,d as p,N as M,R as qe,B as Be}from"./vendor-jjZ8v68s.js";import{c as We}from"./state-BLQyNfo5.js";import{r as A,_ as S,C as E,a as R,E as le,o as Ue,F as de,L as Ge,g as ue,i as He,b as Ke,v as Ye,c as K,d as Je,e as Qe,f as Xe,h as Ze,j as et,k as tt,l as nt,m as it,n as at,p as st,s as Y,q as rt,t as ot,u as ct,w as lt,G as dt}from"./firebase-DwCCq129.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();var pe={exports:{}},C={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ut=u,pt=Symbol.for("react.element"),ft=Symbol.for("react.fragment"),gt=Object.prototype.hasOwnProperty,ht=ut.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,mt={key:!0,ref:!0,__self:!0,__source:!0};function fe(e,t,n){var a,s={},r=null,o=null;n!==void 0&&(r=""+n),t.key!==void 0&&(r=""+t.key),t.ref!==void 0&&(o=t.ref);for(a in t)gt.call(t,a)&&!mt.hasOwnProperty(a)&&(s[a]=t[a]);if(e&&e.defaultProps)for(a in t=e.defaultProps,t)s[a]===void 0&&(s[a]=t[a]);return{$$typeof:pt,type:e,key:r,ref:o,props:s,_owner:ht.current}}C.Fragment=ft;C.jsx=fe;C.jsxs=fe;pe.exports=C;var i=pe.exports,V={},J=Me;V.createRoot=J.createRoot,V.hydrateRoot=J.hydrateRoot;const yt="modulepreload",xt=function(e){return"/"+e},Q={},f=function(t,n,a){let s=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),c=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));s=Promise.allSettled(n.map(l=>{if(l=xt(l),l in Q)return;Q[l]=!0;const d=l.endsWith(".css"),g=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${g}`))return;const h=document.createElement("link");if(h.rel=d?"stylesheet":yt,d||(h.as="script"),h.crossOrigin="",h.href=l,c&&h.setAttribute("nonce",c),document.head.appendChild(h),d)return new Promise((b,m)=>{h.addEventListener("load",b),h.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(o){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=o,window.dispatchEvent(c),!c.defaultPrevented)throw o}return s.then(o=>{for(const c of o||[])c.status==="rejected"&&r(c.reason);return t().catch(r)})},T=We((e,t)=>({user:null,userProfile:null,setUser:n=>e({user:n}),setUserProfile:n=>e({userProfile:n}),toast:null,showToast:(n,a=3e3)=>{e({toast:n}),setTimeout(()=>e({toast:null}),a)},unreadMessages:0,unreadNotifications:0,setUnreadMessages:n=>e({unreadMessages:n}),setUnreadNotifications:n=>e({unreadNotifications:n}),feedPosts:[],feedLastDoc:null,feedLoading:!1,setFeedPosts:n=>e({feedPosts:n}),appendFeedPosts:(n,a)=>e(s=>({feedPosts:[...s.feedPosts,...n],feedLastDoc:a})),setFeedLoading:n=>e({feedLoading:n}),activeTab:"feed",setActiveTab:n=>e({activeTab:n}),theme:"dark",setTheme:n=>{e({theme:n}),document.documentElement.setAttribute("data-theme",n)},createPostOpen:!1,setCreatePostOpen:n=>e({createPostOpen:n})})),bt={"/feed":"ConnectHub","/stories":"Stories","/live":"Live","/trending":"Trending","/groups":"Groups","/messages":"Messages","/notifications":"Notifications","/profile":"Profile","/friends":"Friends","/dating":"Dating","/events":"Events","/gaming":"Gaming","/marketplace":"Marketplace","/media":"Media Hub","/music":"Music","/videocalls":"Video Calls","/livestream":"Live Stream","/arvr":"AR/VR","/saved":"Saved","/search":"Search","/settings":"Settings","/business":"Business","/creator":"Creator","/help":"Help & Support"};function wt(){const{pathname:e}=ce(),t=q();T(s=>s.userProfile);const n="/"+e.split("/")[1],a=bt[n]||"ConnectHub";return i.jsxs("header",{style:{height:"var(--top-nav-h)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",background:"rgba(15,12,41,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.1)",flexShrink:0,zIndex:100},children:[i.jsx("span",{style:{fontWeight:700,fontSize:"18px",background:"linear-gradient(135deg,#6366f1,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"},children:a}),i.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[i.jsx("button",{onClick:()=>t("/search"),style:{fontSize:"20px",padding:"4px"},"aria-label":"search",children:"🔍"}),i.jsx("button",{onClick:()=>t("/settings"),style:{fontSize:"20px",padding:"4px"},"aria-label":"settings",children:"⚙️"})]})]})}const vt=[{path:"/feed",icon:"🏠",label:"Home"},{path:"/search",icon:"🔍",label:"Search"},{path:"/messages",icon:"💬",label:"Messages",badge:"unreadMessages"},{path:"/notifications",icon:"🔔",label:"Alerts",badge:"unreadNotifications"},{path:"/profile",icon:"👤",label:"Profile"}];function It(){const e=q(),{pathname:t}=ce(),n=T(r=>r.unreadMessages),a=T(r=>r.unreadNotifications),s={unreadMessages:n,unreadNotifications:a};return i.jsx("nav",{style:{display:"flex",alignItems:"center",justifyContent:"space-around",height:"var(--bottom-nav-h)",paddingBottom:"var(--safe-bottom)",background:"rgba(15,12,41,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.1)",flexShrink:0,zIndex:100},children:vt.map(({path:r,icon:o,label:c,badge:l})=>{const d=t.startsWith(r),g=l?s[l]:0;return i.jsxs("button",{onClick:()=>e(r),style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"6px 12px",position:"relative",opacity:d?1:.5,transform:d?"scale(1.1)":"scale(1)",transition:"all 0.2s"},"aria-label":c,children:[i.jsx("span",{style:{fontSize:"22px",lineHeight:1},children:o}),i.jsx("span",{style:{fontSize:"10px",fontWeight:d?700:400,color:d?"#6366f1":"inherit"},children:c}),g>0&&i.jsx("span",{style:{position:"absolute",top:0,right:8,background:"#ef4444",color:"white",borderRadius:"50%",fontSize:"9px",fontWeight:700,width:"16px",height:"16px",display:"flex",alignItems:"center",justifyContent:"center"},children:g>9?"9+":g})]},r)})})}function _t({message:e}){return e?i.jsx("div",{className:"toast",role:"alert","aria-live":"polite",children:e}):null}function Tt(){const e=T(t=>t.toast);return i.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100dvh",overflow:"hidden"},children:[i.jsx(wt,{}),i.jsx("main",{style:{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"},children:i.jsx(Ve,{})}),i.jsx(It,{}),e&&i.jsx(_t,{message:e})]})}function ge(){return i.jsxs("div",{style:{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)",zIndex:9999},children:[i.jsx("div",{style:{width:"64px",height:"64px",borderRadius:"16px",background:"linear-gradient(135deg,#6366f1,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",boxShadow:"0 0 40px rgba(99,102,241,0.5)"},children:"⚡"}),i.jsx("span",{style:{fontSize:"24px",fontWeight:800,background:"linear-gradient(135deg,#6366f1,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"},children:"ConnectHub"}),i.jsx("div",{style:{width:"40px",height:"40px",borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#6366f1",animation:"spin 0.8s linear infinite",marginTop:"16px"}})]})}const he="@firebase/installations",B="0.6.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const me=1e4,ye=`w:${B}`,xe="FIS_v2",jt="https://firebaseinstallations.googleapis.com/v1",At=60*60*1e3,St="installations",Et="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pt={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},v=new le(St,Et,Pt);function be(e){return e instanceof de&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function we({projectId:e}){return`${jt}/projects/${e}/installations`}function ve(e){return{token:e.token,requestStatus:2,expiresIn:Rt(e.expiresIn),creationTime:Date.now()}}async function Ie(e,t){const a=(await t.json()).error;return v.create("request-failed",{requestName:e,serverCode:a.code,serverMessage:a.message,serverStatus:a.status})}function _e({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function kt(e,{refreshToken:t}){const n=_e(e);return n.append("Authorization",Ct(t)),n}async function Te(e){const t=await e();return t.status>=500&&t.status<600?e():t}function Rt(e){return Number(e.replace("s","000"))}function Ct(e){return`${xe} ${e}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ot({appConfig:e,heartbeatServiceProvider:t},{fid:n}){const a=we(e),s=_e(e),r=t.getImmediate({optional:!0});if(r){const d=await r.getHeartbeatsHeader();d&&s.append("x-firebase-client",d)}const o={fid:n,authVersion:xe,appId:e.appId,sdkVersion:ye},c={method:"POST",headers:s,body:JSON.stringify(o)},l=await Te(()=>fetch(a,c));if(l.ok){const d=await l.json();return{fid:d.fid||n,registrationStatus:2,refreshToken:d.refreshToken,authToken:ve(d.authToken)}}else throw await Ie("Create Installation",l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function je(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dt(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lt=/^[cdef][\w-]{21}$/,$="";function Ft(){try{const e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;const n=Nt(e);return Lt.test(n)?n:$}catch{return $}}function Nt(e){return Dt(e).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function O(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ae=new Map;function Se(e,t){const n=O(e);Ee(n,t),zt(n,t)}function Ee(e,t){const n=Ae.get(e);if(n)for(const a of n)a(t)}function zt(e,t){const n=Mt();n&&n.postMessage({key:e,fid:t}),Vt()}let w=null;function Mt(){return!w&&"BroadcastChannel"in self&&(w=new BroadcastChannel("[Firebase] FID Change"),w.onmessage=e=>{Ee(e.data.key,e.data.fid)}),w}function Vt(){Ae.size===0&&w&&(w.close(),w=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $t="firebase-installations-database",qt=1,I="firebase-installations-store";let F=null;function W(){return F||(F=Ue($t,qt,{upgrade:(e,t)=>{switch(t){case 0:e.createObjectStore(I)}}})),F}async function P(e,t){const n=O(e),s=(await W()).transaction(I,"readwrite"),r=s.objectStore(I),o=await r.get(n);return await r.put(t,n),await s.done,(!o||o.fid!==t.fid)&&Se(e,t.fid),t}async function Pe(e){const t=O(e),a=(await W()).transaction(I,"readwrite");await a.objectStore(I).delete(t),await a.done}async function D(e,t){const n=O(e),s=(await W()).transaction(I,"readwrite"),r=s.objectStore(I),o=await r.get(n),c=t(o);return c===void 0?await r.delete(n):await r.put(c,n),await s.done,c&&(!o||o.fid!==c.fid)&&Se(e,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U(e){let t;const n=await D(e.appConfig,a=>{const s=Bt(a),r=Wt(e,s);return t=r.registrationPromise,r.installationEntry});return n.fid===$?{installationEntry:await t}:{installationEntry:n,registrationPromise:t}}function Bt(e){const t=e||{fid:Ft(),registrationStatus:0};return ke(t)}function Wt(e,t){if(t.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(v.create("app-offline"));return{installationEntry:t,registrationPromise:s}}const n={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},a=Ut(e,n);return{installationEntry:n,registrationPromise:a}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:Gt(e)}:{installationEntry:t}}async function Ut(e,t){try{const n=await Ot(e,t);return P(e.appConfig,n)}catch(n){throw be(n)&&n.customData.serverCode===409?await Pe(e.appConfig):await P(e.appConfig,{fid:t.fid,registrationStatus:0}),n}}async function Gt(e){let t=await X(e.appConfig);for(;t.registrationStatus===1;)await je(100),t=await X(e.appConfig);if(t.registrationStatus===0){const{installationEntry:n,registrationPromise:a}=await U(e);return a||n}return t}function X(e){return D(e,t=>{if(!t)throw v.create("installation-not-found");return ke(t)})}function ke(e){return Ht(e)?{fid:e.fid,registrationStatus:0}:e}function Ht(e){return e.registrationStatus===1&&e.registrationTime+me<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kt({appConfig:e,heartbeatServiceProvider:t},n){const a=Yt(e,n),s=kt(e,n),r=t.getImmediate({optional:!0});if(r){const d=await r.getHeartbeatsHeader();d&&s.append("x-firebase-client",d)}const o={installation:{sdkVersion:ye,appId:e.appId}},c={method:"POST",headers:s,body:JSON.stringify(o)},l=await Te(()=>fetch(a,c));if(l.ok){const d=await l.json();return ve(d)}else throw await Ie("Generate Auth Token",l)}function Yt(e,{fid:t}){return`${we(e)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function G(e,t=!1){let n;const a=await D(e.appConfig,r=>{if(!Re(r))throw v.create("not-registered");const o=r.authToken;if(!t&&Xt(o))return r;if(o.requestStatus===1)return n=Jt(e,t),r;{if(!navigator.onLine)throw v.create("app-offline");const c=en(r);return n=Qt(e,c),c}});return n?await n:a.authToken}async function Jt(e,t){let n=await Z(e.appConfig);for(;n.authToken.requestStatus===1;)await je(100),n=await Z(e.appConfig);const a=n.authToken;return a.requestStatus===0?G(e,t):a}function Z(e){return D(e,t=>{if(!Re(t))throw v.create("not-registered");const n=t.authToken;return tn(n)?Object.assign(Object.assign({},t),{authToken:{requestStatus:0}}):t})}async function Qt(e,t){try{const n=await Kt(e,t),a=Object.assign(Object.assign({},t),{authToken:n});return await P(e.appConfig,a),n}catch(n){if(be(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await Pe(e.appConfig);else{const a=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await P(e.appConfig,a)}throw n}}function Re(e){return e!==void 0&&e.registrationStatus===2}function Xt(e){return e.requestStatus===2&&!Zt(e)}function Zt(e){const t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+At}function en(e){const t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},e),{authToken:t})}function tn(e){return e.requestStatus===1&&e.requestTime+me<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nn(e){const t=e,{installationEntry:n,registrationPromise:a}=await U(t);return a?a.catch(console.error):G(t).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function an(e,t=!1){const n=e;return await sn(n),(await G(n,t)).token}async function sn(e){const{registrationPromise:t}=await U(e);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rn(e){if(!e||!e.options)throw N("App Configuration");if(!e.name)throw N("App Name");const t=["projectId","apiKey","appId"];for(const n of t)if(!e.options[n])throw N(n);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function N(e){return v.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ce="installations",on="installations-internal",cn=e=>{const t=e.getProvider("app").getImmediate(),n=rn(t),a=R(t,"heartbeat");return{app:t,appConfig:n,heartbeatServiceProvider:a,_delete:()=>Promise.resolve()}},ln=e=>{const t=e.getProvider("app").getImmediate(),n=R(t,Ce).getImmediate();return{getId:()=>nn(n),getToken:s=>an(n,s)}};function dn(){S(new E(Ce,cn,"PUBLIC")),S(new E(on,ln,"PRIVATE"))}dn();A(he,B);A(he,B,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k="analytics",un="firebase_id",pn="origin",fn=60*1e3,gn="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",H="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const y=new Ge("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hn={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},x=new le("analytics","Analytics",hn);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mn(e){if(!e.startsWith(H)){const t=x.create("invalid-gtag-resource",{gtagURL:e});return y.warn(t.message),""}return e}function Oe(e){return Promise.all(e.map(t=>t.catch(n=>n)))}function yn(e,t){let n;return window.trustedTypes&&(n=window.trustedTypes.createPolicy(e,t)),n}function xn(e,t){const n=yn("firebase-js-sdk-policy",{createScriptURL:mn}),a=document.createElement("script"),s=`${H}?l=${e}&id=${t}`;a.src=n?n==null?void 0:n.createScriptURL(s):s,a.async=!0,document.head.appendChild(a)}function bn(e){let t=[];return Array.isArray(window[e])?t=window[e]:window[e]=t,t}async function wn(e,t,n,a,s,r){const o=a[s];try{if(o)await t[o];else{const l=(await Oe(n)).find(d=>d.measurementId===s);l&&await t[l.appId]}}catch(c){y.error(c)}e("config",s,r)}async function vn(e,t,n,a,s){try{let r=[];if(s&&s.send_to){let o=s.send_to;Array.isArray(o)||(o=[o]);const c=await Oe(n);for(const l of o){const d=c.find(h=>h.measurementId===l),g=d&&t[d.appId];if(g)r.push(g);else{r=[];break}}}r.length===0&&(r=Object.values(t)),await Promise.all(r),e("event",a,s||{})}catch(r){y.error(r)}}function In(e,t,n,a){async function s(r,...o){try{if(r==="event"){const[c,l]=o;await vn(e,t,n,c,l)}else if(r==="config"){const[c,l]=o;await wn(e,t,n,a,c,l)}else if(r==="consent"){const[c,l]=o;e("consent",c,l)}else if(r==="get"){const[c,l,d]=o;e("get",c,l,d)}else if(r==="set"){const[c]=o;e("set",c)}else e(r,...o)}catch(c){y.error(c)}}return s}function _n(e,t,n,a,s){let r=function(...o){window[a].push(arguments)};return window[s]&&typeof window[s]=="function"&&(r=window[s]),window[s]=In(r,e,t,n),{gtagCore:r,wrappedGtag:window[s]}}function Tn(e){const t=window.document.getElementsByTagName("script");for(const n of Object.values(t))if(n.src&&n.src.includes(H)&&n.src.includes(e))return n;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jn=30,An=1e3;class Sn{constructor(t={},n=An){this.throttleMetadata=t,this.intervalMillis=n}getThrottleMetadata(t){return this.throttleMetadata[t]}setThrottleMetadata(t,n){this.throttleMetadata[t]=n}deleteThrottleMetadata(t){delete this.throttleMetadata[t]}}const De=new Sn;function En(e){return new Headers({Accept:"application/json","x-goog-api-key":e})}async function Pn(e){var t;const{appId:n,apiKey:a}=e,s={method:"GET",headers:En(a)},r=gn.replace("{app-id}",n),o=await fetch(r,s);if(o.status!==200&&o.status!==304){let c="";try{const l=await o.json();!((t=l.error)===null||t===void 0)&&t.message&&(c=l.error.message)}catch{}throw x.create("config-fetch-failed",{httpStatus:o.status,responseMessage:c})}return o.json()}async function kn(e,t=De,n){const{appId:a,apiKey:s,measurementId:r}=e.options;if(!a)throw x.create("no-app-id");if(!s){if(r)return{measurementId:r,appId:a};throw x.create("no-api-key")}const o=t.getThrottleMetadata(a)||{backoffCount:0,throttleEndTimeMillis:Date.now()},c=new On;return setTimeout(async()=>{c.abort()},fn),Le({appId:a,apiKey:s,measurementId:r},o,c,t)}async function Le(e,{throttleEndTimeMillis:t,backoffCount:n},a,s=De){var r;const{appId:o,measurementId:c}=e;try{await Rn(a,t)}catch(l){if(c)return y.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${l==null?void 0:l.message}]`),{appId:o,measurementId:c};throw l}try{const l=await Pn(e);return s.deleteThrottleMetadata(o),l}catch(l){const d=l;if(!Cn(d)){if(s.deleteThrottleMetadata(o),c)return y.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${d==null?void 0:d.message}]`),{appId:o,measurementId:c};throw l}const g=Number((r=d==null?void 0:d.customData)===null||r===void 0?void 0:r.httpStatus)===503?K(n,s.intervalMillis,jn):K(n,s.intervalMillis),h={throttleEndTimeMillis:Date.now()+g,backoffCount:n+1};return s.setThrottleMetadata(o,h),y.debug(`Calling attemptFetch again in ${g} millis`),Le(e,h,a,s)}}function Rn(e,t){return new Promise((n,a)=>{const s=Math.max(t-Date.now(),0),r=setTimeout(n,s);e.addEventListener(()=>{clearTimeout(r),a(x.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}function Cn(e){if(!(e instanceof de)||!e.customData)return!1;const t=Number(e.customData.httpStatus);return t===429||t===500||t===503||t===504}class On{constructor(){this.listeners=[]}addEventListener(t){this.listeners.push(t)}abort(){this.listeners.forEach(t=>t())}}async function Dn(e,t,n,a,s){if(s&&s.global){e("event",n,a);return}else{const r=await t,o=Object.assign(Object.assign({},a),{send_to:r});e("event",n,o)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ln(){if(Ke())try{await Ye()}catch(e){return y.warn(x.create("indexeddb-unavailable",{errorInfo:e==null?void 0:e.toString()}).message),!1}else return y.warn(x.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function Fn(e,t,n,a,s,r,o){var c;const l=kn(e);l.then(m=>{n[m.measurementId]=m.appId,e.options.measurementId&&m.measurementId!==e.options.measurementId&&y.warn(`The measurement ID in the local Firebase config (${e.options.measurementId}) does not match the measurement ID fetched from the server (${m.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(m=>y.error(m)),t.push(l);const d=Ln().then(m=>{if(m)return a.getId()}),[g,h]=await Promise.all([l,d]);Tn(r)||xn(r,g.measurementId),s("js",new Date);const b=(c=o==null?void 0:o.config)!==null&&c!==void 0?c:{};return b[pn]="firebase",b.update=!0,h!=null&&(b[un]=h),s("config",g.measurementId,b),g.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nn{constructor(t){this.app=t}_delete(){return delete _[this.app.options.appId],Promise.resolve()}}let _={},ee=[];const te={};let z="dataLayer",zn="gtag",ne,Fe,ie=!1;function Mn(){const e=[];if(He()&&e.push("This is a browser extension environment."),Xe()||e.push("Cookies are not available."),e.length>0){const t=e.map((a,s)=>`(${s+1}) ${a}`).join(" "),n=x.create("invalid-analytics-context",{errorInfo:t});y.warn(n.message)}}function Vn(e,t,n){Mn();const a=e.options.appId;if(!a)throw x.create("no-app-id");if(!e.options.apiKey)if(e.options.measurementId)y.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${e.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw x.create("no-api-key");if(_[a]!=null)throw x.create("already-exists",{id:a});if(!ie){bn(z);const{wrappedGtag:r,gtagCore:o}=_n(_,ee,te,z,zn);Fe=r,ne=o,ie=!0}return _[a]=Fn(e,ee,te,t,ne,z,n),new Nn(e)}function $n(e=Je()){e=ue(e);const t=R(e,k);return t.isInitialized()?t.getImmediate():qn(e)}function qn(e,t={}){const n=R(e,k);if(n.isInitialized()){const s=n.getImmediate();if(Qe(t,n.getOptions()))return s;throw x.create("already-initialized")}return n.initialize({options:t})}function Bn(e,t,n,a){e=ue(e),Dn(Fe,_[e.app.options.appId],t,n,a).catch(s=>y.error(s))}const ae="@firebase/analytics",se="0.10.8";function Wn(){S(new E(k,(t,{options:n})=>{const a=t.getProvider("app").getImmediate(),s=t.getProvider("installations-internal").getImmediate();return Vn(a,s,n)},"PUBLIC")),S(new E("analytics-internal",e,"PRIVATE")),A(ae,se),A(ae,se,"esm2017");function e(t){try{const n=t.getProvider(k).getImmediate();return{logEvent:(a,s,r)=>Bn(n,a,s,r)}}catch(n){throw x.create("interop-component-reg-failed",{reason:n})}}}Wn();const Un={apiKey:"AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA",authDomain:"lynkapp-c7db1.firebaseapp.com",projectId:"lynkapp-c7db1",storageBucket:"lynkapp-c7db1.firebasestorage.app",messagingSenderId:"258552263213",appId:"1:258552263213:web:9ddecf900318ac6c84bea4",measurementId:"G-V82FSK7TYV"},L=Ze(Un),j=et(L),Gn=tt(L);nt(L);typeof window<"u"&&$n(L);function Ne(){const[e,t]=u.useState(!0),{user:n,setUser:a,setUserProfile:s}=T();return u.useEffect(()=>{const r=it(j,async o=>{if(o){a(o);try{const c=at(Gn,"users",o.uid),l=await st(c);if(l.exists())s(l.data());else{const d={uid:o.uid,displayName:o.displayName||"New User",email:o.email,photoURL:o.photoURL||null,bio:"",postsCount:0,followersCount:0,followingCount:0,isVerified:!1,createdAt:Y(),updatedAt:Y()};await rt(c,d),s(d)}}catch(c){console.error("[useAuth] Profile load error:",c)}}else a(null),s(null);t(!1)});return()=>r()},[]),{user:n,loading:e}}function Hn(){const e=q(),[t,n]=u.useState("login"),[a,s]=u.useState(""),[r,o]=u.useState(""),[c,l]=u.useState(""),[d,g]=u.useState(!1);async function h(m){if(m.preventDefault(),!a||!r)return l("Please fill in all fields.");l(""),g(!0);try{t==="login"?await ot(j,a,r):await ct(j,a,r),e("/feed",{replace:!0})}catch(ze){l(ze.message.replace("Firebase: ","").replace(/ \(auth.*\)./,""))}finally{g(!1)}}async function b(){l(""),g(!0);try{await lt(j,new dt),e("/feed",{replace:!0})}catch(m){l(m.message)}finally{g(!1)}}return i.jsx("div",{style:{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",background:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)"},children:i.jsxs("div",{style:{width:"100%",maxWidth:"380px",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"24px",padding:"32px 24px"},children:[i.jsxs("div",{style:{textAlign:"center",marginBottom:"32px"},children:[i.jsx("div",{style:{width:"56px",height:"56px",borderRadius:"14px",margin:"0 auto 12px",background:"linear-gradient(135deg,#6366f1,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px"},children:"⚡"}),i.jsx("h1",{style:{fontSize:"24px",fontWeight:800,background:"linear-gradient(135deg,#6366f1,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"},children:"ConnectHub"}),i.jsx("p",{style:{color:"#94a3b8",marginTop:"4px",fontSize:"14px"},children:t==="login"?"Sign in to your account":"Create your account"})]}),i.jsxs("form",{onSubmit:h,style:{display:"flex",flexDirection:"column",gap:"12px"},children:[i.jsx("input",{className:"input",type:"email",placeholder:"Email address",value:a,onChange:m=>s(m.target.value),autoComplete:"email"}),i.jsx("input",{className:"input",type:"password",placeholder:"Password",value:r,onChange:m=>o(m.target.value),autoComplete:t==="login"?"current-password":"new-password"}),c&&i.jsx("p",{style:{color:"#ef4444",fontSize:"13px",textAlign:"center"},children:c}),i.jsx("button",{className:"btn-primary",type:"submit",disabled:d,style:{marginTop:"4px"},children:d?"Please wait…":t==="login"?"Sign In":"Create Account"})]}),i.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",margin:"16px 0"},children:[i.jsx("div",{style:{flex:1,height:"1px",background:"rgba(255,255,255,0.1)"}}),i.jsx("span",{style:{color:"#64748b",fontSize:"12px"},children:"OR"}),i.jsx("div",{style:{flex:1,height:"1px",background:"rgba(255,255,255,0.1)"}})]}),i.jsxs("button",{className:"btn-secondary",onClick:b,disabled:d,style:{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"},children:[i.jsx("span",{children:"🌐"})," Continue with Google"]}),i.jsxs("p",{style:{textAlign:"center",marginTop:"20px",fontSize:"14px",color:"#94a3b8"},children:[t==="login"?"Don't have an account? ":"Already have an account? ",i.jsx("button",{onClick:()=>{n(t==="login"?"signup":"login"),l("")},style:{color:"#6366f1",fontWeight:600},children:t==="login"?"Sign Up":"Sign In"})]})]})})}const Kn=u.lazy(()=>f(()=>import("./FeedPage-DXB8TMLf.js"),__vite__mapDeps([0,1,2,3,4]))),Yn=u.lazy(()=>f(()=>import("./StoriesPage-BpiKa_Ju.js"),__vite__mapDeps([5,1,4,2]))),Jn=u.lazy(()=>f(()=>import("./LivePage-CzOB2q6I.js"),__vite__mapDeps([6,1,4,2]))),Qn=u.lazy(()=>f(()=>import("./TrendingPage-DwbGCynJ.js"),__vite__mapDeps([7,1,4,2]))),Xn=u.lazy(()=>f(()=>import("./GroupsPage-ApKRmhmB.js"),__vite__mapDeps([8,1,4,2]))),re=u.lazy(()=>f(()=>import("./MessagesPage-D0OQOVEb.js"),__vite__mapDeps([9,1,2,3,4]))),Zn=u.lazy(()=>f(()=>import("./NotificationsPage-BzG1z-96.js"),__vite__mapDeps([10,1,4,2]))),oe=u.lazy(()=>f(()=>import("./ProfilePage-D0Fg-Gtk.js"),__vite__mapDeps([11,1,2,4]))),ei=u.lazy(()=>f(()=>import("./FriendsPage-BI5Ca2xu.js"),__vite__mapDeps([12,1,4,2]))),ti=u.lazy(()=>f(()=>import("./DatingPage-Cf3G6-Mq.js"),__vite__mapDeps([13,1,4,2]))),ni=u.lazy(()=>f(()=>import("./EventsPage-0YFICNOE.js"),__vite__mapDeps([14,1,4,2]))),ii=u.lazy(()=>f(()=>import("./GamingPage-Cs9tiVaA.js"),__vite__mapDeps([15,1,4,2]))),ai=u.lazy(()=>f(()=>import("./MarketplacePage-B6jhe42f.js"),__vite__mapDeps([16,1,4,2]))),si=u.lazy(()=>f(()=>import("./MediaHubPage-BdD9iv4W.js"),__vite__mapDeps([17,1,4,2]))),ri=u.lazy(()=>f(()=>import("./MusicPage-BAHfd95f.js"),__vite__mapDeps([18,1,4,2]))),oi=u.lazy(()=>f(()=>import("./VideoCallsPage-DHX7BiB4.js"),__vite__mapDeps([19,1,4,2]))),ci=u.lazy(()=>f(()=>import("./LiveStreamPage-DNblqB4d.js"),__vite__mapDeps([20,1,4,2]))),li=u.lazy(()=>f(()=>import("./ARVRPage-Po2notF_.js"),__vite__mapDeps([21,1,4,2]))),di=u.lazy(()=>f(()=>import("./SavedPage-BaegrFXK.js"),__vite__mapDeps([22,1,4,2]))),ui=u.lazy(()=>f(()=>import("./SearchPage-DkM0vwxL.js"),__vite__mapDeps([23,1,4,2]))),pi=u.lazy(()=>f(()=>import("./SettingsPage-BKZ4zXgo.js"),__vite__mapDeps([24,1,4,2]))),fi=u.lazy(()=>f(()=>import("./BusinessPage-E6rPLJm-.js"),__vite__mapDeps([25,1,4,2]))),gi=u.lazy(()=>f(()=>import("./CreatorPage-BuMOBaqZ.js"),__vite__mapDeps([26,1,4,2]))),hi=u.lazy(()=>f(()=>import("./HelpPage-CcCrMkbT.js"),__vite__mapDeps([27,1,4,2])));function mi(){return i.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",padding:"40px",flexDirection:"column",gap:"16px"},children:[i.jsx("div",{style:{width:"40px",height:"40px",borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#6366f1",animation:"spin 0.8s linear infinite"}}),i.jsx("span",{style:{color:"#94a3b8",fontSize:"14px"},children:"Loading..."})]})}function yi({children:e}){const{user:t,loading:n}=Ne();return n?i.jsx(ge,{}):t?e:i.jsx(M,{to:"/login",replace:!0})}function xi(){const{loading:e}=Ne();return e?i.jsx(ge,{}):i.jsx(u.Suspense,{fallback:i.jsx(mi,{}),children:i.jsxs($e,{children:[i.jsx(p,{path:"/login",element:i.jsx(Hn,{})}),i.jsxs(p,{path:"/",element:i.jsx(yi,{children:i.jsx(Tt,{})}),children:[i.jsx(p,{index:!0,element:i.jsx(M,{to:"/feed",replace:!0})}),i.jsx(p,{path:"feed",element:i.jsx(Kn,{})}),i.jsx(p,{path:"stories",element:i.jsx(Yn,{})}),i.jsx(p,{path:"live",element:i.jsx(Jn,{})}),i.jsx(p,{path:"trending",element:i.jsx(Qn,{})}),i.jsx(p,{path:"groups",element:i.jsx(Xn,{})}),i.jsx(p,{path:"messages",element:i.jsx(re,{})}),i.jsx(p,{path:"messages/:id",element:i.jsx(re,{})}),i.jsx(p,{path:"notifications",element:i.jsx(Zn,{})}),i.jsx(p,{path:"profile",element:i.jsx(oe,{})}),i.jsx(p,{path:"profile/:uid",element:i.jsx(oe,{})}),i.jsx(p,{path:"friends",element:i.jsx(ei,{})}),i.jsx(p,{path:"dating",element:i.jsx(ti,{})}),i.jsx(p,{path:"events",element:i.jsx(ni,{})}),i.jsx(p,{path:"gaming",element:i.jsx(ii,{})}),i.jsx(p,{path:"marketplace",element:i.jsx(ai,{})}),i.jsx(p,{path:"media",element:i.jsx(si,{})}),i.jsx(p,{path:"music",element:i.jsx(ri,{})}),i.jsx(p,{path:"videocalls",element:i.jsx(oi,{})}),i.jsx(p,{path:"livestream",element:i.jsx(ci,{})}),i.jsx(p,{path:"arvr",element:i.jsx(li,{})}),i.jsx(p,{path:"saved",element:i.jsx(di,{})}),i.jsx(p,{path:"search",element:i.jsx(ui,{})}),i.jsx(p,{path:"settings",element:i.jsx(pi,{})}),i.jsx(p,{path:"business",element:i.jsx(fi,{})}),i.jsx(p,{path:"creator",element:i.jsx(gi,{})}),i.jsx(p,{path:"help",element:i.jsx(hi,{})})]}),i.jsx(p,{path:"*",element:i.jsx(M,{to:"/feed",replace:!0})})]})})}window.addEventListener("error",e=>{console.error("[GlobalError]",e.message,"at",e.filename,":",e.lineno)});window.addEventListener("unhandledrejection",e=>{console.error("[UnhandledPromise]",e.reason),e.preventDefault()});V.createRoot(document.getElementById("root")).render(i.jsx(qe.StrictMode,{children:i.jsx(Be,{children:i.jsx(xi,{})})}));export{Ne as a,Gn as d,i as j,T as u};
