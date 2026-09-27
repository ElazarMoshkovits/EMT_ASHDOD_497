// דף הבית וסימולטור האנמנזה.
(function(){
const app=document.getElementById('app');
const {esc,shuffle}=Course;
const labels={safety:'בטיחות',primary:'הערכה ראשונית',emergency:'זיהוי מצב חירום',priorities:'סדר עדיפויות וטיפול',anamnesis:'אנמנזה',followup:'שאלות המשך',reassessment:'הערכה חוזרת',reasoning:'חשיבה קלינית ודיווח'};
const LEVEL_OF=d=>d==='מתחיל'||d==='קל'?'קל':d==='מתקדם'||d==='קשה'?'קשה':'בינוני';
const LEVEL_TEXT={'קל':'מקרים ברורים יחסית. מתרגלים סדר עבודה ואנמנזה בסיסית.','בינוני':'צריך לחבר בין ממצאים, עדים ושאלות המשך.','קשה':'התמונה לא ברורה בהתחלה. הפרטים החשובים מתגלים רק אם בודקים ושואלים נכון.'};
const REASONING_TITLES={impression:'מה החשד העיקרי שלך?',urgency:'איך ממשיכים מכאן?',handoff:'איזה דיווח תמסור לצוות שמקבל את המטופל?'};
let engine=null,activeTab='actions',lastFeedback=null,report=null,reasoningOrder={};

const isA=id=>!id.startsWith('p2-');
const sc=id=>SCENARIOS.find(x=>x.id===id);

// ---------- ניתוב ----------
function route(){
 const h=decodeURIComponent(location.hash.slice(1));
 if(h.startsWith('case/')){const id=h.slice(5);if(engine&&engine.scenario.id===id&&engine.state.phase!=='done'){renderGame();return}if(sc(id)){start(id);return}}
 if(h.startsWith('report/')&&report&&report.id===h.slice(7)){renderReport();return}
 if(h==='simulator'||h==='part-b'||h.startsWith('case/')||h.startsWith('report/')){renderList();return}
 renderHome();
}
window.addEventListener('hashchange',()=>{Course.closeModal(true);route()});
function go(hash){if(location.hash==='#'+hash)route();else location.hash=hash}

function top(){window.scrollTo({top:0,left:0,behavior:'auto'})}
function shell(inner){app.innerHTML=`<header class="course-topbar"></header>${inner}${Course.footer()}`;Course.mountHeader({subtitle:app.dataset.sub||''})}

// ---------- דף הבית ----------
function renderHome(){
 app.dataset.part='home';app.dataset.sub='';engine=null;
 const p=Course.profile,st=Course.starTotals(),bankA=Course.bankInfo(isA),bankB=Course.bankInfo(id=>!isA(id));
 const done=SCENARIOS.filter(s=>p.simBest[s.id]!=null),avg=done.length?Math.round(done.reduce((t,s)=>t+p.simBest[s.id],0)/done.length):0;
 const name=p.name!==Course.DEFAULT_NAME?`, ${esc(p.name)}`:'';
 const due=bankA.due+bankB.due;
 const cont=p.last&&p.last.href?`<a class="home-card continue" href="${esc(p.last.href)}"><small>להמשיך מאיפה שעצרת</small><b>${esc(p.last.label)}</b><span>←</span></a>`:'';
 const bank=due?`<a class="home-card bank" href="${bankA.due>=bankB.due?'review.html':'part2-review.html'}"><small>בנק הטעויות</small><b>${due} שאלות מחכות לחזרה היום</b><span>←</span></a>`:'';
 shell(`<section class="home-top"><div class="home-hello"><span class="kicker">קורס חובשים אשדוד 497</span><h1>שלום${name}. <em>מה מתרגלים היום?</em></h1></div>${cont||bank?`<div class="home-cards">${cont}${bank}</div>`:''}</section>
 <section class="module-section"><div class="module-grid three">
  <a class="module-card review-module" href="review.html"><span class="module-number" aria-hidden="true">א׳</span><div><small>חלק א׳</small><h3>החייאה ויסודות</h3><p>אנטומיה, החייאה, AED, חנק ושטח. תרגול יומי, מבחן לדוגמה, תרחישים, סדר פעולות ומשחק זיכרון.</p><div class="mod-progress"><span>${st.a}/${st.maxA} ★</span><i><em style="width:${st.a/st.maxA*100}%"></em></i></div></div></a>
  <a class="module-card part2-module" href="part2-review.html"><span class="module-number" aria-hidden="true">ב׳</span><div><small>חלק ב׳</small><h3>מצבי חירום רפואיים</h3><p>שבעה נושאים: אנמנזה, עילפון ופרכוסים, שבץ, סוכרת, הרעלות, נשימה ולב.</p><div class="mod-progress"><span>${st.b}/${st.maxB} ★</span><i><em style="width:${st.b/st.maxB*100}%"></em></i></div></div></a>
  <a class="module-card anamnesis-module" href="#simulator"><span class="module-number" aria-hidden="true">🚨</span><div><small>חלק ב׳ · בזירה</small><h3>סימולטור אנמנזה</h3><p>${SCENARIOS.length} תרחישים. מעריכים, שואלים, מטפלים, מוסרים דיווח ומקבלים תחקיר.</p><div class="mod-progress"><span>${done.length}/${SCENARIOS.length} תרחישים${done.length?` · ממוצע ${avg}`:''}</span><i><em style="width:${done.length/SCENARIOS.length*100}%"></em></i></div></div></a>
 </div></section>`);
 top();
}

// ---------- רשימת תרחישים ----------
function renderList(){
 app.dataset.part='b';app.dataset.sub='סימולטור אנמנזה';engine=null;
 const p=Course.profile,r=p.resume.sim&&sc(p.resume.sim.id)?p.resume.sim:null;let n=0;
 const groups=['קל','בינוני','קשה'].map(level=>{
  const cards=SCENARIOS.filter(s=>LEVEL_OF(s.difficulty)===level).map(s=>{n++;const best=p.simBest[s.id];return `<a class="scenario-card" href="#case/${esc(s.id)}"><span class="case-no" aria-hidden="true">${String(n).padStart(2,'0')}</span><div class="difficulty ${level}">${level}</div>${best!=null?`<span class="best-badge${best>=85?' good':best>=65?' mid':''}">שיא ${best}</span>`:''}<h3>${esc(s.scene.dispatchReason)}</h3><p>${esc(s.scene.location)}</p><div class="card-foot"><span>${esc(s.category)}</span><span>${esc(s.duration)}</span></div></a>`}).join('');
  return `<section class="difficulty-group" aria-labelledby="lv-${level}"><div class="difficulty-heading"><div><span>${level}</span><h3 id="lv-${level}">רמה: ${level}</h3></div><p>${LEVEL_TEXT[level]}</p></div><div class="scenario-grid">${cards}</div></section>`;
 }).join('');
 shell(`<section class="cases-section part-b-picker"><div class="section-head"><div><h2>סימולטור אנמנזה</h2></div><a class="back" href="#">← לדף הבית</a></div><p class="lead">בוחרים זירה, מעריכים את המטופל, שואלים ומטפלים. בסוף עונים מה החשד, איך מפנים ומה מדווחים, ומקבלים תחקיר.</p>${r?`<div class="resume-box"><div><b>יש תרחיש שלא סיימתם</b><span>${esc(sc(r.id).scene.dispatchReason)} · ${r.history.length} פעולות ושאלות</span></div><a class="c-btn primary" href="#case/${esc(r.id)}">להמשיך</a><button class="c-btn" type="button" id="resumeDrop">לוותר עליו</button></div>`:''}${groups}</section>`);
 const d=document.getElementById('resumeDrop');if(d)d.onclick=()=>{delete p.resume.sim;Course.save();renderList()};
 top();
}

// ---------- משחק ----------
function start(id){
 const s=sc(id),saved=Course.profile.resume.sim;
 engine=new AnamnesisEngine(s);activeTab='actions';lastFeedback=null;report=null;
 if(saved&&saved.id===id&&saved.history&&saved.history.length){engine.replay(saved.history);lastFeedback={kind:'info',text:'ממשיכים מאיפה שעצרתם.'};renderGame();top();return}
 Course.setLast('index.html#simulator','סימולטור: '+s.scene.dispatchReason);
 renderGame();top();showIntro();
}
function showIntro(){
 const s=engine.scenario;
 const card=Course.openModal(`<span class="kicker">הודעה מהמוקד</span><h2>${esc(s.scene.dispatchReason)}</h2><dl class="intro-dl"><div><dt>מקום</dt><dd>${esc(s.scene.location)}</dd></div><div><dt>מידע מקדים</dt><dd>${esc(s.scene.preArrivalInfo)}</dd></div></dl>${s.learningObjectives?`<div class="goals"><b>על מה התרגיל בודק</b><ul>${s.learningObjectives.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div>`:''}${Course.profile.guideSeen?'':`<div class="goals"><b>איך זה עובד</b><ul><li>מתחילים בבטיחות ובהערכה ראשונית (ABCDE), בלשונית ״פעולות״.</li><li>שואלים את המטופל ואת העדים בלשונית ״אנמנזה״. תשובות חשובות פותחות שאלות המשך.</li><li>אחרי טיפול עושים מדידה חוזרת. אם מתעכבים, המצב יכול להחמיר.</li><li>בסוף לוחצים ״סיום ותחקיר״: עונים מה החשד, איך מפנים ומה מדווחים.</li></ul></div>`}<div class="c-actions"><button class="c-btn primary" type="button" data-go autofocus>יוצאים לזירה</button></div>`,{label:'הודעה מהמוקד',onClose:markGuide});
 card.querySelector('[data-go]').onclick=()=>{Course.closeModal(true);markGuide();Course.beep('click')};
}
function markGuide(){if(!Course.profile.guideSeen){Course.profile.guideSeen=true;Course.save()}}
function persistSim(){Course.profile.resume.sim={id:engine.scenario.id,history:engine.state.history.slice(),ts:Date.now()};Course.save()}

function actionButtons(items){return items.map(a=>{const done=engine.didAction(a.id),locked=(a.requires||[]).some(f=>!engine.hasFact(f));return `<button class="action-btn ${done?'done':''}" type="button" data-action="${a.id}" ${done?'disabled':''}><span aria-hidden="true">${done?'✓':'+'}</span><div><b>${esc(a.label)}</b>${locked&&!done?'<small>צריך קודם עוד מידע</small>':''}</div></button>`}).join('')}
function actionsView(){const s=engine.scenario;const sec=(letter,title,list)=>list.length?`<div class="action-section"><h3><span>${letter}</span> ${title}</h3><div class="action-list">${actionButtons(list)}</div></div>`:'';return sec('A','בטיחות והערכת זירה',s.actions.filter(a=>a.group==='safety'))+sec('B','הערכה ראשונית',s.primaryAssessment)+sec('C','טיפול, משאבים ופינוי',s.actions.filter(a=>!['safety','reassessment'].includes(a.group)))+sec('D','הערכה חוזרת',s.actions.filter(a=>a.group==='reassessment'))}
function questionsView(){const qs=engine.scenario.anamnesis.filter(q=>engine.isQuestionAvailable(q));return `<div class="question-hint">אחרי תשובות חשובות נפתחות שאלות המשך.</div><div class="question-list">${qs.length?qs.map(q=>`<button class="question-btn" type="button" data-question="${q.id}"><b>${esc(q.text)}</b></button>`).join(''):'<div class="empty">כל השאלות הזמינות כבר נשאלו.</div>'}</div>`}
function infoView(){
 const s=engine.scenario,facts=engine.state.facts.filter(id=>s.facts[id]),asked=engine.state.questions.map(id=>s.anamnesis.find(q=>q.id===id)).filter(Boolean);
 if(!facts.length&&!asked.length)return '<div class="empty">כאן יופיע מה שגיליתם בבדיקות ובשאלות.</div>';
 return `${facts.length?`<h3 class="info-h">ממצאים</h3><div class="facts-grid">${facts.map(id=>`<article><p>${esc(s.facts[id])}</p></article>`).join('')}</div>`:''}${asked.length?`<h3 class="info-h">מה נאמר</h3><div class="qa-list">${asked.map(q=>`<article><b>${esc(q.text)}</b><p>${esc(q.answer)}</p></article>`).join('')}</div>`:''}`;
}
function vitalsStrip(){
 const log=engine.state.vitalLog,keys=Object.keys(engine.scenario.patient.vitals);
 return `<section class="vitals-strip" aria-label="מדדים"><div class="vitals-list">${keys.map(k=>{const h=log[k];if(!h)return `<div><small>${VITAL_LABELS[k]||k}</small><b class="muted">—</b></div>`;const vals=h.map(x=>x.v),last=vals[vals.length-1],prev=vals.length>1?vals[vals.length-2]:null;return `<div class="${prev&&prev!==last?'changed':''}"><small>${VITAL_LABELS[k]||k}</small><b>${esc(last)}</b>${prev&&prev!==last?`<em>קודם: ${esc(prev)}</em>`:h.length>1?'<em>ללא שינוי</em>':''}</div>`}).join('')}</div><button class="c-btn small" type="button" data-remeasure ${engine.measuredKeys().length?'':'disabled'}>מדידה חוזרת</button></section>`;
}
function feedbackBox(){
 if(!lastFeedback)return '';
 return `<div class="sim-feedback ${lastFeedback.kind}" role="status"><p>${esc(lastFeedback.text)}</p>${lastFeedback.extra?`<p class="extra">${esc(lastFeedback.extra)}</p>`:''}<button type="button" class="fb-close" data-fb-close aria-label="סגירת ההודעה">✕</button></div>`;
}
function renderGame(){
 const s=engine.scenario,st=engine.state,available=s.anamnesis.filter(q=>engine.isQuestionAvailable(q)).length;
 app.dataset.part='b';app.dataset.sub='סימולטור אנמנזה';
 const tab=activeTab==='questions'?questionsView():activeTab==='info'?infoView():actionsView();
 shell(`<header class="game-top"><a class="back" href="#simulator">← לרשימה</a><div class="case-title"><span>${esc(LEVEL_OF(s.difficulty))} · ${esc(s.category)}</span><b>${esc(s.scene.dispatchReason)}</b></div><button class="finish" type="button" id="finish">סיום ותחקיר</button></header>
 <section class="status-strip"><div><small>מצב הכרה</small><b>${esc(st.patient.consciousness)}</b></div><div><small>פעולות</small><b>${st.actions.length}</b></div><div><small>שאלות</small><b>${st.questions.length}</b></div><div><small>שינויים במצב</small><b>${st.events.length}</b></div></section>
 ${vitalsStrip()}
 <details class="anamnesis-guide"><summary><span>איך זה עובד?</span><small>ארבעה צעדים</small></summary><div class="guide-body"><ol><li><span>1</span><div><b>בטיחות והערכה ראשונית</b><small>מתחילים בזירה ובכפפות, ואז ABCDE.</small></div></li><li><span>2</span><div><b>שואלים</b><small>בלשונית ״אנמנזה״: תלונה, זמן התחלה, רקע, תרופות ורגישויות.</small></div></li><li><span>3</span><div><b>מטפלים ובודקים שוב</b><small>אחרי טיפול עושים מדידה חוזרת. המצב יכול להשתנות.</small></div></li><li><span>4</span><div><b>מסיימים</b><small>״סיום ותחקיר״: חשד, פינוי ודיווח, ואז תחקיר מלא.</small></div></li></ol></div></details>
 <div class="workspace"><aside class="scene-panel"><span class="panel-kicker">הודעה מהמוקד</span><h2>${esc(s.scene.dispatchReason)}</h2><div class="arrival"><small>במבט ראשון</small><p>${esc(s.scene.immediateView)}</p></div><details class="scene-more"><summary>פרטי הקריאה</summary><dl><div><dt>מקום</dt><dd>${esc(s.scene.location)}</dd></div><div><dt>מטופלים</dt><dd>${s.scene.patientCount}</dd></div><div><dt>מידע מקדים</dt><dd>${esc(s.scene.preArrivalInfo)}</dd></div></dl>${s.learningObjectives?`<div class="goals"><b>על מה התרגיל בודק</b><ul>${s.learningObjectives.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div>`:''}</details></aside>
 <main class="control-panel"><nav class="tabs" role="tablist"><button class="tab ${activeTab==='actions'?'active':''}" type="button" role="tab" aria-selected="${activeTab==='actions'}" data-tab="actions">פעולות</button><button class="tab ${activeTab==='questions'?'active':''}" type="button" role="tab" aria-selected="${activeTab==='questions'}" data-tab="questions" aria-label="אנמנזה, ${available} שאלות זמינות">אנמנזה <i>${available}</i></button><button class="tab ${activeTab==='info'?'active':''}" type="button" role="tab" aria-selected="${activeTab==='info'}" data-tab="info" aria-label="מה גילינו, ${st.facts.length} פריטים">מה גילינו <i>${st.facts.length}</i></button></nav>${feedbackBox()}<div id="tab-content" role="tabpanel">${tab}</div></main>
 <aside class="log-panel"><div class="panel-kicker">יומן האירוע</div><div class="timeline">${st.log.length?st.log.slice().reverse().map((l,i)=>`<div class="log ${l.kind}"><span>${st.log.length-i}</span><p>${esc(l.text)}</p></div>`).join(''):'<div class="empty">עוד לא בוצעו פעולות.</div>'}</div></aside></div>`);
 bindGame();
}
function bindGame(){
 document.getElementById('finish').onclick=finishFlow;
 document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{Course.beep('click');activeTab=t.dataset.tab;renderGame()});
 const fc=document.querySelector('[data-fb-close]');if(fc)fc.onclick=()=>{lastFeedback=null;document.querySelector('.sim-feedback')?.remove()};
 const rm=document.querySelector('[data-remeasure]');if(rm)rm.onclick=()=>{const before=snapshot();const r=engine.remeasure();after(r,before)};
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const item=engine.allActions().find(a=>a.id===b.dataset.action),before=snapshot();before.item=item;const r=engine.perform(b.dataset.action);after(r,before)});
 document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{const before=snapshot(),r=engine.ask(b.dataset.question);after(r,before)});
}
function snapshot(){return{facts:engine.state.facts.length,events:engine.state.events.length,unlocked:engine.state.unlocked.length,log:engine.state.log.length}}
function after(r,before){
 const st=engine.state,newEvents=st.log.slice(before.log).filter(l=>l.kind==='event').map(l=>l.text);
 let kind='good';
 if(!r.ok)kind='bad';else if(newEvents.length)kind='event';else if(r.critical||(before.item&&(before.item.score?.points||0)<0))kind='bad';
 lastFeedback={kind,text:r.message,extra:newEvents.join(' ')||r.feedback||''};
 if(!r.ok)Course.beep('warning');else if(newEvents.length)Course.beep('deterioration');else if(kind==='bad')Course.beep('warning');else if(st.unlocked.length>before.unlocked)Course.beep('unlock');else Course.beep(st.facts.length>before.facts?'fact':'click');
 if(r.ok)persistSim();
 const y=window.scrollY;renderGame();window.scrollTo(0,y);
}

// ---------- סיום: חשד, פינוי ודיווח ----------
async function finishFlow(){
 const n=engine.state.actions.length+engine.state.questions.length;
 const ok=await Course.confirm('לסיים את הטיפול בזירה?',n<6?'עשיתם עד עכשיו מעט פעולות. אחרי הסיום אי אפשר לחזור לזירה.':'אחרי הסיום עונים על שלוש שאלות קצרות ומקבלים תחקיר.','לסיים','להמשיך בזירה');
 if(!ok)return;
 const keys=Object.keys(engine.scenario.reasoning||{});
 reasoningOrder={};keys.forEach(k=>{reasoningOrder[k]=shuffle(engine.scenario.reasoning[k].opts.map((_,i)=>i))});
 if(keys.length)renderReasoning(keys,0);else completeScenario();
}
function renderReasoning(keys,i){
 const key=keys[i],item=engine.scenario.reasoning[key],order=reasoningOrder[key];
 app.innerHTML=`<header class="course-topbar"></header><header class="game-top"><span></span><div class="case-title"><span>סיכום בזירה · ${i+1} מתוך ${keys.length}</span><b>${esc(engine.scenario.scene.dispatchReason)}</b></div><span></span></header><article class="quiz-card reasoning-card"><div class="step-dots">${keys.map((_,j)=>`<i class="${j<i?'done':j===i?'now':''}"></i>`).join('')}</div><h2 class="question">${esc(item.q||REASONING_TITLES[key])}</h2><div class="answers">${order.map((o,j)=>`<button class="answer" type="button" data-r="${o}"><span class="letter" aria-hidden="true">${'אבגד'[j]}</span><span>${esc(item.opts[o])}</span></button>`).join('')}</div><p class="key-hint">התשובות והציון יופיעו בתחקיר.</p></article>${Course.footer()}`;
 Course.mountHeader({subtitle:'סימולטור אנמנזה'});top();
 app.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{engine.answerReasoning(key,+b.dataset.r);Course.beep('click');if(i<keys.length-1)renderReasoning(keys,i+1);else completeScenario()});
}
function completeScenario(){
 engine.state.phase='done';
 const r=engine.getReport(),p=Course.profile,id=engine.scenario.id;
 const gain=Math.round(r.percent*10);Course.addXp(gain);
 p.simBest[id]=Math.max(p.simBest[id]||0,r.percent);delete p.resume.sim;Course.save();
 report={id,engine,r,gain};Course.beep('win');
 history.replaceState(null,'','#report/'+id);renderReport();
}

// ---------- תחקיר ----------
function listOr(items,fn,empty){return items.length?`<ul>${items.map(x=>`<li>${esc(fn(x))}</li>`).join('')}</ul>`:`<p class="none">${empty}</p>`}
function renderReport(){
 const {engine:e,r,gain}=report,s=e.scenario,label=id=>e.allActions().find(a=>a.id===id)?.label||id;
 const idx=SCENARIOS.indexOf(s),nextS=SCENARIOS[(idx+1)%SCENARIOS.length];
 const critItems=[...r.criticalActions.map(id=>({t:label(id),k:'בוצע'})),...r.missedCritical.map(id=>({t:label(id),k:'לא בוצע'}))];
 const rs=s.reasoning||{},rKeys=Object.keys(rs);
 const reasoningHtml=rKeys.length?`<section class="debrief reasoning"><h2>חשיבה קלינית ודיווח</h2>${rKeys.map(k=>{const item=rs[k],ch=e.state.reasoning[k],ok=ch===0;return `<article class="${ok?'ok':'no'}"><b>${ok?'✓':'✗'} ${esc(item.q||REASONING_TITLES[k])}</b>${ok?'':`<p class="mine">בחרת: ${esc(ch!=null?item.opts[ch]:'לא נבחרה תשובה')}</p>`}<p class="right">${esc(item.opts[0])}</p><p>${esc(item.why)}</p></article>`}).join('')}</section>`:'';
 const allRows=[...s.actions.filter(a=>a.group==='safety'),...s.primaryAssessment,...s.actions.filter(a=>a.group!=='safety')].map(a=>{const done=e.didAction(a.id),imp=a.importance,cls=imp==='חובה'?(done?'ok':'miss'):imp==='מיותרת'?(done?'bad':'ok'):(done?'ok':'');return `<tr class="${cls}"><td>${done?'✓':'—'}</td><td>${esc(a.label)}</td><td><span class="imp ${imp==='חובה'?'must':imp==='מיותרת'?'avoid':'nice'}">${imp==='מיותרת'?'לא לעשות':esc(imp)}</span></td></tr>`}).join('');
 const hasCrit=r.critical.length>0;const headline=hasCrit?'היו טעויות קריטיות':r.percent>=85?'עבודה מדויקת ובטוחה':r.percent>=65?'בסיס טוב, יש מה לחדד':'כדאי לתרגל את זה שוב';
 shell(`<header class="game-top"><a class="back" href="#simulator">← לכל התרחישים</a><div class="case-title"><span>תחקיר</span><b>${esc(s.scene.dispatchReason)}</b></div><button class="finish" type="button" id="retry">לנסות שוב</button></header>
 <section class="report-hero"><div class="score-ring${hasCrit?' capped':''}" style="--score:${r.percent*3.6}deg"><div><b>${r.percent}</b><small>מתוך 100</small></div></div><div><span class="kicker">סיכום</span><h1>${headline}</h1><p>${hasCrit?`טעות קריטית מגבילה את הציון ל־${CRITICAL_CAP} לכל היותר, גם אם כל השאר היה טוב.`:'הציון בודק מטרות קליניות ופעולות חובה, לא סדר לחיצות אחד.'}</p>${gain?`<div class="xp-award">+${gain} נקודות</div>`:''}</div></section>
 ${critItems.length?`<section class="debrief danger wide"><h2>טעויות קריטיות</h2><ul>${critItems.map(c=>`<li><b>${c.k==='לא בוצע'?'לא בוצע:':'בוצע:'}</b> ${esc(c.t)}</li>`).join('')}</ul></section>`:''}
 ${reasoningHtml}
 <section class="score-grid">${Object.keys(labels).filter(k=>(r.max[k]||0)>0).map(k=>{const val=Math.max(0,r.score[k]||0),max=r.max[k]||0,pct=max?Math.min(100,Math.round(val/max*100)):0;return `<article><div><span>${labels[k]}</span><b>${Math.min(val,max)}/${max}</b></div><i><em style="width:${pct}%"></em></i></article>`}).join('')}</section>
 <section class="debrief-grid"><article class="debrief warn"><h2>פעולות חובה שהוחמצו</h2>${listOr(r.missed,x=>x.label,'לא הוחמצו פעולות חובה.')}</article><article class="debrief"><h2>מידע חשוב שלא נאסף</h2>${listOr(r.missedFacts,x=>s.facts[x]||x,'כל המידע החשוב נאסף.')}</article><article class="debrief"><h2>שאלות המשך שכדאי היה לשאול</h2>${listOr(r.followups,x=>x.text,'לא נשארו שאלות המשך פתוחות.')}</article><article class="debrief"><h2>פעולות ושאלות מיותרות</h2>${listOr(r.unnecessary,x=>x.label||x.text,'לא היו.')}</article></section>
 <section class="debrief wide"><h2>כל הפעולות בתרחיש</h2><table class="action-table"><thead><tr><th>בוצע</th><th>פעולה</th><th>סוג</th></tr></thead><tbody>${allRows}</tbody></table></section>
 <section class="debrief path wide"><h2>הדרך המומלצת</h2><ol>${s.expectedPath.principles.map((step,i)=>`<li><span>${i+1}</span>${esc(step.map(id=>label(id)!==id?label(id):s.anamnesis.find(q=>q.id===id)?.text||id).join(' / '))}</li>`).join('')}</ol></section>
 ${s.learningObjectives?`<section class="debrief wide goals"><h2>על מה התרגיל בדק</h2><ul>${s.learningObjectives.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></section>`:''}
 <section class="why"><h2>למה זה חשוב</h2>${Object.values(s.feedback.explanations).map(x=>`<p>${esc(x)}</p>`).join('')}<small>בשטח פועלים לפי ההנחיות של המדריך שלנו, ר׳ יחיאל מייברג.</small></section>
 <div class="c-actions report-actions"><a class="c-btn primary" href="#case/${esc(nextS.id)}">לתרחיש הבא: ${esc(nextS.scene.dispatchReason)}</a><a class="c-btn" href="#simulator">לכל התרחישים</a></div>`);
 document.getElementById('retry').onclick=()=>{report=null;engine=null;delete Course.profile.resume.sim;history.replaceState(null,'','#case/'+s.id);start(s.id)};
 top();
}

route();
})();
