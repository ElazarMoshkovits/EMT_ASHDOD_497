// מנוע שאלות משותף לחלק א׳ ולחלק ב׳.
// כל שאלה: {id,text,opts,why,not,sub,cat,lvl,scenario}. התשובה הנכונה היא תמיד opts[0], והסדר מעורבב בהצגה.
(function(){
const LETTERS=['א','ב','ג','ד','ה'];
const {esc,shuffle}=Course;
let run=null;

function optionOrder(item){
 const idx=item.opts.map((_,i)=>i);
 const tf=item.opts.length===2&&item.opts.every(o=>o==='נכון'||o==='לא נכון');
 if(tf)return item.opts[0]==='נכון'?[0,1]:[1,0];
 return shuffle(idx);
}

function start(cfg){
 stop(true);
 const saved=cfg.state;
 run={cfg,items:cfg.items,idx:0,correct:0,score:0,streak:0,lives:cfg.lives?3:null,answers:[],choices:{},answered:false,order:null,tick:null,examLeft:cfg.examMinutes?cfg.examMinutes*60:null,examTick:null,over:false};
 if(saved){Object.assign(run,{idx:saved.idx,correct:saved.correct,score:saved.score,streak:saved.streak||0,lives:saved.lives,answers:saved.answers||[],choices:saved.choices||{},examLeft:saved.examLeft??run.examLeft})}
 // בחזרה לתרגול: אם השאלה האחרונה כבר נענתה, ממשיכים לשאלה הבאה.
 if(saved&&cfg.mode!=='exam'&&run.answers.length>run.idx)run.idx=run.answers.length;
 document.addEventListener('keydown',onKey);
 if(run.examLeft!=null)startExamClock();
 if(run.idx>=run.items.length||run.lives===0){run.idx=Math.min(run.idx,run.items.length-1);finish();return}
 render();
}

function persist(){
 if(!run||run.over)return;
 const p=Course.profile;
 p.resume[run.cfg.page]={label:run.cfg.label,mode:run.cfg.mode,ids:run.items.map(x=>x.id),idx:run.idx,correct:run.correct,score:run.score,streak:run.streak,lives:run.lives,answers:run.answers,choices:run.choices,examLeft:run.examLeft,examMinutes:run.cfg.examMinutes||0,lifeMode:!!run.cfg.lives,key:run.cfg.key||'',ts:Date.now()};
 Course.save();
}
function clearResume(){delete Course.profile.resume[run.cfg.page];Course.save()}

function stop(silent){
 if(!run)return;
 clearInterval(run.tick);clearInterval(run.examTick);document.removeEventListener('keydown',onKey);
 if(!silent)run=null;
}

function timeFor(item){
 if(run.cfg.mode==='exam'||!Course.profile.timer)return 0;
 return (run.cfg.baseTime||25)+(item.scenario||item.text.length>110?10:0);
}

function headerHtml(){
 const c=run.cfg,total=run.items.length,exam=c.mode==='exam';
 const right=exam?`<div class="exam-clock" data-clock aria-live="off"></div>`:run.lives!=null?`<div class="hearts" aria-label="נשארו ${run.lives} לבבות">${'♥'.repeat(run.lives)}${'♡'.repeat(3-run.lives)}</div>`:'';
 return `<header class="game-head"><button class="icon-btn" type="button" data-quit aria-label="יציאה מהתרגול">✕</button><div class="progress-wrap"><div class="progress-label"><span>${esc(c.label)}</span><span>${Math.min(run.idx+1,total)}/${total}</span></div><div class="progress"><i style="width:${run.idx/total*100}%"></i></div></div>${right}</header>`;
}

function render(){
 const c=run.cfg,item=run.items[run.idx],exam=c.mode==='exam';
 run.answered=false;run.order=optionOrder(item);
 const meta=[item.cat&&c.showCat?item.cat:null,item.sub,item.lvl===2?'מתקדם':item.lvl===1?'בסיסי':null].filter(Boolean).join(' • ');
 const chosen=run.choices[item.id];
 c.host.innerHTML=`${headerHtml()}<article class="quiz-card"><div class="question-meta"><span class="topic-pill">${esc(meta)}</span>${item.scenario?'<span class="scenario-pill">מקרה מהשטח</span>':''}</div><h2 class="question" id="q-text">${esc(item.text)}</h2><div class="answers" role="group" aria-labelledby="q-text">${run.order.map((orig,i)=>`<button class="answer${exam&&chosen===orig?' picked':''}" type="button" data-orig="${orig}"><span class="letter" aria-hidden="true">${LETTERS[i]}</span><span>${esc(item.opts[orig])}</span></button>`).join('')}</div><div class="explain hidden" aria-live="polite"></div><div class="next-row">${exam?`<button class="review-btn" type="button" data-prev ${run.idx===0?'disabled':''}>→ לשאלה הקודמת</button>`:`<div class="timer" data-timer ${timeFor(item)?'':'hidden'}><span></span></div><button class="review-btn" type="button" data-save></button>`}<button class="primary${exam?'':' hidden'}" type="button" data-next>${nextLabel()}</button></div><p class="key-hint">אפשר לבחור גם במקשים 1–${item.opts.length}${exam?'':' ולהמשיך עם Enter'}</p></article>`;
 bind();
 if(!exam){updateSave(item);startTimer(item)}
 else updateClock();
 c.host.querySelector('.question').focus?.();
}
function nextLabel(){const last=run.idx===run.items.length-1;return run.cfg.mode==='exam'?(last?'להגשת המבחן':'לשאלה הבאה ←'):(last?'לסיכום ←':'לשאלה הבאה ←')}

function bind(){
 const h=run.cfg.host;
 h.querySelector('[data-quit]').onclick=quit;
 h.querySelectorAll('.answer').forEach(b=>b.onclick=()=>choose(+b.dataset.orig,b));
 h.querySelector('[data-next]').onclick=next;
 const sv=h.querySelector('[data-save]');if(sv)sv.onclick=()=>{const item=run.items[run.idx];const on=Course.toggleSaved(item.id);updateSave(item);Course.toast(on?'השאלה נשמרה לחזרה':'השאלה הוסרה מהחזרה')};
 const pv=h.querySelector('[data-prev]');if(pv)pv.onclick=()=>{if(run.idx>0){run.idx--;render();persist()}};
}
function updateSave(item){const b=run.cfg.host.querySelector('[data-save]');if(!b)return;const on=Course.isSaved(item.id);b.classList.toggle('saved',on);b.textContent=on?'★ שמורה לחזרה':'☆ לשמור לחזרה'}

function startTimer(item){
 clearInterval(run.tick);const total=timeFor(item);if(!total)return;
 let left=total;const el=run.cfg.host.querySelector('[data-timer]');const paint=()=>{el.querySelector('span').textContent=left;el.style.setProperty('--time',(left/total*360)+'deg');el.setAttribute('aria-label',`נשארו ${left} שניות`)};
 paint();
 run.tick=setInterval(()=>{left--;paint();if(left<=0){clearInterval(run.tick);choose(-1,null)}},1000);
}
function startExamClock(){clearInterval(run.examTick);run.examTick=setInterval(()=>{run.examLeft--;updateClock();if(run.examLeft%15===0)persist();if(run.examLeft<=0){clearInterval(run.examTick);Course.toast('הזמן נגמר. המבחן הוגש.');finish()}},1000)}
function updateClock(){const el=run.cfg.host.querySelector('[data-clock]');if(!el)return;const m=Math.floor(run.examLeft/60),s=run.examLeft%60;el.textContent=`${m}:${String(s).padStart(2,'0')}`;el.classList.toggle('low',run.examLeft<120)}

function choose(orig,button){
 const c=run.cfg,item=run.items[run.idx];
 if(c.mode==='exam'){
  if(orig<0)return;
  run.choices[item.id]=orig;c.host.querySelectorAll('.answer').forEach(b=>b.classList.toggle('picked',+b.dataset.orig===orig));persist();return;
 }
 if(run.answered)return;
 run.answered=true;clearInterval(run.tick);
 const ok=orig===0,timedOut=orig<0;
 c.host.querySelectorAll('.answer').forEach(b=>{b.disabled=true;const o=+b.dataset.orig;if(o===0)b.classList.add('correct');else if(o===orig)b.classList.add('wrong')});
 let gain=0;
 if(ok){run.correct++;run.streak++;gain=(item.scenario?140:100)+Math.min(run.streak-1,4)*20;run.score+=gain;Course.addXp(gain)}
 else{run.streak=0;if(run.lives!=null)run.lives=Math.max(0,run.lives-1)}
 const bankResult=Course.record(item.id,ok);
 run.answers.push({id:item.id,ok,choice:orig});
 Course.beep(ok?'ok':'bad');
 const ex=c.host.querySelector('.explain');
 let html;
 if(ok){html=`<b>נכון${gain?` · +${gain}`:''}</b> ${esc(item.why)}`;if(bankResult==='graduated')html+=`<span class="bank-note">השאלה יצאה מבנק הטעויות. ענית עליה נכון שלוש פעמים בימים שונים.</span>`;else if(bankResult==='advanced')html+=`<span class="bank-note">עוד צעד לקראת יציאה מבנק הטעויות. היא תחזור בעוד כמה ימים.</span>`}
 else{
  const whyNot=orig>0&&item.not&&item.not[orig-1];
  html=`<b>${timedOut?'נגמר הזמן.':'לא נכון.'}</b>${whyNot?` <span class="why-not">${esc(whyNot)}</span>`:''}<span class="right-answer">התשובה הנכונה: <b>${esc(item.opts[0])}</b></span>${esc(item.why)}`;
 }
 ex.innerHTML=html;ex.classList.remove('hidden');ex.classList.toggle('bad',!ok);
 const hearts=c.host.querySelector('.hearts');if(hearts){hearts.textContent='♥'.repeat(run.lives)+'♡'.repeat(3-run.lives);hearts.setAttribute('aria-label',`נשארו ${run.lives} לבבות`)}
 const nb=c.host.querySelector('[data-next]');
 if(run.lives===0){nb.textContent='לסיכום ←'}
 nb.classList.remove('hidden');nb.focus();
 persist();
}

function next(){
 const c=run.cfg;
 if(c.mode!=='exam'&&!run.answered)return;
 if(c.mode==='exam'&&run.idx===run.items.length-1){
  const missing=run.items.filter(x=>run.choices[x.id]==null).length;
  if(missing){Course.confirm('להגיש את המבחן?',`${missing} שאלות עדיין בלי תשובה. הן ייספרו כטעות.`,'להגיש','לחזור למבחן').then(ok=>{if(ok)finish()});return}
  finish();return;
 }
 if(run.lives===0||run.idx>=run.items.length-1){finish();return}
 run.idx++;render();persist();window.scrollTo({top:0,behavior:'smooth'});
}

async function quit(){
 const c=run.cfg,done=c.mode==='exam'?Object.keys(run.choices).length:run.answers.length;
 if(done>0){
  const ok=await Course.confirm('לצאת מהתרגול?','התשובות שכבר נתת נשמרו. אפשר לחזור ולהמשיך מאותה שאלה מהתפריט.','לצאת','להישאר');
  if(!ok)return;
 }else clearResume();
 stop();c.onExit&&c.onExit();
}

function finish(){
 const c=run.cfg;clearInterval(run.tick);clearInterval(run.examTick);run.over=true;
 if(c.mode==='exam'){
  run.answers=run.items.map(item=>{const choice=run.choices[item.id];const ok=choice===0;Course.record(item.id,ok);return{id:item.id,ok,choice:choice==null?-1:choice}});
  run.correct=run.answers.filter(a=>a.ok).length;run.score=run.correct*100;Course.addXp(run.score);
 }
 const answered=run.answers.length,total=c.mode==='exam'?run.items.length:answered||1;
 const percent=Math.round(run.correct/total*100);
 if(c.mode==='exam'){Course.profile.examBest[c.page]=Math.max(Course.profile.examBest[c.page]||0,percent)}
 delete Course.profile.resume[c.page];
 Course.save();Course.beep(percent>=70?'win':'bad');
 const result={mode:c.mode,label:c.label,correct:run.correct,total,percent,score:run.score,answers:run.answers,items:run.items,outOfLives:run.lives===0&&answered<run.items.length,planned:run.items.length};
 document.removeEventListener('keydown',onKey);
 const r=run;run=null;
 c.onFinish&&c.onFinish(result);
 showSummary(result,c,r);
}

function bySub(result){
 const map={};result.answers.forEach(a=>{const item=result.items.find(x=>x.id===a.id);const k=item.cat&&result.mode!=='practice'?item.cat:item.sub||item.cat||'כללי';const m=map[k]||(map[k]={name:k,n:0,c:0});m.n++;if(a.ok)m.c++});
 return Object.values(map).map(x=>({...x,pct:Math.round(x.c/x.n*100)})).sort((a,b)=>a.pct-b.pct);
}

function showSummary(result,c,r){
 const exam=result.mode==='exam',groups=bySub(result),weak=groups.filter(g=>g.pct<80),strong=groups.filter(g=>g.pct>=80).reverse();
 const wrong=result.answers.filter(a=>!a.ok);
 const title=result.outOfLives?'נגמרו הלבבות':exam?(result.percent>=80?'עברת את המבחן':result.percent>=60?'קרוב. עוד קצת תרגול':'צריך עוד חזרה לפני המבחן'):result.percent>=90?'מצוין':result.percent>=70?'יפה, יש על מה לעבוד':'כדאי לעבור על זה שוב';
 const sub=result.outOfLives?`הגעת לשאלה ${result.answers.length} מתוך ${result.planned}.`:exam?'הציון מחושב מכל שאלות המבחן. שאלה בלי תשובה נספרת כטעות.':'';
 const table=groups.length>1||exam?`<div class="sum-table">${groups.map(g=>`<div class="${g.pct<60?'bad':g.pct<80?'mid':'good'}"><span>${esc(g.name)}</span><b>${g.c}/${g.n}</b><i><em style="width:${g.pct}%"></em></i></div>`).join('')}</div>`:'';
 const review=wrong.length?`<details class="sum-review"${exam?' open':''}><summary>מה טעיתי (${wrong.length})</summary>${wrong.map(a=>{const it=result.items.find(x=>x.id===a.id);const mine=a.choice>0?it.opts[a.choice]:null;const wn=a.choice>0&&it.not&&it.not[a.choice-1];return `<article><b>${esc(it.text)}</b>${mine?`<p class="mine">בחרת: ${esc(mine)}${wn?` · ${esc(wn)}`:''}</p>`:'<p class="mine">לא נבחרה תשובה</p>'}<p class="right">נכון: ${esc(it.opts[0])}</p><p>${esc(it.why)}</p></article>`}).join('')}</details>`:'';
 const extra=c.summaryExtra?c.summaryExtra(result):'';
 const card=Course.openModal(`<div class="big-emoji" aria-hidden="true">${result.percent>=90?'🏆':result.percent>=70?'👏':'📚'}</div><h2>${title}</h2><p>${esc(c.label)}${sub?`<br>${sub}`:''}</p><div class="result-grid"><div class="stat"><b>${result.percent}%</b><small>ציון</small></div><div class="stat"><b>${result.correct}/${result.total}</b><small>תשובות נכונות</small></div><div class="stat"><b>${result.score}</b><small>נקודות</small></div></div>${weak.length&&!exam?`<p class="sum-line">כדאי לחזור על: <b>${weak.map(g=>esc(g.name)).join(', ')}</b></p>`:''}${!weak.length&&strong.length&&!exam?`<p class="sum-line">כל הנושאים בסבב מעל 80%.</p>`:''}${table}${review}<div class="c-actions">${wrong.length?'<button class="c-btn primary" type="button" data-again-wrong>לתרגל שוב את הטעויות</button>':''}<button class="c-btn${wrong.length?'':' primary'}" type="button" data-again>סבב חוזר</button><button class="c-btn" type="button" data-menu>לתפריט</button></div>${extra}`,{wide:true,label:'סיכום',onClose:()=>c.onExit&&c.onExit()});
 const again=items=>{Course.closeModal(true);start(Object.assign({},c,{items:shuffle(items),state:null}))};
 const aw=card.querySelector('[data-again-wrong]');if(aw)aw.onclick=()=>again(wrong.map(a=>result.items.find(x=>x.id===a.id)));
 card.querySelector('[data-again]').onclick=()=>again(result.items);
 card.querySelector('[data-menu]').onclick=()=>{Course.closeModal()};
 c.bindSummary&&c.bindSummary(card,result);
}

function onKey(e){
 if(!run||Course.modalOpen()||e.target.matches('input,textarea,select'))return;
 const n=parseInt(e.key,10);
 if(n>=1&&n<=5){const b=run.cfg.host.querySelectorAll('.answer')[n-1];if(b&&!b.disabled){e.preventDefault();b.click()}}
 else if(e.key==='Enter'){const nb=run.cfg.host.querySelector('[data-next]');if(nb&&!nb.classList.contains('hidden')&&document.activeElement!==nb){e.preventDefault();nb.click()}}
}

window.Quiz={start,stop,get active(){return !!run},quit:()=>run&&quit()};
})();
