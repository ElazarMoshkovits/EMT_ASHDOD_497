// מראה האתר: מצב כהה/בהיר/אוטומטי וצבע רקע לכל מצב. נטען בראש כל עמוד, לפני הציור, כדי שלא יהיה הבהוב.
(function(){
const KEY='emt497-theme';
const DEFAULT_BG={dark:'#07131c',light:'#eef4f7'};
const HEX=/^#[0-9a-f]{6}$/i;
const clean=v=>HEX.test(v||'')?v.toLowerCase():'';
function read(){
 let raw={};try{raw=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
 return{mode:['dark','light','auto'].includes(raw.mode)?raw.mode:'dark',bgDark:clean(raw.bgDark),bgLight:clean(raw.bgLight)};
}
let cfg=read();
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lum=h=>{const[r,g,b]=rgb(h);return(0.299*r+0.587*g+0.114*b)/255};
const mix=(a,b,t)=>{const x=rgb(a),y=rgb(b);return'#'+x.map((v,i)=>Math.round(v*(1-t)+y[i]*t).toString(16).padStart(2,'0')).join('')};
const mq=window.matchMedia?matchMedia('(prefers-color-scheme: light)'):null;
const name=c=>c.mode==='auto'?(mq&&mq.matches?'light':'dark'):c.mode;
function effective(c=cfg){
 const n=name(c),custom=n==='dark'?c.bgDark:c.bgLight;
 const bg=custom||DEFAULT_BG[n];
 // צבע הטקסט והכרטיסים נקבע לפי בהירות הרקע, גם אם הבחירה לא תואמת את שם המצב.
 return{name:n,bg,custom:!!custom,scheme:lum(bg)>0.5?'light':'dark'};
}
function apply(){
 const e=effective(),light=e.scheme==='light';
 const vars=light
  ?`--fg:16 36 44;--fg-text:#10242c;--sw:8%;--tw:0%;--sbase:${rgb(mix(e.bg,'#ffffff',0.6)).join(' ')};--aw:35%;--atext:#06303a`
  :'--fg:255 255 255;--fg-text:#fff;--sw:100%;--tw:100%;--sbase:238 244 246;--aw:100%;--atext:#06303a';
 const bgRule=(e.custom||light)?`html{background:${e.bg}}body{background:${e.bg} !important}`:'';
 let st=document.getElementById('theme-vars');
 if(!st){st=document.createElement('style');st.id='theme-vars';document.head.appendChild(st)}
 st.textContent=`:root{${vars};color-scheme:${e.scheme}}${bgRule}`;
 document.documentElement.dataset.theme=e.scheme;
 const set=(n,v)=>{let m=document.querySelector(`meta[name="${n}"]`);if(m)m.setAttribute('content',v)};
 set('color-scheme',e.scheme);set('theme-color',e.bg);
}
function set(patch){
 const next=Object.assign({},cfg,patch);
 cfg={mode:['dark','light','auto'].includes(next.mode)?next.mode:'dark',bgDark:clean(next.bgDark),bgLight:clean(next.bgLight)};
 try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}
 apply();
}
if(mq){const on=()=>{if(cfg.mode==='auto')apply()};mq.addEventListener?mq.addEventListener('change',on):mq.addListener&&mq.addListener(on)}
window.addEventListener('storage',e=>{if(e.key===KEY){cfg=read();apply()}});
window.Theme={get:()=>Object.assign({},cfg),set,effective,defaults:DEFAULT_BG};
apply();
})();
