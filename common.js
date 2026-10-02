// תשתית משותפת לכל עמודי האתר: פרופיל, בנק טעויות, כותרת, הגדרות, חלונות וצלילים.
(function(){
const KEY='medicQuestProfile';
const DAY=86400000;
const A_IDS=['basics','terms','nerves','breathing','heart','cpr','cprkeys','aed','kids','choking','field','final','org'];
const B_COUNT=7;
const MAX_STARS=(A_IDS.length+B_COUNT)*3;
const REVIEW_GAPS=[1,3];// ימים עד החזרה הבאה אחרי תשובה נכונה ראשונה ושנייה
const DEFAULT_NAME='חובש/ת';

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const dayStart=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};

function fresh(){return{schema:4,name:DEFAULT_NAME,xp:0,sound:false,timer:true,seen:{},bank:{},saved:[],legacyStars:{},starCache:{},simBest:{},resusBest:{},seqBest:{},memoryWins:0,drillBest:{},examBest:{},guideSeen:false,last:null,resume:{},days:{}}}

// המרה מהמבנה הישן של הפרופיל. שאלות חלק א׳ נשמרו לפי טקסט, ולכן ההמרה שלהן נגמרת בעמוד חלק א׳.
function migrate(raw){
 if(raw&&raw.schema===4)return Object.assign(fresh(),raw);
 const p=fresh();
 if(!raw||!Object.keys(raw).length)return p;
 p.name=raw.name||DEFAULT_NAME;p.xp=Number(raw.xp)||0;p.sound=raw.sound!==false;p.memoryWins=Number(raw.memoryWins)||0;
 if(raw.categoryOrderVersion===3)Object.entries(raw.stars||{}).forEach(([i,v])=>{if(A_IDS[i]&&v)p.legacyStars['a:'+A_IDS[i]]=Number(v)});
 Object.entries(raw.part2Stars||{}).forEach(([i,v])=>{if(v)p.legacyStars['b:'+i]=Number(v)});
 const now=Date.now();
 (raw.part2Mistakes||[]).forEach(id=>{p.bank[id]={box:0,due:now}});
 p.saved=(raw.part2SavedReview||[]).slice();
 const texts=list=>(list||[]).map(x=>x&&x.text).filter(Boolean);
 p.pendingA={mistakes:texts(raw.mistakes),saved:texts(raw.savedReview)};
 p.simBest=Object.assign({},raw.anamnesisBest||{});p.resusBest=Object.assign({},raw.scenarioBest||{});p.seqBest=Object.assign({},raw.sequenceBest||{});
 return p;
}
function load(){let raw={};try{raw=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){raw={}}return migrate(raw)}
let profile=load();
const listeners=[];
function save(){try{localStorage.setItem(KEY,JSON.stringify(profile))}catch(e){}refreshHeader();listeners.forEach(fn=>{try{fn()}catch(e){}})}
function onChange(fn){listeners.push(fn)}
window.addEventListener('storage',e=>{if(e.key===KEY){profile=load();Course.profile=profile;refreshHeader();listeners.forEach(fn=>{try{fn()}catch(err){}})}});

// ---- תשובות ובנק טעויות (חזרה מרווחת: שלוש תשובות נכונות בשלושה ימים שונים) ----
function dayKey(t){const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
// יומן פעילות: כמה תשובות נרשמו בכל יום (נשמר 120 ימים אחרונים)
function logDay(now){
 const days=profile.days||(profile.days={}),k=dayKey(now),e=days[k]||(days[k]={n:0,c:0});
 e.n++;
 const keys=Object.keys(days);if(keys.length>120){keys.sort().slice(0,keys.length-120).forEach(x=>delete days[x])}
 return e;
}
function record(id,ok){
 const now=Date.now(),s=profile.seen[id]||(profile.seen[id]={n:0,c:0});
 s.n++;if(ok)s.c++;s.ok=!!ok;s.last=now;
 const day=logDay(now);if(ok)day.c++;
 const entry=profile.bank[id];
 if(!ok){profile.bank[id]={box:0,due:now};return 'banked'}
 if(!entry)return 'ok';
 if(now<entry.due)return 'early';
 entry.box++;
 if(entry.box>REVIEW_GAPS.length){delete profile.bank[id];return 'graduated'}
 entry.due=dayStart(now)+REVIEW_GAPS[entry.box-1]*DAY;
 return 'advanced';
}
function bankInfo(prefix){
 const now=Date.now();let total=0,due=0;
 Object.entries(profile.bank).forEach(([id,e])=>{if(!prefix||prefix(id)){total++;if(e.due<=now)due++}});
 return{total,due};
}
function bankIds(prefix){const now=Date.now();return Object.entries(profile.bank).filter(([id])=>!prefix||prefix(id)).sort((a,b)=>a[1].due-b[1].due).map(([id,e])=>({id,due:e.due<=now,box:e.box}))}
function isSaved(id){return profile.saved.includes(id)}
function toggleSaved(id){const i=profile.saved.indexOf(id);if(i>=0)profile.saved.splice(i,1);else profile.saved.push(id);save();return i<0}

// כוכבים לפי אחוז השאלות בקטגוריה שהתשובה האחרונה עליהן נכונה. כוכבים ישנים נשמרים כרצפה.
function starsFor(key,ids){
 const ok=ids.filter(id=>profile.seen[id]&&profile.seen[id].ok).length,share=ids.length?ok/ids.length:0;
 const computed=share>=.9?3:share>=.75?2:share>=.5?1:0;
 const stars=Math.max(computed,Number(profile.legacyStars[key])||0);
 if(profile.starCache[key]!==stars){profile.starCache[key]=stars}
 return stars;
}
function coverage(ids){const seen=ids.filter(id=>profile.seen[id]).length,ok=ids.filter(id=>profile.seen[id]&&profile.seen[id].ok).length;return{seen,ok,total:ids.length}}
function starTotals(){
 const sum=pre=>Object.entries(Object.assign({},profile.legacyStars,profile.starCache)).filter(([k])=>k.startsWith(pre)).reduce((t,[k])=>t+Math.max(Number(profile.starCache[k])||0,Number(profile.legacyStars[k])||0),0);
 const a=sum('a:'),b=sum('b:');return{a,b,total:a+b,maxA:A_IDS.length*3,maxB:B_COUNT*3,max:MAX_STARS};
}
// תרגול חולשות: טעויות שהגיע זמנן, ואחריהן שאלות שעוד לא נענו נכון מהנושאים עם הדיוק הנמוך ביותר.
// groups: [{name, ids:[...]}]; isPart: סינון בנק הטעויות לחלק הנוכחי.
function weakPlan(groups,isPart,max=20){
 const stat=g=>{let n=0,c=0;g.ids.forEach(id=>{const s=profile.seen[id];if(s){n+=s.n;c+=s.c}});return{g,n,acc:n?c/n:1,ok:g.ids.filter(id=>profile.seen[id]&&profile.seen[id].ok).length}};
 const all=groups.map(stat);
 const answered=all.filter(x=>x.n>=3).sort((a,b)=>a.acc-b.acc);
 const picked=answered.slice(0,3);
 if(picked.length<3)all.filter(x=>!picked.includes(x)&&x.ok<x.g.ids.length).sort((a,b)=>a.ok/a.g.ids.length-b.ok/b.g.ids.length).slice(0,3-picked.length).forEach(x=>picked.push(x));
 const out=[],add=id=>{if(id&&out.length<max&&!out.includes(id))out.push(id)};
 bankIds(isPart).filter(x=>x.due).slice(0,8).forEach(x=>add(x.id));
 const open=picked.map(x=>shuffle(x.g.ids.filter(id=>!(profile.seen[id]&&profile.seen[id].ok))));
 for(let r=0;r<4;r++)open.forEach(list=>add(list[r]));
 open.forEach(list=>list.forEach(add));
 picked.forEach(x=>shuffle(x.g.ids).forEach(add));
 return{ids:shuffle(out),names:picked.map(x=>x.g.name)};
}
function addXp(n){profile.xp=(Number(profile.xp)||0)+Math.max(0,Math.round(n))}
function setLast(href,label){profile.last={href,label,ts:Date.now()};save()}

// ---- צלילים ----
let audio=null;
function tone(freq,delay=0,dur=.12,vol=.035,type='sine',end=freq){
 audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();
 const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);if(end!==freq)o.frequency.exponentialRampToValueAtTime(end,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+dur);
}
function beep(kind){
 if(!profile.sound)return;
 try{
  if(kind==='ok'){tone(520,0,.14,.05,'sine',850)}
  else if(kind==='bad'){tone(190,0,.22,.05,'sine',120)}
  else if(kind==='win'){tone(523,0,.18,.03);tone(659,.11,.2,.03);tone(784,.22,.32,.032)}
  else if(kind==='click'){tone(390,0,.045,.016,'sine',460)}
  else if(kind==='fact'){tone(510,0,.1,.028);tone(680,.075,.14,.025)}
  else if(kind==='unlock'){tone(440,0,.1,.026);tone(660,.075,.12,.028);tone(880,.15,.16,.024)}
  else if(kind==='warning'){tone(210,0,.2,.035,'triangle',145);tone(180,.16,.22,.03,'triangle',120)}
  else if(kind==='deterioration'){tone(340,0,.22,.04,'sawtooth',180);tone(300,.25,.24,.038,'sawtooth',150)}
 }catch(e){}
}

// ---- הודעה קצרה ----
let toastTimer=null;
function toast(msg,bad){
 let el=document.getElementById('c-toast');
 if(!el){el=document.createElement('div');el.id='c-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el)}
 el.className='c-toast'+(bad?' bad':'');el.textContent=msg;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},3200);
}

// ---- חלונות ----
let lastFocus=null;
function openModal(html,opts={}){
 closeModal(true);lastFocus=document.activeElement;
 const wrap=document.createElement('div');wrap.className='c-modal';wrap.id='c-modal';
 wrap.innerHTML=`<div class="c-modal-card${opts.wide?' wide':''}" role="dialog" aria-modal="true"${opts.label?` aria-label="${esc(opts.label)}"`:''}>${opts.closable===false?'':'<button class="c-close" type="button" data-close aria-label="סגירה">✕</button>'}${html}</div>`;
 document.body.appendChild(wrap);document.body.classList.add('c-locked');
 wrap.addEventListener('click',e=>{if(e.target===wrap&&opts.closable!==false)closeModal();if(e.target.closest('[data-close]'))closeModal()});
 wrap._onClose=opts.onClose;
 const first=wrap.querySelector('[autofocus]')||wrap.querySelector('.c-modal-card button:not(.c-close), .c-modal-card input, .c-modal-card a')||wrap.querySelector('button');
 setTimeout(()=>first&&first.focus(),20);
 return wrap.querySelector('.c-modal-card');
}
function closeModal(silent){
 const wrap=document.getElementById('c-modal');if(!wrap)return;
 const cb=wrap._onClose;wrap.remove();document.body.classList.remove('c-locked');
 if(!silent){if(cb)cb();if(lastFocus&&lastFocus.focus)lastFocus.focus()}
}
function modalOpen(){return !!document.getElementById('c-modal')}
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&modalOpen()){const card=document.querySelector('#c-modal .c-close');if(card)closeModal()}
 // מקש Tab נשאר בתוך החלון הפתוח ולא בורח לדף שמאחוריו
 if(e.key==='Tab'&&modalOpen()){
  const wrap=document.getElementById('c-modal'),items=[...wrap.querySelectorAll('button,[href],input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.getClientRects().length>0&&(el.tagName==='SUMMARY'||!el.closest('details:not([open])')));
  if(!items.length)return;
  const first=items[0],last=items[items.length-1],inside=wrap.contains(document.activeElement);
  if(!inside||(e.shiftKey&&document.activeElement===first)){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});
function confirmDialog(title,text,okLabel='אישור',cancelLabel='ביטול',danger=false){
 return new Promise(resolve=>{
  let answered=false;
  const card=openModal(`<h2>${esc(title)}</h2>${text?`<p>${text}</p>`:''}<div class="c-actions"><button class="c-btn ${danger?'danger':'primary'}" type="button" data-ok>${esc(okLabel)}</button><button class="c-btn" type="button" data-cancel>${esc(cancelLabel)}</button></div>`,{onClose:()=>{if(!answered)resolve(false)}});
  card.querySelector('[data-ok]').onclick=()=>{answered=true;closeModal(true);resolve(true)};
  card.querySelector('[data-cancel]').onclick=()=>{answered=true;closeModal(true);resolve(false)};
 });
}

// ---- כותרת עליונה ----
let headerOpts={};
function mountHeader(opts={}){
 headerOpts=opts;
 let header=document.querySelector('.course-topbar');
 if(!header){header=document.createElement('header');(opts.host||document.querySelector('.app-shell')||document.body).prepend(header)}
 header.className='course-topbar';
 header.innerHTML=`<a class="course-brand" href="index.html" aria-label="לדף הבית"><span class="course-logo" aria-hidden="true">✚</span><span><b>קורס חובשים 497</b><small data-h-sub></small></span></a><div class="course-counters"><span class="course-pill" data-h-xp title="נקודות"></span><span class="course-pill" data-h-stars title="כוכבים בכל הקורס"></span><button class="course-icon" type="button" data-h-settings aria-label="הגדרות">⚙</button></div>`;
 header.querySelector('[data-h-settings]').onclick=openSettings;
 refreshHeader();
}
function refreshHeader(){
 const h=document.querySelector('.course-topbar');if(!h||!h.querySelector('[data-h-xp]'))return;
 const st=starTotals();
 h.querySelector('[data-h-xp]').innerHTML=`<b>${(Number(profile.xp)||0).toLocaleString('he-IL')}</b> נק׳`;
 h.querySelector('[data-h-stars]').innerHTML=`<b>${st.total}/${st.max}</b> <span aria-hidden="true">★</span>`;
 h.querySelector('[data-h-stars]').setAttribute('aria-label',`${st.total} כוכבים מתוך ${st.max}`);
 const sub=h.querySelector('[data-h-sub]');if(sub)sub.textContent=headerOpts.subtitle||(profile.name!==DEFAULT_NAME?`שלום, ${profile.name}`:'אשדוד');
}

// ---- הגדרות ואיפוס ----
const RESET_SCOPES={
 a:{label:'חלק א׳',text:'הכוכבים, התשובות, הטעויות והשאלות השמורות של חלק א׳, וגם השיאים בתרחישי ההחייאה, בסדר הטיפול, במשחק הזיכרון ובתרגולי הידיים.'},
 b:{label:'חלק ב׳',text:'הכוכבים, התשובות, הטעויות והשאלות השמורות של חלק ב׳, וגם השיאים בתרחישים המתפצלים.'},
 sim:{label:'הסימולטור',text:'הציונים הטובים ביותר בתרחישי האנמנזה.'},
 all:{label:'הכול',text:'כל ההתקדמות בשני החלקים ובסימולטור, כולל הנקודות. השם וההגדרות נשארים.'}
};
const isA=id=>!id.startsWith('p2-');
function resetScope(scope){
 const dropIds=pred=>{Object.keys(profile.seen).forEach(id=>{if(pred(id))delete profile.seen[id]});Object.keys(profile.bank).forEach(id=>{if(pred(id))delete profile.bank[id]});profile.saved=profile.saved.filter(id=>!pred(id))};
 const dropStars=pre=>{[profile.legacyStars,profile.starCache].forEach(o=>Object.keys(o).forEach(k=>{if(k.startsWith(pre))delete o[k]}))};
 if(scope==='a'||scope==='all'){dropIds(isA);dropStars('a:');profile.resusBest={};profile.seqBest={};profile.drillBest={};profile.memoryWins=0;delete profile.examBest.a;delete profile.resume.a;delete profile.pendingA}
 if(scope==='b'||scope==='all'){dropIds(id=>!isA(id));dropStars('b:');if(profile.drillBest)delete profile.drillBest.branch2;delete profile.examBest.b;delete profile.resume.b}
 if(scope==='sim'||scope==='all'){profile.simBest={};delete profile.resume.sim}
 if(scope==='all'){profile.xp=0;profile.last=null;profile.days={}}
 save();
}
// ---- גיבוי ושחזור ----
const BACKUP_MAX=2*1024*1024;
function exportBackup(){
 const data=JSON.stringify({app:'emt-497',exported:new Date().toISOString(),profile},null,1);
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 a.download=`חובשים-497-גיבוי-${dayKey(Date.now())}.json`;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
// לוקחים רק שדות מוכרים מהסוג הנכון, כדי שקובץ פגום או זר לא ישבש את הפרופיל.
function cleanBackup(raw){
 const src=raw&&raw.profile&&typeof raw.profile==='object'?raw.profile:raw;
 if(!src||typeof src!=='object'||src.schema!==4||typeof src.seen!=='object'||src.seen===null)return null;
 const base=fresh(),out=fresh();
 Object.keys(base).forEach(k=>{
  const v=src[k];if(v===undefined)return;
  const want=base[k];
  if(Array.isArray(want)){if(Array.isArray(v))out[k]=v.filter(x=>typeof x==='string')}
  else if(want&&typeof want==='object'){if(v&&typeof v==='object'&&!Array.isArray(v))out[k]=v}
  else if(typeof want==='number'){if(Number.isFinite(Number(v)))out[k]=Number(v)}
  else if(typeof want==='boolean'){out[k]=!!v}
  else if(typeof want==='string'){if(typeof v==='string')out[k]=v.slice(0,24)}
  else if(want===null){out[k]=v&&typeof v==='object'?v:null}
 });
 return out;
}
function importBackup(file){
 if(!file)return;
 if(file.size>BACKUP_MAX){toast('הקובץ גדול מדי ולא נראה כמו גיבוי של האתר',true);return}
 const reader=new FileReader();
 reader.onerror=()=>toast('לא הצלחנו לקרוא את הקובץ',true);
 reader.onload=async()=>{
  let raw=null;try{raw=JSON.parse(reader.result)}catch(e){}
  const next=cleanBackup(raw);
  if(!next){toast('זה לא קובץ גיבוי תקין של האתר',true);return}
  const answered=Object.keys(next.seen).length;
  const ok=await confirmDialog('לשחזר מהגיבוי?',`הגיבוי כולל ${answered} שאלות שנענו ו־${(Number(next.xp)||0).toLocaleString('he-IL')} נקודות. ההתקדמות הנוכחית בדפדפן הזה תוחלף בו. אי אפשר לבטל את זה.`,'כן, לשחזר','לא',true);
  if(!ok)return;
  profile=next;Course.profile=profile;save();toast('השחזור הושלם');setTimeout(()=>location.reload(),700);
 };
 reader.readAsText(file);
}
function openSettings(){
 const card=openModal(`<h2>הגדרות</h2>
  <label class="c-field"><span>השם שיופיע באתר ובסיכומים</span><input type="text" maxlength="24" data-set-name value="${esc(profile.name===DEFAULT_NAME?'':profile.name)}" placeholder="השם שלך"></label>
  <label class="c-switch"><input type="checkbox" data-set-sound ${profile.sound?'checked':''}><span>צלילים</span></label>
  <label class="c-switch"><input type="checkbox" data-set-timer ${profile.timer?'checked':''}><span>שעון לכל שאלה (25–35 שניות)</span></label>
  <p class="c-note">בלי שעון אפשר לקרוא כל שאלה בנחת. במבחן לדוגמה יש שעון כללי בכל מקרה.</p>
  <div class="c-actions"><button class="c-btn primary" type="button" data-set-save>שמירה</button></div>
  <details class="c-reset"><summary>גיבוי ושחזור</summary><p class="c-note">ההתקדמות נשמרת רק בדפדפן הזה. כדי לא לאבד אותה כשמחליפים טלפון או מנקים נתוני דפדפן, שמרו גיבוי, ובמכשיר החדש שחזרו ממנו.</p><div class="c-reset-grid"><button class="c-btn" type="button" data-backup-export>שמירת גיבוי</button><button class="c-btn" type="button" data-backup-import>שחזור מגיבוי</button></div><input type="file" accept="application/json,.json" data-backup-file hidden></details>
  <details class="c-reset"><summary>איפוס התקדמות</summary><p class="c-note">ההתקדמות נשמרת רק בדפדפן הזה.</p><div class="c-reset-grid">${Object.entries(RESET_SCOPES).map(([k,v])=>`<button class="c-btn${k==='all'?' danger':''}" type="button" data-reset="${k}">איפוס ${v.label}</button>`).join('')}</div></details>`,{label:'הגדרות'});
 card.querySelector("[data-set-save]").onclick=()=>{profile.name=card.querySelector("[data-set-name]").value.trim()||DEFAULT_NAME;profile.sound=card.querySelector("[data-set-sound]").checked;profile.timer=card.querySelector("[data-set-timer]").checked;save();closeModal();toast('נשמר')};
 card.querySelector('[data-backup-export]').onclick=()=>{exportBackup();toast('הגיבוי נשמר בקובץ')};
 const fileInput=card.querySelector('[data-backup-file]');
 card.querySelector('[data-backup-import]').onclick=()=>fileInput.click();
 fileInput.onchange=()=>importBackup(fileInput.files[0]);
 card.querySelectorAll('[data-reset]').forEach(b=>b.onclick=async()=>{
  const scope=b.dataset.reset,info=RESET_SCOPES[scope];
  const ok=await confirmDialog(`לאפס את ${info.label}?`,`יימחקו: ${esc(info.text)}<br>אי אפשר לבטל את זה.`,'כן, לאפס','לא',true);
  if(ok){resetScope(scope);toast(`${info.label}: ההתקדמות אופסה`);setTimeout(()=>location.reload(),700)}
 });
}

// ---- ניווט: כפתור "חזרה" של הדפדפן ----
const nav={
 handlers:null,
 init(handler){this.handler=handler;window.addEventListener('popstate',e=>{if(modalOpen())closeModal(true);handler((e.state&&e.state.view)||'home',e.state||{})})},
 push(view,extra={}){history.pushState(Object.assign({view},extra),'','#'+view)},
 home(){if(history.state&&history.state.view&&history.state.view!=='home'){history.back()}else{history.replaceState({view:'home'},'',location.pathname+location.search)}}
};

function footer(){return `<footer class="course-footer"><span>הוכן על ידי אלעזר מושקוביץ עבור קורס חובשים אשדוד 497</span><span>עזר ללמידה לקראת המבחן ולשטח. לא מחליף את חומר הקורס ואת ההנחיות של המדריך ר׳ יחיאל מייברג.</span><a class="footer-terms-link" href="terms.html">תקנון האתר</a></footer>`}

window.Course={get profile(){return profile},set profile(v){profile=v},save,onChange,record,bankInfo,bankIds,isSaved,toggleSaved,starsFor,coverage,starTotals,weakPlan,addXp,setLast,beep,toast,openModal,closeModal,modalOpen,confirm:confirmDialog,mountHeader,refreshHeader,openSettings,resetScope,nav,esc,shuffle,footer,DEFAULT_NAME,A_IDS,DAY,dayKey};
})();
