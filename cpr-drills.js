// חלק א׳: תרגולי ידיים בזמן אמת. מאמן קצב עיסויים, ומחזור החייאה עם AED שמודד כמה זמן הידיים היו על החזה.
(function(){
const {esc,shuffle}=Course;
const now=()=>performance.now();
let host=null,opts={},timers=[],keys=null;

// ---- עזרים משותפים ----
function stop(){
 timers.forEach(t=>{clearTimeout(t);clearInterval(t)});timers=[];stopMetronome();
 if(keys){document.removeEventListener('keydown',keys.down);document.removeEventListener('keyup',keys.up);window.removeEventListener('blur',keys.blur);document.removeEventListener('visibilitychange',keys.blur);keys=null}
}
const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t};
const every=(fn,ms)=>{const t=setInterval(fn,ms);timers.push(t);return t};
const $=s=>host.querySelector(s);
const sec=ms=>(ms/1000).toFixed(1);
const clock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
const head=(title,right,pct)=>`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לתפריט">✕</button><div class="progress-wrap"><div class="progress-label"><span>${title}</span><span data-hr>${right}</span></div>${pct==null?'':`<div class="progress"><i data-bar style="width:${pct}%"></i></div>`}</div></header>`;
const choice=(group,items,on)=>`<div class="setup-grid${items.length===2?' two':''}" data-group="${group}">${items.map(([k,icon,t,d])=>`<button class="setup-choice${k===on?' on':''}" type="button" data-k="${k}" aria-pressed="${k===on}"><span aria-hidden="true">${icon}</span><b>${t}</b><small>${d}</small></button>`).join('')}</div>`;
function bindChoices(state){
 host.querySelectorAll('[data-group]').forEach(g=>g.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
  state[g.dataset.group]=b.dataset.k;g.querySelectorAll('[data-k]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});
 }));
}
// מקש רווח מחליף את המשטח. keyup נחסם כדי שרווח על כפתור ממוקד לא ילחץ עליו.
function bindKeys(down,up){
 keys={down:e=>{if(e.code!=='Space')return;e.preventDefault();if(!e.repeat)down()},up:e=>{if(e.code!=='Space')return;e.preventDefault();if(up)up()},blur:()=>{if(up)up()}};
 document.addEventListener('keydown',keys.down);document.addEventListener('keyup',keys.up);window.addEventListener('blur',keys.blur);document.addEventListener('visibilitychange',keys.blur);
}
function saveBest(key,pct,xp){
 const p=Course.profile;p.drillBest=p.drillBest||{};p.drillBest[key]=Math.max(p.drillBest[key]||0,pct);Course.addXp(xp);Course.save();Course.beep('win');
}
const bestOf=key=>(Course.profile.drillBest||{})[key];

// ---- מטרונום: צליל נפרד מהגדרת הצלילים, כי השחקן בוחר בו במפורש ----
let ctx=null,metro=null;
function audio(){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}catch(e){return null}}
function tick(at,vol){const a=ctx,o=a.createOscillator(),g=a.createGain();o.frequency.value=1050;g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.0001,at+.05);o.connect(g);g.connect(a.destination);o.start(at);o.stop(at+.06)}
function startMetronome(bpm,volume){
 const a=audio();if(!a)return;const beat=60/bpm;let next=a.currentTime+.15;
 metro=setInterval(()=>{while(next<a.currentTime+.12){const v=volume();if(v>0)tick(next,v);next+=beat}},25);
}
function stopMetronome(){if(metro){clearInterval(metro);metro=null}}

// =====================================================================
// מאמן קצב עיסויים
// =====================================================================
const PER_CYCLE=30,GAP_MS=1500,PAUSE_GOAL=10000;
let R=null;
const rateOf=ms=>60000/ms;
const band=r=>r<100?'slow':r>120?'fast':'good';

function rhythm(h,o){
 stop();host=h;opts=o||{};
 const cfg=R&&R.cfg?R.cfg:{metro:'on',cycles:'5'},best=bestOf('rhythm');
 host.innerHTML=`${head('🥁 מאמן קצב עיסויים',best!=null?`שיא ${best}%`:'הגדרות')}<article class="quiz-card"><h2 class="question">מקישים בקצב של העיסויים</h2><p class="muted">מקישים על המשטח הגדול (או על מקש הרווח) עם כל לחיצה על החזה. אחרי 30 עיסויים נותנים 2 הנשמות וחוזרים מהר לעסות. היעד: 100–120 בדקה, ועד 10 שניות בלי עיסויים בזמן ההנשמות.</p>
 <h3 class="drill-sub">מטרונום</h3>${choice('metro',[['on','🔊','מטרונום','צליל בכל לחיצה, לאורך כל התרגול'],['fade','🔉','נעלם בהדרגה','נותן את הקצב בהתחלה ונעלם אחרי 30 לחיצות'],['off','🔇','בלי מטרונום','שומרים על הקצב לבד']],cfg.metro)}
 <h3 class="drill-sub">אורך</h3>${choice('cycles',[['1','1️⃣','סדרה אחת','30 עיסויים'],['5','🔁','5 סדרות','30:2 חמש פעמים, כשתי דקות']],cfg.cycles)}
 <p class="drill-note">הטלפון מודד קצב, לא עומק. אם מתרגלים על בובה או על כרית ומקישים ביד השנייה: לוחצים 5–6 ס״מ ומשחררים את החזה עד הסוף בכל לחיצה.</p>
 <div class="c-actions"><button class="c-btn primary" type="button" data-start>להתחיל</button></div></article>`;
 $('[data-back]').onclick=opts.onExit;
 bindChoices(cfg);
 $('[data-start]').onclick=()=>rhythmPlay(cfg);
}

function rhythmPlay(cfg){
 stop();
 R={cfg,cycles:+cfg.cycles,cycle:0,count:0,phase:'compress',last:null,recent:[],intervals:[],gaps:[],pauses:[],pauseStart:null,breaths:0,breathAt:0,fastBreaths:0,started:false};
 host.innerHTML=`${head('🥁 מאמן קצב עיסויים',`סדרה 1 מתוך ${R.cycles}`,0)}<article class="quiz-card drill">
 <div class="drill-top"><div class="drill-box"><b data-count>0</b><small>מתוך 30 עיסויים</small></div><div class="drill-box" data-ratebox><b data-rate>—</b><small data-ratelbl>לחיצות בדקה</small></div></div>
 <div class="rate-gauge" aria-hidden="true"><span class="zone"></span><i data-needle></i><em style="left:0">60</em><em style="left:40%">100</em><em style="left:60%">120</em><em style="left:100%">160</em></div>
 <p class="drill-msg" data-msg aria-live="polite">הקישו כדי להתחיל. הספירה מתחילה בלחיצה הראשונה.</p>
 <button class="press-pad" type="button" data-pad aria-label="לחיצה על החזה">לחיצה</button></article>`;
 $('[data-back]').onclick=()=>{stop();rhythm(host,opts)};
 const pad=$('[data-pad]');
 pad.addEventListener('pointerdown',e=>{e.preventDefault();rhythmTap()});
 pad.addEventListener('contextmenu',e=>e.preventDefault());
 bindKeys(rhythmTap);
 if(cfg.metro!=='off')startMetronome(110,()=>{
  if(!R||R.phase!=='compress')return 0;
  if(cfg.metro==='on')return .22;
  const n=R.cycle*PER_CYCLE+R.count;return n<15?.22:n<30?.22*(30-n)/15:0;
 });
 // מונה ההפסקה בזמן ההנשמות, ותזכורת כשהעיסויים נעצרים באמצע סדרה.
 every(()=>{
  if(!R)return;const t=now();
  if(R.phase==='breaths'){const ms=t-R.pauseStart;$('[data-rate]').textContent=sec(ms);$('[data-ratebox]').className='drill-box'+(ms>PAUSE_GOAL?' bad':'');}
  else if(R.count>0&&R.last&&t-R.last>2500)msg('ממשיכים לעסות! כל הפסקה מורידה את לחץ הדם שהעיסויים בנו.','bad');
 },100);
}

function msg(text,kind){const m=$('[data-msg]');if(m){m.textContent=text;m.className='drill-msg'+(kind?' '+kind:'')}}

function rhythmTap(){
 if(!R||R.phase==='done')return;
 const t=now(),pad=$('[data-pad]');
 pad.classList.remove('hit');void pad.offsetWidth;pad.classList.add('hit');
 if(R.phase==='breaths'){
  if(R.breaths===1&&t-R.breathAt<800)R.fastBreaths++;
  R.breaths++;R.breathAt=t;
  if(R.breaths<2){pad.textContent='הנשמה 2 מתוך 2';msg('הנשמה אחת כשנייה, עד שהחזה עולה.');return}
  R.phase='compress';pad.classList.remove('breath');pad.textContent='לחיצה';pad.setAttribute('aria-label','לחיצה על החזה');
  $('[data-ratelbl]').textContent='לחיצות בדקה';$('[data-rate]').textContent='—';$('[data-ratebox]').className='drill-box';
  msg('חוזרים לעסות, מהר!');return;
 }
 if(R.count===0&&R.pauseStart!=null){R.pauses.push(t-R.pauseStart);R.pauseStart=null}
 if(R.count>0){const d=t-R.last;if(d>GAP_MS)R.gaps.push(d);else{R.intervals.push(d);R.recent.push(d);if(R.recent.length>4)R.recent.shift()}}
 R.count++;R.last=t;
 $('[data-count]').textContent=R.count;
 if(R.recent.length){
  const r=rateOf(R.recent.reduce((a,b)=>a+b,0)/R.recent.length),b=band(r);
  $('[data-rate]').textContent=Math.round(r);$('[data-ratebox]').className='drill-box '+b;
  const n=$('[data-needle]');n.style.left=Math.min(100,Math.max(0,(r-60)))+'%';n.style.opacity=1;
  msg(b==='slow'?'מהר יותר':b==='fast'?'לאט יותר, תנו לחזה לחזור למקום':'קצב טוב, ממשיכים','good'===b?'good':'warn');
 }else msg('ממשיכים בקצב קבוע.');
 if(R.count<PER_CYCLE)return;
 // סוף סדרה
 R.cycle++;$('[data-bar]').style.width=R.cycle/R.cycles*100+'%';
 if(R.cycle>=R.cycles){rhythmFinish();return}
 R.phase='breaths';R.breaths=0;R.count=0;R.recent=[];R.pauseStart=t;
 $('[data-hr]').textContent=`סדרה ${R.cycle+1} מתוך ${R.cycles}`;$('[data-count]').textContent=0;
 pad.classList.add('breath');pad.textContent='הנשמה 1 מתוך 2';pad.setAttribute('aria-label','הנשמה');
 $('[data-ratelbl]').textContent='שניות בלי עיסויים';$('[data-needle]').style.opacity=0;
 msg('30! עכשיו 2 הנשמות, והשעון רץ.');Course.beep('click');
}

function rhythmFinish(){
 R.phase='done';stop();
 const iv=R.intervals,avg=iv.length?rateOf(iv.reduce((a,b)=>a+b,0)/iv.length):0;
 // קצב לכל לחיצה, מוחלק על פני שני מרווחים כדי לנטרל רעד של מגע.
 const rates=iv.map((d,i)=>rateOf(i?(d+iv[i-1])/2:d)),split={slow:0,good:0,fast:0};rates.forEach(r=>split[band(r)]++);
 const total=rates.length||1,inRange=Math.round(split.good/total*100);
 const sd=rates.length?Math.sqrt(rates.reduce((a,r)=>a+(r-avg)**2,0)/rates.length):0;
 const maxPause=R.pauses.length?Math.max(...R.pauses):0,avgPause=R.pauses.length?R.pauses.reduce((a,b)=>a+b,0)/R.pauses.length:0;
 const pauseOk=R.pauses.length?R.pauses.filter(p=>p<=PAUSE_GOAL).length/R.pauses.length*100:100;
 const pct=Math.max(0,Math.min(100,Math.round(inRange*.7+pauseOk*.3-R.gaps.length*5)));
 saveBest('rhythm',pct,pct*3);
 const tips=[];
 tips.push(avg<100?['הקצב איטי מדי',`ממוצע ${Math.round(avg)} בדקה. בקצב איטי לחץ הדם שהעיסויים בונים לא מספיק.`]:avg>120?['הקצב מהיר מדי',`ממוצע ${Math.round(avg)} בדקה. כשמעסים מהר מדי הלב לא מספיק להתמלא בין הלחיצות, ולרוב גם העומק יורד.`]:['הקצב בטווח',`ממוצע ${Math.round(avg)} בדקה, בתוך 100–120.`]);
 if(sd>10)tips.push(['הקצב לא אחיד','הקצב עלה וירד במהלך התרגול. נסו שוב עם המטרונום, ואחר כך במצב "נעלם בהדרגה".']);
 if(R.pauses.length)tips.push(maxPause>PAUSE_GOAL?['ההפסקה להנשמות ארוכה מדי',`ההפסקה הארוכה נמשכה ${sec(maxPause)} שניות. היעד הוא עד 10 שניות משחרור הלחיצה ה־30 ועד הלחיצה הבאה.`]:['הפסקות קצרות',`כל ההפסקות להנשמות היו עד 10 שניות (ממוצע ${sec(avgPause)}).`]);
 if(R.fastBreaths)tips.push(['הנשמות מהירות','כל הנשמה נמשכת כשנייה, עד שרואים את החזה עולה. הנשמה מהירה וחזקה מכניסה אוויר לקיבה.']);
 if(R.gaps.length)tips.push(['עצירות באמצע סדרה',`העיסויים נעצרו ${R.gaps.length} פעמים באמצע סדרה. כל עצירה מורידה את לחץ הדם, ולוקח כמה לחיצות לבנות אותו מחדש.`]);
 tips.push(['עומק ושחרור','התרגול לא מודד עומק. בשטח: 5–6 ס״מ, מרפקים ישרים, ושחרור מלא של החזה בכל לחיצה.']);
 host.innerHTML=`${head('🥁 מאמן קצב עיסויים',`${pct}%`,100)}<article class="quiz-card center"><div class="big-emoji" aria-hidden="true">${pct>=85?'💪':'🥁'}</div><h2 class="question">סיימתם ${R.cycles===1?'את הסדרה':`${R.cycles} סדרות`}</h2>
 <div class="result-grid"><div class="stat"><b>${pct}%</b><small>ציון</small></div><div class="stat"><b>${Math.round(avg)||'—'}</b><small>קצב ממוצע</small></div><div class="stat"><b>${inRange}%</b><small>לחיצות בטווח</small></div></div>
 <div class="rate-split" role="img" aria-label="איטי ${Math.round(split.slow/total*100)}%, בטווח ${inRange}%, מהיר ${Math.round(split.fast/total*100)}%"><i class="slow" style="flex:${split.slow}"></i><i class="good" style="flex:${split.good}"></i><i class="fast" style="flex:${split.fast}"></i></div>
 <div class="rate-legend"><span>איטי ${Math.round(split.slow/total*100)}%</span><span>בטווח ${inRange}%</span><span>מהיר ${Math.round(split.fast/total*100)}%</span></div>
 ${R.pauses.length?`<div class="result-grid"><div class="stat"><b>${sec(avgPause)}</b><small>שנ׳ הפסקה ממוצעת</small></div><div class="stat"><b>${sec(maxPause)}</b><small>שנ׳ הפסקה ארוכה</small></div><div class="stat"><b>${R.gaps.length}</b><small>עצירות באמצע</small></div></div>`:''}
 <div class="insights">${tips.map(([t,d])=>`<div class="insight"><b>${esc(t)}</b>${esc(d)}</div>`).join('')}</div>
 <div class="c-actions"><button class="c-btn primary" type="button" data-again>שוב</button>${R.cfg.metro==='on'?'<button class="c-btn" type="button" data-harder>שוב, בלי מטרונום</button>':''}<button class="c-btn" type="button" data-menu>לתפריט</button></div></article>`;
 $('[data-back]').onclick=opts.onExit;$('[data-menu]').onclick=opts.onExit;
 $('[data-again]').onclick=()=>rhythmPlay(R.cfg);
 const hd=$('[data-harder]');if(hd)hd.onclick=()=>rhythmPlay(Object.assign({},R.cfg,{metro:'off'}));
}

// =====================================================================
// מחזור AED בזמן אמת
// =====================================================================
const ANALYZE_MS=4000,CHARGE_MS=3000,GRACE_MS=1500,ROUNDS=3;
let A=null;

function aed(h,o){
 stop();host=h;opts=o||{};
 const cfg=A&&A.cfg?A.cfg:{len:'short'},best=bestOf('aed');
 host.innerHTML=`${head('⚡ מחזור AED בזמן אמת',best!=null?`שיא ${best}%`:'הגדרות')}<article class="quiz-card"><h2 class="question">מעסים, וה־AED מנהל את הזמן</h2><p class="muted">לוחצים ומחזיקים את המשטח (או את מקש הרווח) כל עוד מעסים, ומרימים את היד כשמפסיקים. בסוף כל מחזור ה־AED מנתח קצב: עוזבים את המטופל, פועלים לפי המכשיר וחוזרים לעסות מהר. יש שלושה מחזורים, ובאמצע יקרו דברים שצריך להגיב אליהם.</p>
 ${choice('len',[['short','⏱️','מקוצר','מחזורים של 30 שניות'],['real','🕑','זמן אמת','מחזורים של 2 דקות, כמו בשטח']],cfg.len)}
 <p class="drill-note">נמדד: כמה מהזמן הידיים היו על החזה, כמה נמשכה כל הפסקה סביב האנליזה (היעד: עד 10 שניות) וטעויות בטיחות.</p>
 <div class="c-actions"><button class="c-btn primary" type="button" data-start>להתחיל</button></div></article>`;
 $('[data-back]').onclick=opts.onExit;
 bindChoices(cfg);
 $('[data-start]').onclick=()=>aedPlay(cfg);
}

function aedPlay(cfg){
 stop();
 const plan=shuffle([true,false,Math.random()<.5]);
 A={cfg,cycleMs:cfg.len==='real'?120000:30000,plan,round:0,phase:'wait',compressing:false,t0:0,cycleStart:0,phaseAt:0,lastTick:0,onTime:0,lastChange:0,releasedAt:null,analyzeMs:0,cleared:false,unplanned:[],log:[],errors:[],once:{},swap:null};
 host.innerHTML=`${head('⚡ מחזור AED בזמן אמת',`מחזור 1 מתוך ${ROUNDS}`,0)}<article class="quiz-card drill aed-drill">
 <div class="aed-screen" data-aed><span class="aed-tag">AED</span><b data-voice aria-live="assertive">מחובר ומוכן. התחילו לעסות.</b></div>
 <div class="drill-top"><div class="drill-box"><b data-clock>${clock(A.cycleMs)}</b><small data-clocklbl>עד האנליזה</small></div><div class="drill-box" data-offbox><b data-off>0.0</b><small>שנ׳ בלי עיסויים</small></div></div>
 <div class="drill-event" data-event aria-live="polite"></div>
 <div class="aed-actions"><button class="c-btn" type="button" data-act="clear" aria-label="להכריז כולם להתרחק ולסרוק">📢 להתרחק!</button><button class="c-btn shock" type="button" data-act="shock">⚡ שוק</button><button class="c-btn" type="button" data-act="pulse" aria-label="בדיקת דופק">🫀 דופק</button></div>
 <button class="press-pad hold" type="button" data-pad aria-label="עיסויים: לחצו והחזיקו">לחצו והחזיקו כדי לעסות</button></article>`;
 $('[data-back]').onclick=()=>{stop();aed(host,opts)};
 const pad=$('[data-pad]');
 pad.addEventListener('pointerdown',e=>{e.preventDefault();try{pad.setPointerCapture(e.pointerId)}catch(x){}press()});
 ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>pad.addEventListener(ev,release));
 pad.addEventListener('contextmenu',e=>e.preventDefault());
 host.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>act(b.dataset.act));
 bindKeys(press,release);
 updateActions();
 A.lastTick=now();every(aedTick,100);
}

function voice(text,kind){const s=$('[data-aed]');if(!s)return;s.className='aed-screen'+(kind?' '+kind:'');$('[data-voice]').textContent=text}
let eventTimer=null;
function showEvent(html,ms){const e=$('[data-event]');if(!e)return;clearTimeout(eventTimer);e.innerHTML=html;if(ms)eventTimer=later(()=>{if(!A.swap||!A.swap.open)e.innerHTML=''},ms)}
function err(kind,text){A.errors.push({kind,text,round:A.round});Course.beep('bad');showEvent(`<div class="scenario-feedback bad"><b>${kind==='critical'?'טעות בטיחות.':'לא מומלץ.'}</b> ${esc(text)}</div>`,4500)}
function once(key,fn){if(A.once[key+A.round])return;A.once[key+A.round]=1;fn()}
function touchError(where){
 once('touch-'+where,()=>err('critical',where==='analyze'?'נגעתם במטופל בזמן אנליזה. תנועה משבשת את ניתוח הקצב, והמכשיר צריך להתחיל מחדש.':'נגעתם במטופל אחרי ״שוק מומלץ״. בזמן טעינה ושוק אף אחד לא נוגע, כי הזרם יכול לעבור גם במטפל.'));
 voice('זוהתה תנועה. אל תיגעו במטופל','shock');
}
function updateActions(){
 const p=A.phase,clr=$('[data-act="clear"]'),sh=$('[data-act="shock"]');
 clr.disabled=!(p==='charging'||p==='shockReady');clr.classList.toggle('done',A.cleared&&!clr.disabled);
 sh.disabled=p!=='shockReady';sh.classList.toggle('ready',p==='shockReady');
 $('[data-act="pulse"]').disabled=p==='wait';
}

function press(){
 if(!A||A.compressing||A.phase==='done')return;
 const t=now();A.compressing=true;A.lastChange=t;$('[data-pad]').classList.add('down');
 if(A.phase==='wait'){A.t0=t;A.cycleStart=t;A.phase='cpr';voice('ממשיכים לעסות. האנליזה הבאה בסוף המחזור.','');updateActions();return}
 if(A.phase==='cpr'&&A.releasedAt!=null&&t-A.releasedAt>GAP_MS)A.unplanned.push(t-A.releasedAt);
 if(A.phase==='analyze'&&t-A.phaseAt>GRACE_MS){touchError('analyze');A.analyzeMs=0}
 if(A.phase==='charging'||A.phase==='shockReady')touchError('shock');
 if(A.phase==='resume')closeRound(t);
}
function release(){
 if(!A||!A.compressing)return;
 const t=now();A.compressing=false;A.onTime+=t-A.lastChange;A.lastChange=t;A.releasedAt=t;
 const pad=$('[data-pad]');if(pad)pad.classList.remove('down');
}

function aedTick(){
 if(!A||A.phase==='done')return;
 const t=now(),dt=t-A.lastTick;A.lastTick=t;
 if(A.phase==='cpr'){
  const left=A.cycleMs-(t-A.cycleStart);$('[data-clock]').textContent=clock(left);
  if(A.round===1&&!A.swap&&t-A.cycleStart>A.cycleMs*.35)showSwap(t);
  if(A.swap&&A.swap.open&&t-A.swap.at>10000)answerSwap('ignore');
  if(left<=0)startAnalysis(t);
 }else if(A.phase==='analyze'){
  if(A.compressing){if(t-A.phaseAt>GRACE_MS){touchError('analyze');A.analyzeMs=0}}
  else A.analyzeMs+=dt;
  if(A.analyzeMs>=ANALYZE_MS)analysisDone(t);
 }else if(A.phase==='charging'&&t-A.phaseAt>=CHARGE_MS){
  A.phase='shockReady';voice('טעון. התרחקו מהמטופל ולחצו על כפתור השוק','shock');Course.beep('warning');updateActions();
 }
 // מונה "בלי עיסויים" מאז שהידיים עזבו את החזה
 const off=!A.compressing&&A.releasedAt!=null&&A.phase!=='wait'?t-A.releasedAt:0;
 $('[data-off]').textContent=sec(off);$('[data-offbox]').className='drill-box'+(off>PAUSE_GOAL?' bad':off>0?' warn':'');
}

function startAnalysis(t){
 A.phase='analyze';A.phaseAt=t;A.analyzeMs=0;A.cleared=false;
 $('[data-clock]').textContent='—';$('[data-clocklbl]').textContent='אנליזה';
 voice('מנתח קצב. אל תיגעו במטופל','warn');Course.beep('warning');updateActions();
 if(A.swap&&A.swap.choice==='plan')showEvent('<div class="scenario-feedback good"><b>זה הזמן להחליף מעסה.</b> המעסה הבא מוכן ליד החזה, וההחלפה לוקחת עד 5 שניות.</div>',5000);
}
function analysisDone(t){
 A.cur={shock:A.plan[A.round]};A.phaseAt=t;
 if(A.cur.shock){A.phase='charging';voice('שוק מומלץ. טוען. אל תיגעו במטופל','shock');Course.beep('deterioration')}
 else{A.phase='resume';voice('שוק לא מומלץ. התחילו החייאה','go');Course.beep('fact')}
 updateActions();
}
function act(kind){
 if(!A||A.phase==='done')return;const t=now(),p=A.phase;
 if(kind==='clear'){
  if(p!=='charging'&&p!=='shockReady')return;
  A.cleared=true;updateActions();showEvent('<div class="scenario-feedback good"><b>הכרזתם וסרקתם.</b> אף אחד לא נוגע במטופל, גם לא מי שמנשים.</div>',3000);return;
 }
 if(kind==='shock'){
  if(p!=='shockReady')return;
  if(!A.cleared)err('critical','נתתם שוק בלי להכריז ולסרוק. לפני כל שוק מכריזים בקול ״כולם להתרחק!״ ומוודאים במבט שאף אחד לא נוגע.');
  A.cur.shockAt=t;A.phase='resume';A.phaseAt=t;voice('שוק ניתן. התחילו החייאה מיד','go');Course.beep('ok');updateActions();return;
 }
 if(kind==='pulse'){
  if(p==='analyze'){touchError('analyze');A.analyzeMs=0;return}
  if(p==='charging'||p==='shockReady'){touchError('shock');return}
  once('pulse',()=>err('minor',p==='resume'?(A.cur&&A.cur.shock?'אחרי שוק חוזרים מיד לעיסויים, בלי בדיקת דופק. הלב צריך זרימה גם אם הקצב השתנה.':'גם כשהמכשיר לא ממליץ על שוק חוזרים מיד לעיסויים, בלי לבדוק דופק.'):'באמצע מחזור לא עוצרים לבדיקת דופק. בודקים רק כשמופיעים סימני חיים.'));
 }
}
function closeRound(t){
 A.log.push({shock:A.cur.shock,handsOff:t-(A.releasedAt??t),resume:t-A.phaseAt});
 A.round++;$('[data-bar]').style.width=A.round/ROUNDS*100+'%';
 if(A.round>=ROUNDS){aedFinish(t);return}
 A.phase='cpr';A.cycleStart=t;A.cur=null;
 $('[data-hr]').textContent=`מחזור ${A.round+1} מתוך ${ROUNDS}`;$('[data-clocklbl]').textContent='עד האנליזה';
 voice('ממשיכים לעסות. האנליזה הבאה בסוף המחזור.','');updateActions();
}

// אירוע עייפות במחזור השני: ההחלטה הנכונה היא לתכנן החלפה לזמן האנליזה.
function showSwap(t){
 A.swap={open:true,at:t};Course.beep('warning');
 showEvent(`<div class="scenario-feedback warn-box"><b>העיסויים נחלשים. אתם מתחילים להתעייף.</b> מה עושים? (ממשיכים ללחוץ על המשטח בזמן הבחירה)<div class="choice-row">${shuffle([['plan','ממשיכים ומחליפים מעסה בזמן האנליזה הקרובה'],['now','עוצרים עכשיו ומחליפים מעסה'],['keep','ממשיכים עד שיגיע נט״ן']]).map(([k,t])=>`<button class="c-btn small" type="button" data-swap="${k}">${t}</button>`).join('')}</div></div>`);
 host.querySelectorAll('[data-swap]').forEach(b=>b.onclick=()=>answerSwap(b.dataset.swap));
}
function answerSwap(k){
 if(!A.swap||!A.swap.open)return;A.swap.open=false;A.swap.choice=k;
 if(k==='plan'){Course.beep('ok');showEvent('<div class="scenario-feedback good"><b>נכון.</b> מתכננים את ההחלפה לזמן האנליזה, כדי שהעיסויים לא ייעצרו פעם נוספת.</div>',4000);return}
 err('minor',{now:'החלפה באמצע סדרה עוצרת עיסויים בלי צורך. מתזמנים אותה לזמן האנליזה, כל כשתי דקות.',keep:'עייפות מורידה את איכות העיסויים עוד לפני שמרגישים. לא מחכים לנט״ן, מחליפים בזמן האנליזה.',ignore:'לא הגבתם לעייפות. עיסויים חלשים כמעט לא מזרימים דם. מתכננים החלפה לזמן האנליזה.'}[k]);
}

function aedFinish(t){
 A.phase='done';stop();
 const total=t-A.t0,ccf=total?Math.round(A.onTime/total*100):0;
 const maxOff=Math.max(0,...A.log.map(r=>r.handsOff)),unplanned=A.unplanned.reduce((a,b)=>a+b,0);
 const crit=A.errors.filter(e=>e.kind==='critical').length,minor=A.errors.length-crit;
 let score=100;
 A.log.forEach(r=>{score-=Math.min(20,Math.max(0,(r.handsOff-PAUSE_GOAL)/1000*2))});
 score-=Math.min(20,unplanned/1000);score-=crit*20+minor*5;
 const pct=Math.max(0,Math.min(100,Math.round(score)));
 saveBest('aed',pct,pct*3);
 const goal=A.cfg.len==='real'?80:65;
 const tips=[];
 if(maxOff>PAUSE_GOAL)tips.push(['הפסקות ארוכות',`ההפסקה הארוכה סביב אנליזה נמשכה ${sec(maxOff)} שניות. היעד: עד 10 שניות מהרמת הידיים ועד שחוזרים לעסות.`]);
 else tips.push(['הפסקות קצרות','כל ההפסקות סביב האנליזה היו עד 10 שניות.']);
 if(A.unplanned.length)tips.push(['עצירות באמצע מחזור',`הידיים עזבו את החזה ${A.unplanned.length} פעמים באמצע מחזור (${sec(unplanned)} שניות בסך הכול).`]);
 if(ccf<goal)tips.push(['זמן עיסויים נמוך',`הידיים היו על החזה ${ccf}% מהזמן. ${A.cfg.len==='real'?'היעד הוא 80% ומעלה.':'במחזורים מקוצרים ההפסקות תופסות חלק גדול יותר, אבל כדאי לשאוף ל־65% ומעלה.'}`]);
 host.innerHTML=`${head('⚡ מחזור AED בזמן אמת',`${pct}%`,100)}<article class="quiz-card center"><div class="big-emoji" aria-hidden="true">${pct>=85&&!crit?'🚑':'⚡'}</div><h2 class="question">הצוות המתקדם הגיע</h2><p class="muted">שלושה מחזורים הושלמו. כך הלך:</p>
 <div class="result-grid"><div class="stat"><b>${pct}%</b><small>ציון</small></div><div class="stat"><b>${ccf}%</b><small>ידיים על החזה</small></div><div class="stat"><b>${sec(maxOff)}</b><small>שנ׳ הפסקה ארוכה</small></div></div>
 <div class="insights">${A.log.map((r,i)=>`<div class="insight round-row${r.handsOff>PAUSE_GOAL?' over':''}"><b>מחזור ${i+1} · ${r.shock?'⚡ שוק מומלץ':'שוק לא מומלץ'}</b>${sec(r.handsOff)} שניות בלי עיסויים · חזרה לעיסויים ${sec(r.resume)} שניות אחרי הוראת המכשיר</div>`).join('')}</div>
 ${A.errors.length?`<h3 class="drill-sub">טעויות</h3><div class="insights">${A.errors.map(e=>`<div class="insight err ${e.kind}"><b>${e.kind==='critical'?'בטיחות':'טיפול'} · מחזור ${e.round+1}</b>${esc(e.text)}</div>`).join('')}</div>`:'<div class="scenario-feedback good"><b>בלי טעויות בטיחות.</b> לא נגעתם במטופל בזמן אנליזה ושוק, והגבתם נכון לעייפות.</div>'}
 <div class="insights">${tips.map(([t,d])=>`<div class="insight"><b>${esc(t)}</b>${esc(d)}</div>`).join('')}</div>
 <div class="c-actions"><button class="c-btn primary" type="button" data-again>שוב</button>${A.cfg.len==='short'?'<button class="c-btn" type="button" data-real>בזמן אמת</button>':''}<button class="c-btn" type="button" data-menu>לתפריט</button></div></article>`;
 $('[data-back]').onclick=opts.onExit;$('[data-menu]').onclick=opts.onExit;
 $('[data-again]').onclick=()=>aedPlay(A.cfg);
 const rl=$('[data-real]');if(rl)rl.onclick=()=>aedPlay({len:'real'});
}

window.CprDrills={rhythm,aed,stop};
})();
