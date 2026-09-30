// חלק א׳: תפריט, תרגול לפי קטגוריה, תרגול יומי, מבחן לדוגמה, תרחישי החייאה, סדר פעולות, משחק זיכרון, תרגולי ידיים ומקרים מתפצלים.
(function(){
const {esc,shuffle}=Course;
const DATA=window.PART1,LEVELS=DATA.levels;
const $=s=>document.querySelector(s);
const INSTRUCTOR_PHONE='972543695010';
const ALL=[];
LEVELS.forEach((level,i)=>level.qs.forEach(q=>{q.cat=level.name;q.levelIndex=i;ALL.push(q)}));
const BY_ID=new Map(ALL.map(q=>[q.id,q]));
const isA=id=>BY_ID.has(id);
const levelIds=level=>level.qs.map(q=>q.id);
const VIEWS=['home','play','resus','seq','memory','rhythm','aed','whatnow','branch'];

// המרה חד־פעמית של טעויות ושאלות שמורות מהגרסה הקודמת, שנשמרו לפי טקסט.
(function migrateTexts(){
 const p=Course.profile;if(!p.pendingA)return;
 const byText=new Map([...Object.entries(DATA.legacyText||{}),...ALL.map(q=>[q.text,q.id])]);const now=Date.now();
 (p.pendingA.mistakes||[]).forEach(t=>{const id=byText.get(t);if(id&&!p.bank[id])p.bank[id]={box:0,due:now}});
 (p.pendingA.saved||[]).forEach(t=>{const id=byText.get(t);if(id&&!p.saved.includes(id))p.saved.push(id)});
 delete p.pendingA;Course.save();
})();

function show(view){VIEWS.forEach(v=>$('#'+v).classList.toggle('hidden',v!==view));window.scrollTo(0,0)}
function goHome(){Course.nav.home()}
Course.nav.init(view=>{if(view==='home'){Quiz.stop();CprDrills.stop();CprCases.stop();show('home');renderHome()}});
if(location.hash)history.replaceState({view:'home'},'',location.pathname+location.search);

// ---- תפריט ----
function renderHome(){
 const p=Course.profile,bank=Course.bankInfo(isA),saved=p.saved.filter(isA).length;
 const cov=Course.coverage(ALL.map(q=>q.id));
 LEVELS.forEach(level=>Course.starsFor('a:'+level.id,levelIds(level)));
 const st=Course.starTotals();
 $('#hubStats').innerHTML=`<div><b>${cov.ok}/${cov.total}</b><small>שאלות שעניתם עליהן נכון</small></div><div><b>${st.a}/${st.maxA}</b><small>כוכבים בחלק א׳</small></div><div><b>${p.examBest.a!=null?p.examBest.a+'%':'—'}</b><small>ציון שיא במבחן לדוגמה</small></div>`;
 $('#bankLabel').textContent=bank.total||saved?`${bank.total} בבנק${bank.due?`, ${bank.due} לחזרה היום`:''}${saved?` · ${saved} שמורות`:''}`:'אין כרגע טעויות. יופי.';
 $('#resumeBox').innerHTML=resumeHtml();
 const rb=$('#resumeGo');if(rb){rb.onclick=resume;$('#resumeDrop').onclick=()=>{delete Course.profile.resume.a;Course.save();renderHome()}}
 $('#levels').innerHTML=LEVELS.map((level,i)=>{const ids=levelIds(level),c=Course.coverage(ids),stars=Course.starsFor('a:'+level.id,ids);return `<button class="level" type="button" data-level="${i}" style="--accent:${level.color}"><div class="num" aria-hidden="true">${level.icon}</div><h4>${i+1}. ${esc(level.name)}</h4><p>${esc(level.desc)}</p><div class="lvl-progress"><span>${c.ok}/${c.total} נכונות</span><i><em style="width:${c.ok/c.total*100}%"></em></i></div><div class="stars" aria-label="${stars} כוכבים מתוך 3">${[0,1,2].map(x=>`<span class="${x<stars?'on':''}">★</span>`).join('')}</div></button>`}).join('');
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>openSetup(+b.dataset.level));
 Course.refreshHeader();
}
function resumeHtml(){
 const r=Course.profile.resume.a;if(!r)return '';
 return `<div class="resume-box"><div><b>יש תרגול שלא סיימתם</b><span>${esc(r.label)} · ${r.mode==='exam'?`${Object.keys(r.choices||{}).length} תשובות מתוך ${r.ids.length}`:`ענית על ${(r.answers||[]).length} מתוך ${r.ids.length}`}</span></div><button class="c-btn primary" type="button" id="resumeGo">להמשיך</button><button class="c-btn" type="button" id="resumeDrop">לוותר עליו</button></div>`;
}

// ---- התחלת תרגול ----
function startQuiz(items,cfg,state){
 if(!items.length){Course.toast('אין שאלות להצגה');return}
 Course.closeModal(true);
 if(!state)delete Course.profile.resume.a;
 Course.setLast('review.html',cfg.label);
 show('play');Course.nav.push('play');
 Quiz.start(Object.assign({host:$('#play'),page:'a',items,baseTime:25,state,showCat:cfg.mode!=='practice',onExit:goHome,onFinish:()=>{LEVELS.forEach(l=>Course.starsFor('a:'+l.id,levelIds(l)));Course.save()},summaryExtra,bindSummary},cfg));
}
function resume(){
 const r=Course.profile.resume.a;if(!r)return;
 const items=r.ids.map(id=>BY_ID.get(id)).filter(Boolean);
 if(items.length!==r.ids.length){delete Course.profile.resume.a;Course.save();Course.toast('התרגול הזה כבר לא זמין. מתחילים חדש.');renderHome();return}
 startQuiz(items,{label:r.label,mode:r.mode,lives:r.lifeMode,examMinutes:r.examMinutes||0},r);
}

function openSetup(i){
 const level=LEVELS[i],subs=[...new Set(level.qs.map(q=>q.sub))];
 const card=Course.openModal(`<div class="big-emoji" aria-hidden="true">${level.icon}</div><h2>${esc(level.name)}</h2>
  ${subs.length>1?`<label class="c-field"><span>נושא</span><select data-sub class="subtopic-select"><option value="">כל הנושאים (${level.qs.length})</option>${subs.map(s=>`<option value="${esc(s)}">${esc(s)} (${level.qs.filter(q=>q.sub===s).length})</option>`).join('')}</select></label>`:''}
  <div class="setup-grid" data-choices></div>
  <p class="c-note">הכוכבים נקבעים לפי כמה מהשאלות בקטגוריה עניתם נכון בפעם האחרונה, בכל סוג תרגול: חצי מהשאלות = כוכב, 75% = שניים, 90% = שלושה.</p>`,{label:level.name});
 const paint=()=>{
  const sub=card.querySelector('[data-sub]')?.value||'',pool=level.qs.filter(q=>!sub||q.sub===sub);
  const basic=pool.filter(q=>q.lvl===1),open=pool.filter(q=>!(Course.profile.seen[q.id]&&Course.profile.seen[q.id].ok));
  const label=m=>`${level.name}${sub?` · ${sub}`:''} · ${m}`;
  const choices=[['basic','🌱','בסיס',`${basic.length} שאלות על מושגים והגדרות`,basic],['all','🎓','כל השאלות',`${pool.length} שאלות, כולל מקרים מהשטח`,pool],['open','🎯','מה שעוד לא עניתי נכון',`${open.length} שאלות`,open]];
  card.querySelector('[data-choices]').innerHTML=choices.map(([k,icon,t,d,list])=>`<button class="setup-choice" type="button" data-mode="${k}" ${list.length?'':'disabled'}><span aria-hidden="true">${icon}</span><b>${t}</b><small>${d}</small></button>`).join('');
  card.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{const c=choices.find(x=>x[0]===b.dataset.mode);startQuiz(shuffle(c[4]),{label:label(c[2]),mode:'practice'})});
 };
 const sel=card.querySelector('[data-sub]');if(sel)sel.onchange=paint;paint();
}

function dailyItems(){
 const p=Course.profile,picked=new Set(),out=[];
 const add=q=>{if(q&&!picked.has(q.id)&&out.length<12){picked.add(q.id);out.push(q)}};
 Course.bankIds(isA).filter(x=>x.due).forEach(x=>add(BY_ID.get(x.id)));
 p.saved.filter(isA).forEach(id=>add(BY_ID.get(id)));
 const weakest=LEVELS.map(l=>({l,c:Course.coverage(levelIds(l))})).sort((a,b)=>a.c.ok/a.c.total-b.c.ok/b.c.total)[0].l;
 shuffle(weakest.qs.filter(q=>!(p.seen[q.id]&&p.seen[q.id].ok))).slice(0,5).forEach(add);
 shuffle(ALL.filter(q=>!p.seen[q.id])).forEach(add);
 shuffle(ALL).forEach(add);
 return shuffle(out);
}
function examItems(){
 const total=40,out=[];
 LEVELS.forEach(l=>{const n=Math.max(1,Math.round(l.qs.length/ALL.length*total));out.push(...shuffle(l.qs).slice(0,n))});
 return shuffle(out).slice(0,total);
}
function bankItems(){
 const due=Course.bankIds(isA),ids=[...due.filter(x=>x.due).map(x=>x.id),...Course.profile.saved.filter(isA),...due.filter(x=>!x.due).map(x=>x.id)];
 return [...new Set(ids)].slice(0,20).map(id=>BY_ID.get(id)).filter(Boolean);
}

// ---- סיכום: שליחה למדריך ----
function summaryExtra(r){return `<div class="c-actions share"><button class="c-btn" type="button" data-share>📱 לשלוח את הסיכום ליחיאל בוואטסאפ</button><button class="c-btn" type="button" data-share-other>למספר אחר</button></div>`}
function bindSummary(card,r){
 card.querySelector('[data-share]').onclick=()=>share(INSTRUCTOR_PHONE,{title:r.label,summary:`${r.correct}/${r.total} נכונות (${r.percent}%)`,score:r.score});
 card.querySelector('[data-share-other]').onclick=()=>shareOther({title:r.label,summary:`${r.correct}/${r.total} נכונות (${r.percent}%)`,score:r.score});
}
function normalizePhone(v){let n=String(v||'').replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n.startsWith('0'))n='972'+n.slice(1);return n}
function share(phone,res){
 const n=normalizePhone(phone);if(!/^\d{8,15}$/.test(n)){Course.toast('מספר הטלפון לא תקין',true);return}
 const p=Course.profile,player=p.name===Course.DEFAULT_NAME?'בלי שם':p.name;
 const text=`סיכום תרגול, קורס חובשים 497\nשם: ${player}\nתרגול: ${res.title}\nתוצאה: ${res.summary}\nנקודות: ${res.score}\nתאריך: ${new Date().toLocaleDateString('he-IL')}`;
 window.open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`,'_blank','noopener');
}
function shareOther(res){
 const card=Course.openModal(`<h2>למי לשלוח?</h2><label class="c-field"><span>מספר וואטסאפ</span><input type="tel" inputmode="tel" data-phone placeholder="050-0000000" autofocus></label><div class="c-actions"><button class="c-btn primary" type="button" data-send>לשלוח</button></div>`);
 card.querySelector('[data-send]').onclick=()=>{share(card.querySelector('[data-phone]').value,res);Course.closeModal(true)};
}

// ---- תרחישי החייאה ----
let sim=null;
function resusMenu(){
 show('resus');if(!history.state||history.state.view!=='resus')Course.nav.push('resus');
 const best=Course.profile.resusBest;
 $('#resus').innerHTML=`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לתפריט">✕</button><div class="progress-wrap"><div class="progress-label"><span>תרחישי החייאה</span><span>בחרו תרחיש</span></div></div></header><article class="quiz-card"><h2 class="question">איזה אירוע מתרגלים?</h2><p class="muted">כל תרחיש מתקדם שלב אחרי שלב. תשובה לא נכונה מורידה נקודות, ואז בוחרים שוב עד שמגיעים לפעולה הנכונה.</p><div class="scenario-list">${DATA.resus.map((x,i)=>`<button class="scenario-pick" type="button" data-sim="${i}"><span aria-hidden="true">${x.icon}</span><div><b>${esc(x.name)}</b><small>${esc(x.desc)}${best[i]!=null?` · שיא ${best[i]}%`:''}</small></div></button>`).join('')}</div></article>`;
 $('#resus [data-back]').onclick=goHome;
 document.querySelectorAll('[data-sim]').forEach(b=>b.onclick=()=>{sim={index:+b.dataset.sim,pos:0,score:0,attempts:0,locked:false};renderResus()});
}
function renderResus(){
 const data=DATA.resus[sim.index],st=data.steps[sim.pos];sim.order=shuffle(st.opts.map((_,i)=>i));
 $('#resus').innerHTML=`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לרשימת התרחישים">✕</button><div class="progress-wrap"><div class="progress-label"><span>${data.icon} ${esc(data.name)}</span><span>${sim.score} נק׳</span></div><div class="progress"><i style="width:${sim.pos/data.steps.length*100}%"></i></div></div></header><article class="quiz-card"><div class="step-dots" aria-label="שלב ${sim.pos+1} מתוך ${data.steps.length}">${data.steps.map((_,i)=>`<i class="${i<sim.pos?'done':i===sim.pos?'now':''}"></i>`).join('')}</div><div class="scene-box"><b>המצב:</b> ${esc(data.intro)}</div><h2 class="question">${esc(st.prompt)}</h2><div class="answers">${sim.order.map((o,i)=>`<button class="answer" type="button" data-choice="${o}"><span class="letter" aria-hidden="true">${'אבגד'[i]}</span><span>${esc(st.opts[o])}</span></button>`).join('')}</div><div id="simFeedback" aria-live="polite"></div></article>`;
 $('#resus [data-back]').onclick=resusMenu;
 document.querySelectorAll('#resus .answer').forEach(b=>b.onclick=()=>chooseResus(+b.dataset.choice,b));
}
function chooseResus(choice,button){
 if(sim.locked)return;const data=DATA.resus[sim.index],st=data.steps[sim.pos];sim.attempts++;
 if(choice===0){
  sim.locked=true;sim.score+=sim.attempts===1?150:75;button.classList.add('correct');document.querySelectorAll('#resus .answer').forEach(x=>x.disabled=true);
  $('#simFeedback').innerHTML=`<div class="scenario-feedback good"><b>נכון.</b> ${esc(st.why)}</div><div class="next-row"><span></span><button class="primary" type="button" id="simNext">${sim.pos===data.steps.length-1?'לסיום התרחיש':'לשלב הבא ←'}</button></div>`;
  const nb=$('#simNext');nb.focus();nb.onclick=()=>{sim.pos++;sim.attempts=0;sim.locked=false;sim.pos>=data.steps.length?finishResus():renderResus()};Course.beep('ok');
 }else{
  button.classList.add('wrong');button.disabled=true;sim.score=Math.max(0,sim.score-25);
  $('#simFeedback').innerHTML=`<div class="scenario-feedback bad"><b>לא בשלב הזה.</b> ${esc(st.not[choice-1]||'הפעולה לא מתאימה עכשיו.')} נסו שוב.</div>`;Course.beep('bad');
 }
}
function finishResus(){
 const data=DATA.resus[sim.index],max=data.steps.length*150,pct=Math.round(sim.score/max*100);
 Course.profile.resusBest[sim.index]=Math.max(Course.profile.resusBest[sim.index]||0,pct);Course.addXp(sim.score);Course.save();Course.beep('win');
 const res={title:`תרחיש החייאה: ${data.name}`,summary:`${pct}% ב־${data.steps.length} החלטות`,score:sim.score};
 $('#resus').innerHTML=`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לרשימת התרחישים">✕</button><div class="progress-wrap"><div class="progress-label"><span>${esc(data.name)}</span><span>${sim.score} נק׳</span></div><div class="progress"><i style="width:100%"></i></div></div></header><article class="quiz-card center"><div class="big-emoji" aria-hidden="true">${pct>=85?'🚑':'🩺'}</div><h2 class="question">סיימתם את התרחיש</h2><div class="result-grid"><div class="stat"><b>${pct}%</b><small>ציון</small></div><div class="stat"><b>${data.steps.length}</b><small>החלטות</small></div><div class="stat"><b>${sim.score}</b><small>נקודות</small></div></div><div class="c-actions"><button class="c-btn primary" type="button" data-more>תרחיש אחר</button><button class="c-btn" type="button" data-again>שוב את אותו תרחיש</button><button class="c-btn" type="button" data-share>📱 לשלוח ליחיאל</button></div></article>`;
 $('#resus [data-back]').onclick=resusMenu;$('#resus [data-more]').onclick=resusMenu;$('#resus [data-again]').onclick=()=>{sim={index:sim.index,pos:0,score:0,attempts:0,locked:false};renderResus()};$('#resus [data-share]').onclick=()=>share(INSTRUCTOR_PHONE,res);
}

// ---- סדר את הטיפול ----
let seq=null;
function seqMenu(){
 show('seq');if(!history.state||history.state.view!=='seq')Course.nav.push('seq');
 const best=Course.profile.seqBest;
 $('#seq').innerHTML=`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לתפריט">✕</button><div class="progress-wrap"><div class="progress-label"><span>סדר את הטיפול</span><span>בחרו מצב</span></div></div></header><article class="quiz-card"><h2 class="question">איזה רצף בונים?</h2><p class="muted">לוחצים על הפעולות לפי הסדר שבו עושים אותן.</p><div class="scenario-list">${DATA.sequences.map((x,i)=>`<button class="scenario-pick" type="button" data-seq="${i}"><span aria-hidden="true">${x.icon}</span><div><b>${esc(x.name)}</b><small>${x.steps.length} פעולות${best[i]!=null?` · שיא ${best[i]}%`:''}</small></div></button>`).join('')}</div></article>`;
 $('#seq [data-back]').onclick=goHome;
 document.querySelectorAll('[data-seq]').forEach(b=>b.onclick=()=>{const data=DATA.sequences[+b.dataset.seq];seq={index:+b.dataset.seq,next:0,penalty:0,wrong:0,chosen:[],pool:shuffle(data.steps.map((text,pos)=>({text,pos})))};renderSeq()});
}
function renderSeq(msg){
 const data=DATA.sequences[seq.index],score=Math.max(0,seq.next*100-seq.penalty);
 $('#seq').innerHTML=`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לרשימה">✕</button><div class="progress-wrap"><div class="progress-label"><span>${data.icon} ${esc(data.name)}</span><span>${score} נק׳</span></div><div class="progress"><i style="width:${seq.next/data.steps.length*100}%"></i></div></div></header><article class="quiz-card"><div class="scene-box"><b>המצב:</b> ${esc(data.intro)}</div><div class="sequence-built">${seq.chosen.length?seq.chosen.map((x,i)=>`<div class="sequence-done"><b>${i+1}</b><span>${esc(x.text)}</span></div>`).join(''):'<div class="muted">עוד לא נבחרה פעולה.</div>'}</div><h2 class="question small">מה הפעולה הבאה?</h2><div id="sequenceFeedback" aria-live="polite">${msg||''}</div><div class="sequence-options">${seq.pool.filter(x=>x.pos>=seq.next).map(x=>`<button class="sequence-option" type="button" data-position="${x.pos}"><span aria-hidden="true">?</span><b>${esc(x.text)}</b></button>`).join('')}</div></article>`;
 $('#seq [data-back]').onclick=seqMenu;
 document.querySelectorAll('.sequence-option').forEach(b=>b.onclick=()=>chooseSeq(+b.dataset.position,b));
}
function chooseSeq(pos,button){
 const data=DATA.sequences[seq.index];
 if(pos!==seq.next){seq.wrong++;seq.penalty+=25;Course.beep('bad');renderSeq(`<div class="scenario-feedback bad"><b>עוד לא.</b> „${esc(data.steps[pos])}” מגיעה בשלב ${pos+1}. מה צריך לבוא בשלב ${seq.next+1}?</div>`);return}
 seq.chosen.push(seq.pool.find(x=>x.pos===pos));seq.next++;Course.beep('ok');
 if(seq.next===data.steps.length)finishSeq();else renderSeq();
}
function finishSeq(){
 const data=DATA.sequences[seq.index],max=data.steps.length*100,score=Math.max(0,seq.next*100-seq.penalty),pct=Math.round(score/max*100);
 Course.profile.seqBest[seq.index]=Math.max(Course.profile.seqBest[seq.index]||0,pct);Course.addXp(score);Course.save();Course.beep('win');
 $('#seq').innerHTML=`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לרשימה">✕</button><div class="progress-wrap"><div class="progress-label"><span>${esc(data.name)}</span><span>${score} נק׳</span></div><div class="progress"><i style="width:100%"></i></div></div></header><article class="quiz-card"><h2 class="question">הרצף מלא</h2><div class="sequence-built">${data.steps.map((t,i)=>`<div class="sequence-done"><b>${i+1}</b><span>${esc(t)}</span></div>`).join('')}</div><div class="explain"><b>למה בסדר הזה?</b> ${esc(data.why)}</div><div class="result-grid"><div class="stat"><b>${pct}%</b><small>ציון</small></div><div class="stat"><b>${seq.wrong}</b><small>ניסיונות שגויים</small></div><div class="stat"><b>${score}</b><small>נקודות</small></div></div><div class="c-actions"><button class="c-btn primary" type="button" data-more>רצף אחר</button><button class="c-btn" type="button" data-again>שוב את אותו רצף</button></div></article>`;
 $('#seq [data-back]').onclick=seqMenu;$('#seq [data-more]').onclick=seqMenu;$('#seq [data-again]').onclick=()=>{seq={index:seq.index,next:0,penalty:0,wrong:0,chosen:[],pool:shuffle(data.steps.map((text,pos)=>({text,pos})))};renderSeq()};
}

// ---- משחק הזיכרון ----
function startMemory(){
 show('memory');if(!history.state||history.state.view!=='memory')Course.nav.push('memory');
 const pairs=shuffle(DATA.pairs).slice(0,6);
 const cards=shuffle(pairs.flatMap((p,id)=>p.map(text=>({id,text}))));
 let open=[],matched=0,moves=0,lock=false;
 $('#memory').innerHTML=`<header class="game-head"><button class="icon-btn" type="button" data-back aria-label="חזרה לתפריט">✕</button><div class="progress-wrap"><div class="progress-label"><span>משחק הזיכרון</span><span data-moves>0 מהלכים</span></div><div class="progress"><i data-mbar></i></div></div></header><article class="quiz-card"><h2 class="question small">מצאו את 6 הזוגות</h2><p class="muted">לכל מושג יש הגדרה אחת שמתאימה לו. בכל משחק יש זוגות אחרים.</p><div class="memory-grid">${cards.map((c,i)=>`<button class="memory-card" type="button" data-i="${i}" aria-label="קלף סגור">${esc(c.text)}</button>`).join('')}</div></article>`;
 $('#memory [data-back]').onclick=goHome;
 document.querySelectorAll('.memory-card').forEach(b=>b.onclick=()=>{
  const i=+b.dataset.i;if(lock||b.classList.contains('open')||b.classList.contains('matched'))return;
  b.classList.add('open');b.setAttribute('aria-label',cards[i].text);open.push({i,b});
  if(open.length<2)return;
  moves++;$('#memory [data-moves]').textContent=`${moves} מהלכים`;
  const [x,y]=open;open=[];
  if(cards[x.i].id===cards[y.i].id){[x.b,y.b].forEach(e=>{e.classList.remove('open');e.classList.add('matched');e.disabled=true});matched++;$('#memory [data-mbar]').style.width=`${matched/6*100}%`;Course.beep('ok');if(matched===6)setTimeout(()=>memoryWin(moves,pairs),400)}
  else{lock=true;Course.beep('bad');setTimeout(()=>{[x.b,y.b].forEach(e=>{e.classList.remove('open');e.setAttribute('aria-label','קלף סגור')});lock=false},900)}
 });
}
function memoryWin(moves,pairs){
 const score=Math.max(100,500-moves*10);Course.profile.memoryWins=(Course.profile.memoryWins||0)+1;Course.addXp(score);Course.save();Course.beep('win');
 const card=Course.openModal(`<div class="big-emoji" aria-hidden="true">🧠</div><h2>כל הזוגות נמצאו</h2><p>${moves} מהלכים · ${score} נקודות</p><div class="pair-list">${pairs.map(p=>`<div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div><div class="c-actions"><button class="c-btn primary" type="button" data-again>משחק חדש</button><button class="c-btn" type="button" data-menu>לתפריט</button></div>`);
 card.querySelector('[data-again]').onclick=()=>{Course.closeModal(true);startMemory()};card.querySelector('[data-menu]').onclick=()=>{Course.closeModal(true);goHome()};
}

// ---- תרגולי ידיים (cpr-drills.js) ומקרים מתפצלים (cpr-cases.js) ----
const DRILLS={rhythm:CprDrills,aed:CprDrills,whatnow:CprCases,branch:CprCases};
function openDrill(view){const m=DRILLS[view];show(view);if(!history.state||history.state.view!==view)Course.nav.push(view);m[view]($('#'+view),{onExit:()=>{m.stop();goHome()}})}

// ---- חיבור כפתורים ----
$('#dailyBtn').onclick=()=>startQuiz(dailyItems(),{label:'תרגול יומי · חלק א׳',mode:'bank'});
$('#bankBtn').onclick=()=>{const items=bankItems();if(!items.length){Course.toast('אין כרגע שאלות בבנק. טעויות ושאלות שתשמרו יופיעו כאן.');return}startQuiz(items,{label:'בנק הטעויות · חלק א׳',mode:'bank'})};
$('#examBtn').onclick=async()=>{if(await Course.confirm('מבחן לדוגמה','40 שאלות מכל הקטגוריות, 45 דקות. התשובות והציון יוצגו רק בסוף, כמו במבחן אמיתי. אפשר לחזור לשאלות קודמות ולשנות תשובה.','להתחיל','לא עכשיו'))startQuiz(examItems(),{label:'מבחן לדוגמה · חלק א׳',mode:'exam',examMinutes:45})};
$('#survivalBtn').onclick=()=>startQuiz(shuffle(ALL).slice(0,30),{label:'אתגר שלושה לבבות',mode:'challenge',lives:true});
$('#resusBtn').onclick=resusMenu;$('#seqBtn').onclick=seqMenu;$('#memoryBtn').onclick=startMemory;
$('#rhythmBtn').onclick=()=>openDrill('rhythm');$('#aedBtn').onclick=()=>openDrill('aed');
$('#whatnowBtn').onclick=()=>openDrill('whatnow');$('#branchBtn').onclick=()=>openDrill('branch');
Course.mountHeader({subtitle:'חלק א׳ · החייאה ויסודות'});
Course.onChange(()=>{if(!$('#home').classList.contains('hidden'))renderHome()});
renderHome();
})();
