// חלק ב׳: תפריט, תרגול לפי נושא, אתגר משולב, תרגול יומי, בנק טעויות ומבחן לדוגמה.
(function(){
const {esc,shuffle}=Course;
const TOPICS=window.PART2.topics;
const $=s=>document.querySelector(s);
const ALL=[];
TOPICS.forEach((t,i)=>t.qs.forEach(q=>{q.cat=t.name;q.sub=t.name;q.topicIndex=i;ALL.push(q)}));
const BY_ID=new Map(ALL.map(q=>[q.id,q]));
const isB=id=>BY_ID.has(id);
const topicIds=t=>t.qs.map(q=>q.id);

function show(view){['home','play'].forEach(v=>$('#'+v).classList.toggle('hidden',v!==view));window.scrollTo(0,0)}
function goHome(){Course.nav.home()}
Course.nav.init(view=>{if(view==='home'){Quiz.stop();show('home');renderHome()}});
if(location.hash)history.replaceState({view:'home'},'',location.pathname);

function renderHome(){
 const p=Course.profile,ids=ALL.map(q=>q.id),cov=Course.coverage(ids);
 TOPICS.forEach((t,i)=>Course.starsFor('b:'+i,topicIds(t)));
 const st=Course.starTotals();
 const answered=ids.reduce((s,id)=>s+(p.seen[id]?p.seen[id].n:0),0),right=ids.reduce((s,id)=>s+(p.seen[id]?p.seen[id].c:0),0);
 $('#hubStats').innerHTML=`<div><b>${cov.ok}/${cov.total}</b><small>שאלות שעניתם עליהן נכון</small></div><div><b>${answered?Math.round(right/answered*100)+'%':'—'}</b><small>דיוק בכל התשובות</small></div><div><b>${st.b}/${st.maxB}</b><small>כוכבים בחלק ב׳</small></div><div><b>${p.examBest.b!=null?p.examBest.b+'%':'—'}</b><small>שיא במבחן לדוגמה</small></div>`;
 const bank=Course.bankInfo(isB),saved=p.saved.filter(isB).length;
 $('#bankLabel').textContent=bank.total||saved?`${bank.total} בבנק${bank.due?`, ${bank.due} לחזרה היום`:''}${saved?` · ${saved} שמורות`:''}`:'אין כרגע טעויות. יופי.';
 const r=p.resume.b;
 $('#resumeBox').innerHTML=r?`<div class="resume-box"><div><b>יש תרגול שלא סיימתם</b><span>${esc(r.label)} · ${r.mode==='exam'?`${Object.keys(r.choices||{}).length} תשובות מתוך ${r.ids.length}`:`ענית על ${(r.answers||[]).length} מתוך ${r.ids.length}`}</span></div><button class="c-btn primary" type="button" id="resumeGo">להמשיך</button><button class="c-btn" type="button" id="resumeDrop">לוותר עליו</button></div>`:'';
 if(r){$('#resumeGo').onclick=resume;$('#resumeDrop').onclick=()=>{delete p.resume.b;Course.save();renderHome()}}
 $('#topics').innerHTML=TOPICS.map((t,i)=>{const c=Course.coverage(topicIds(t)),stars=Course.starsFor('b:'+i,topicIds(t));return `<button class="topic-card" type="button" data-topic="${i}" data-icon="${t.icon}" style="--topic:${t.color}"><span class="topic-no">0${i+1}</span><h3>${t.icon} ${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="topic-foot"><span>${c.ok}/${c.total} נכונות</span><span class="topic-stars" aria-label="${stars} כוכבים מתוך 3">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span></div><i class="topic-bar"><em style="width:${c.ok/c.total*100}%"></em></i></button>`}).join('');
 document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>openTopic(+b.dataset.topic));
 Course.refreshHeader();
}

function startQuiz(items,cfg,state){
 if(!items.length){Course.toast('אין שאלות להצגה');return}
 Course.closeModal(true);
 if(!state)delete Course.profile.resume.b;
 Course.setLast('part2-review.html',cfg.label);
 show('play');Course.nav.push('play');
 Quiz.start(Object.assign({host:$('#play'),page:'b',items,baseTime:35,state,showCat:cfg.mode!=='practice',onExit:goHome,onFinish:()=>{TOPICS.forEach((t,i)=>Course.starsFor('b:'+i,topicIds(t)));Course.save()},summaryExtra:()=>'<p class="c-note">רוצים לתרגל את זה בזירה? <a href="index.html#simulator">לסימולטור האנמנזה</a></p>'},cfg));
}
function resume(){
 const r=Course.profile.resume.b;if(!r)return;
 const items=r.ids.map(id=>BY_ID.get(id)).filter(Boolean);
 if(items.length!==r.ids.length){delete Course.profile.resume.b;Course.save();Course.toast('התרגול הזה כבר לא זמין. מתחילים חדש.');renderHome();return}
 startQuiz(items,{label:r.label,mode:r.mode,lives:r.lifeMode,examMinutes:r.examMinutes||0},r);
}

function notYet(list){return list.filter(q=>!(Course.profile.seen[q.id]&&Course.profile.seen[q.id].ok))}
function openTopic(i){
 const t=TOPICS[i],open=notYet(t.qs);
 const short=[...shuffle(open),...shuffle(t.qs.filter(q=>!open.includes(q)))].slice(0,10);
 const card=Course.openModal(`<div class="big-emoji" aria-hidden="true">${t.icon}</div><h2>${esc(t.name)}</h2><p>${esc(t.desc)}</p><div class="setup-grid"><button class="setup-choice" type="button" data-m="short"><span aria-hidden="true">⏱</span><b>סבב קצר</b><small>10 שאלות. קודם אלה שעוד לא עניתם נכון</small></button><button class="setup-choice" type="button" data-m="all"><span aria-hidden="true">🎓</span><b>כל הנושא</b><small>${t.qs.length} שאלות</small></button><button class="setup-choice" type="button" data-m="open" ${open.length?'':'disabled'}><span aria-hidden="true">🎯</span><b>מה שעוד לא עניתי נכון</b><small>${open.length} שאלות</small></button></div><p class="c-note">הכוכבים נקבעים לפי כמה משאלות הנושא עניתם נכון בפעם האחרונה: חצי = כוכב, 75% = שניים, 90% = שלושה.</p>`,{label:t.name});
 card.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const m=b.dataset.m;const items=m==='short'?short:m==='all'?shuffle(t.qs):shuffle(open);startQuiz(items,{label:`${t.name} · ${m==='short'?'סבב קצר':m==='all'?'כל הנושא':'מה שעוד לא עניתי נכון'}`,mode:'practice'})});
}
function mixedItems(){return shuffle(TOPICS.flatMap(t=>shuffle(t.qs).slice(0,2)))}
function dailyItems(){
 const p=Course.profile,picked=new Set(),out=[];const add=q=>{if(q&&!picked.has(q.id)&&out.length<12){picked.add(q.id);out.push(q)}};
 Course.bankIds(isB).filter(x=>x.due).forEach(x=>add(BY_ID.get(x.id)));
 p.saved.filter(isB).forEach(id=>add(BY_ID.get(id)));
 const weakest=TOPICS.map(t=>({t,c:Course.coverage(topicIds(t))})).sort((a,b)=>a.c.ok/a.c.total-b.c.ok/b.c.total)[0].t;
 shuffle(notYet(weakest.qs)).slice(0,5).forEach(add);
 shuffle(ALL.filter(q=>!p.seen[q.id])).forEach(add);shuffle(ALL).forEach(add);
 return shuffle(out);
}
function bankItems(){const b=Course.bankIds(isB),ids=[...b.filter(x=>x.due).map(x=>x.id),...Course.profile.saved.filter(isB),...b.filter(x=>!x.due).map(x=>x.id)];return [...new Set(ids)].slice(0,20).map(id=>BY_ID.get(id)).filter(Boolean)}

$('#dailyBtn').onclick=()=>startQuiz(dailyItems(),{label:'תרגול יומי · חלק ב׳',mode:'bank'});
$('#mixedBtn').onclick=()=>startQuiz(mixedItems(),{label:'אתגר משולב · חלק ב׳',mode:'challenge',lives:true});
$('#bankBtn').onclick=()=>{const items=bankItems();if(!items.length){Course.toast('אין כרגע שאלות בבנק. טעויות ושאלות שתשמרו יופיעו כאן.');return}startQuiz(items,{label:'בנק הטעויות · חלק ב׳',mode:'bank'})};
$('#examBtn').onclick=async()=>{if(await Course.confirm('מבחן לדוגמה','28 שאלות, ארבע מכל נושא, 30 דקות. הציון והתשובות יוצגו רק בסוף. אפשר לחזור לשאלות קודמות ולשנות תשובה.','להתחיל','לא עכשיו'))startQuiz(shuffle(TOPICS.flatMap(t=>shuffle(t.qs).slice(0,4))),{label:'מבחן לדוגמה · חלק ב׳',mode:'exam',examMinutes:30})};
Course.mountHeader({subtitle:'חלק ב׳ · מצבי חירום רפואיים'});
Course.onChange(()=>{if(!$('#home').classList.contains('hidden'))renderHome()});
renderHome();
if(new URLSearchParams(location.search).get('mode')==='mixed'){history.replaceState({view:'home'},'',location.pathname);$('#mixedBtn').click()}
})();
