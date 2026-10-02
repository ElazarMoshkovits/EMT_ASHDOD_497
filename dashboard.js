// לוח התקדמות: סיכום אישי של שליטה לפי נושא, חזרות, ציונים ופעילות. כל הנתונים מגיעים מהפרופיל השמור בדפדפן.
(function(){
const {esc}=Course;
const $=s=>document.querySelector(s);
const DAYS_SHOWN=14,DAY=Course.DAY;
const INSTRUCTOR_PHONE='972543695010';
const pct=(a,b)=>b?Math.round(a/b*100):0;
const tone=v=>v==null?'none':v>=85?'good':v>=65?'mid':'low';
const score=v=>`<b class="${tone(v)}">${v==null?'—':v+'%'}</b>`;

function rowsOf(){
 const p=Course.profile,rows=[];
 const add=(part,href,key,icon,name,color,qs)=>{
  const ids=qs.map(q=>q.id),c=Course.coverage(ids);
  let n=0,right=0;ids.forEach(id=>{const s=p.seen[id];if(s){n+=s.n;right+=s.c}});
  rows.push({part,href,icon,name,color,total:ids.length,ok:c.ok,seen:c.seen,n,right,stars:Course.starsFor(key,ids)});
 };
 window.PART1.levels.forEach(l=>add('a','review.html','a:'+l.id,l.icon,l.name,l.color,l.qs));
 window.PART2.topics.forEach((t,i)=>add('b','part2-review.html','b:'+i,t.icon,t.name,t.color,t.qs));
 return rows;
}

// פעילות לפי יום. ימים שנרשמו ביומן נספרים לפי היומן; ימים ישנים יותר מוערכים לפי מועד התשובה האחרונה לכל שאלה.
function activity(){
 const p=Course.profile,log=p.days||{},est={};
 Object.values(p.seen).forEach(s=>{if(s&&s.last){const k=Course.dayKey(s.last);est[k]=(est[k]||0)+1}});
 const count=k=>log[k]?log[k].n:(est[k]||0);
 const list=[];
 for(let i=DAYS_SHOWN-1;i>=0;i--){const t=Date.now()-i*DAY;list.push({k:Course.dayKey(t),t,n:count(Course.dayKey(t))})}
 let streak=0;
 for(let i=0;i<120;i++){const n=count(Course.dayKey(Date.now()-i*DAY));if(n>0)streak++;else if(i===0)continue;else break}
 let best=0,run=0,prev=null;
 Object.keys(Object.assign({},est,log)).sort().forEach(k=>{
  if(count(k)<=0){run=0;prev=null;return}
  const d=new Date(k+'T12:00:00').getTime();
  run=prev&&d-prev<=DAY*1.5?run+1:1;prev=d;best=Math.max(best,run);
 });
 return{list,streak,best,week:list.slice(-7).reduce((s,x)=>s+x.n,0),activeDays:list.filter(x=>x.n>0).length};
}

function nextStep(rows,due,dueA,dueB){
 const p=Course.profile;
 if(due)return{text:`${due} שאלות מהבנק מחכות לחזרה היום`,label:'לחזרה עכשיו',href:dueA>=dueB?'review.html':'part2-review.html'};
 const open=rows.filter(r=>r.ok<r.total);
 if(!open.length)return{text:'ענית נכון על כל השאלות. אפשר לעשות מבחן לדוגמה כדי לשמור על הרמה.',label:'למבחן לדוגמה',href:'review.html'};
 const started=open.filter(r=>r.seen>0).sort((x,y)=>x.ok/x.total-y.ok/y.total)[0];
 if(started)return{text:`הנושא הכי פחות שלט כרגע: ${started.name} (${started.ok}/${started.total})`,label:'לתרגל אותו',href:started.href};
 const first=rows[0];
 return{text:p.xp?'יש עוד נושאים שעוד לא נגעת בהם.':'עוד לא התחלת לתרגל. מתחילים מהיסודות.',label:'להתחיל לתרגל',href:first.href};
}

function topicList(rows,part,title,href){
 const list=rows.filter(r=>r.part===part);
 const ok=list.reduce((s,r)=>s+r.ok,0),total=list.reduce((s,r)=>s+r.total,0);
 return `<div class="part-title"><span>${title} · ${ok}/${total} (${pct(ok,total)}%)</span><a href="${href}">לתרגול ←</a></div><div class="topics">${list.map(r=>{
  const m=pct(r.ok,r.total),acc=r.n?pct(r.right,r.n):null,weak=r.seen>0&&r.n>=3&&acc<65;
  return `<a class="trow${weak?' weak':''}" href="${r.href}" style="--tc:${esc(r.color)}" aria-label="${esc(r.name)}: ${r.ok} מתוך ${r.total} שאלות נענו נכון"><span class="tn"><span aria-hidden="true">${r.icon}</span><span>${esc(r.name)}</span></span><span class="bar" role="img" aria-label="${m}%"><em style="width:${m}%"></em></span><span class="tv"><b>${r.ok}/${r.total}</b> · ${'★'.repeat(r.stars)}${'☆'.repeat(3-r.stars)}</span></a>`}).join('')}</div>`;
}

function chart(act){
 const max=Math.max(1,...act.list.map(x=>x.n));
 const fmt=t=>new Date(t).toLocaleDateString('he-IL',{day:'numeric',month:'numeric'});
 return `<div class="chart" role="img" aria-label="תשובות ב־${DAYS_SHOWN} הימים האחרונים">${act.list.map(x=>`<div class="col${x.n?'':' zero'}" title="${fmt(x.t)}: ${x.n} תשובות"><i style="height:${Math.max(2,x.n/max*100)}%"></i></div>`).join('')}</div><div class="chart-axis"><span>${fmt(act.list[0].t)}</span><span>היום</span></div>`;
}

// ---- שליחת הסיכום למדריך בוואטסאפ ----
function normalizePhone(v){let n=String(v||'').replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n.startsWith('0'))n='972'+n.slice(1);return n}
function send(phone,text){
 const n=normalizePhone(phone);
 if(!/^\d{8,15}$/.test(n)){Course.toast('מספר הטלפון לא תקין',true);return}
 window.open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`,'_blank','noopener');
}
function sendOther(text){
 const card=Course.openModal(`<h2>למי לשלוח?</h2><label class="c-field"><span>מספר וואטסאפ</span><input type="tel" inputmode="tel" data-phone placeholder="050-0000000" autofocus></label><div class="c-actions"><button class="c-btn primary" type="button" data-send>לשלוח</button></div>`,{label:'שליחה למספר אחר'});
 card.querySelector('[data-send]').onclick=()=>{send(card.querySelector('[data-phone]').value,text);Course.closeModal(true)};
}
function summaryText(d){
 const p=Course.profile,name=p.name===Course.DEFAULT_NAME?'בלי שם':p.name;
 const lines=[`לוח התקדמות, קורס חובשים 497`,`שם: ${name}`,`תאריך: ${new Date().toLocaleDateString('he-IL')}`,'',
  `שליטה כללית: ${d.mastery}% (${d.ok}/${d.total} שאלות נכונות)`,
  `דיוק בכל התשובות: ${d.acc==null?'—':d.acc+'%'} מתוך ${d.n} תשובות`,
  `חלק א׳: ${d.okA}/${d.totalA} · חלק ב׳: ${d.okB}/${d.totalB}`,
  `כוכבים: ${d.stars}/${d.maxStars} · נקודות: ${d.xp}`,
  `רצף ימי תרגול: ${d.streak} · תשובות בשבוע האחרון: ${d.week}`,
  `שאלות לחזרה היום: ${d.due}`,
  `מבחן לדוגמה: חלק א׳ ${p.examBest.a!=null?p.examBest.a+'%':'—'}, חלק ב׳ ${p.examBest.b!=null?p.examBest.b+'%':'—'}`,
  `סימולטור אנמנזה: ${d.simDone}/${d.simTotal} תרחישים${d.simAvg!=null?`, ממוצע ${d.simAvg}`:''}`];
 if(d.weak.length)lines.push('','נושאים לחיזוק:',...d.weak.map(r=>`• ${r.name}: ${r.acc}%`));
 return lines.join('\n');
}

function render(){
 const p=Course.profile,rows=rowsOf(),st=Course.starTotals();
 const total=rows.reduce((s,r)=>s+r.total,0),ok=rows.reduce((s,r)=>s+r.ok,0),n=rows.reduce((s,r)=>s+r.n,0),right=rows.reduce((s,r)=>s+r.right,0);
 const isA=id=>!id.startsWith('p2-');
 const bA=Course.bankInfo(isA),bB=Course.bankInfo(id=>!isA(id)),due=bA.due+bB.due;
 const savedA=p.saved.filter(isA).length,savedB=p.saved.length-savedA;
 const act=activity(),acc=n?pct(right,n):null;
 const next=nextStep(rows,due,bA.due,bB.due);
 const done=window.SCENARIOS.filter(s=>p.simBest[s.id]!=null),avg=done.length?Math.round(done.reduce((t,s)=>t+p.simBest[s.id],0)/done.length):null;
 const resusN=window.PART1.resus.length,seqN=window.PART1.sequences.length;
 const resusDone=Object.keys(p.resusBest).length,seqDone=Object.keys(p.seqBest).length;
 const weak=rows.filter(r=>r.n>=3).map(r=>Object.assign({acc:pct(r.right,r.n)},r)).sort((a,b)=>a.acc-b.acc).slice(0,4);
 const name=p.name!==Course.DEFAULT_NAME?`, ${esc(p.name)}`:'';
 const mastery=pct(ok,total);
 const part=k=>rows.filter(r=>r.part===k).reduce((a,r)=>({ok:a.ok+r.ok,total:a.total+r.total}),{ok:0,total:0});
 const pa=part('a'),pb=part('b');
 const text=summaryText({mastery,ok,total,acc,n,okA:pa.ok,totalA:pa.total,okB:pb.ok,totalB:pb.total,stars:st.total,maxStars:st.max,xp:Number(p.xp)||0,streak:act.streak,week:act.week,due,simDone:done.length,simTotal:window.SCENARIOS.length,simAvg:avg,weak:weak.slice(0,3)});

 $('#dash').innerHTML=`
 <a class="dash-back" href="index.html">← חזרה לדף הבית</a>
 <section class="dash-card dash-hero" aria-labelledby="h-hero">
  <div class="ring" style="--p:${mastery}" role="img" aria-label="${mastery}% מהשאלות נענו נכון"><div><b>${mastery}%</b><small>שליטה כללית</small></div></div>
  <div class="hero-text"><h1 id="h-hero">לוח התקדמות${name}</h1><p>${ok} מתוך ${total} שאלות נענו נכון בפעם האחרונה שנשאלו. ${n?`הדיוק הכולל שלך הוא ${acc}% מתוך ${n} תשובות.`:'עוד אין תשובות. כל תרגול יופיע כאן.'}</p>
   <div class="next-step"><a class="c-btn primary" href="${next.href}">${esc(next.label)}</a><span>${esc(next.text)}</span></div></div>
 </section>

 <section class="kpis" aria-label="מדדים עיקריים">
  <div class="kpi"><b>${(Number(p.xp)||0).toLocaleString('he-IL')}</b><small>נקודות</small></div>
  <div class="kpi"><b>${st.total}/${st.max} ★</b><small>כוכבים</small></div>
  <div class="kpi ${acc!=null&&acc>=75?'good':''}"><b>${acc==null?'—':acc+'%'}</b><small>דיוק בכל התשובות</small></div>
  <div class="kpi ${due?'warn':''}"><b>${due}</b><small>שאלות לחזרה היום</small></div>
  <div class="kpi"><b>${act.streak}</b><small>ימי תרגול ברצף</small></div>
  <div class="kpi"><b>${act.week}</b><small>תשובות בשבוע האחרון</small></div>
 </section>

 <div class="dash-cols">
  <section class="dash-card" aria-labelledby="h-topics"><h2 id="h-topics">שליטה לפי נושא</h2><p class="dash-sub">הפס מראה כמה שאלות בנושא נענו נכון בפעם האחרונה. כוכבים: חצי = ★, 75% = ★★, 90% = ★★★. נושא מסומן בצהוב כשהדיוק בו מתחת ל־65%.</p>
   ${topicList(rows,'a','חלק א׳ · החייאה ויסודות','review.html')}
   ${topicList(rows,'b','חלק ב׳ · מצבי חירום רפואיים','part2-review.html')}
  </section>

  <div class="dash-side">
   <section class="dash-card" aria-labelledby="h-act"><h2 id="h-act">פעילות</h2><p class="dash-sub">תשובות לשאלות ב־${DAYS_SHOWN} הימים האחרונים.</p>
    <div class="streaks"><div><b>${act.streak}</b><small>רצף נוכחי</small></div><div><b>${act.best}</b><small>רצף שיא</small></div><div><b>${act.activeDays}</b><small>ימים פעילים מתוך ${DAYS_SHOWN}</small></div></div>
    ${chart(act)}</section>

   <section class="dash-card" aria-labelledby="h-rev"><h2 id="h-rev">חזרות</h2><p class="dash-sub">שאלה שנענתה לא נכון נכנסת לבנק, ויוצאת ממנו אחרי שלוש תשובות נכונות בשלושה ימים שונים.</p>
    <div class="list">
     <a class="lrow" href="review.html"><span>בנק הטעויות · חלק א׳<small>${bA.total} בבנק · ${savedA} שמורות</small></span><b class="${bA.due?'mid':'none'}">${bA.due} לחזרה</b></a>
     <a class="lrow" href="part2-review.html"><span>בנק הטעויות · חלק ב׳<small>${bB.total} בבנק · ${savedB} שמורות</small></span><b class="${bB.due?'mid':'none'}">${bB.due} לחזרה</b></a>
    </div></section>

   <section class="dash-card" aria-labelledby="h-weak"><h2 id="h-weak">נושאים לחיזוק</h2><p class="dash-sub">לפי הדיוק בתשובות, בנושאים שענית בהם לפחות שלוש פעמים.</p>
    <div class="c-actions weak-actions"><a class="c-btn primary" href="review.html?mode=weak">תרגול חולשות · חלק א׳</a><a class="c-btn primary" href="part2-review.html?mode=weak">תרגול חולשות · חלק ב׳</a></div>
    ${weak.length?`<div class="weak-list">${weak.map(r=>`<a class="lrow" href="${r.href}"><span>${r.icon} ${esc(r.name)}<small>${r.right} נכונות מתוך ${r.n} תשובות</small></span><b class="${tone(r.acc)}">${r.acc}%</b></a>`).join('')}</div>`:'<p class="empty-note">עוד אין מספיק תשובות. אחרי כמה סבבי תרגול יופיעו כאן הנושאים שכדאי לחזק.</p>'}</section>

   <section class="dash-card" aria-labelledby="h-scores"><h2 id="h-scores">ציונים ומשחקים</h2><p class="dash-sub">הציון הטוב ביותר בכל תרגול.</p>
    <div class="list">
     <a class="lrow" href="review.html"><span>מבחן לדוגמה · חלק א׳</span>${score(p.examBest.a)}</a>
     <a class="lrow" href="part2-review.html"><span>מבחן לדוגמה · חלק ב׳</span>${score(p.examBest.b)}</a>
     <a class="lrow" href="index.html#simulator"><span>סימולטור אנמנזה<small>${done.length}/${window.SCENARIOS.length} תרחישים${avg!=null?` · ממוצע שיאים ${avg}`:''}</small></span>${score(avg)}</a>
     <a class="lrow" href="review.html"><span>תרחישי החייאה<small>${resusDone}/${resusN} תרחישים</small></span><b class="${resusDone?'good':'none'}">${pct(resusDone,resusN)}%</b></a>
     <a class="lrow" href="review.html"><span>סדר את הטיפול<small>${seqDone}/${seqN} תרגילים</small></span><b class="${seqDone?'good':'none'}">${pct(seqDone,seqN)}%</b></a>
     <a class="lrow" href="review.html"><span>משחק הזיכרון<small>ניצחונות</small></span><b class="${p.memoryWins?'good':'none'}">${p.memoryWins||0}</b></a>
    </div></section>
  </div>
 </div>
 <section class="dash-card share-card" aria-labelledby="h-share"><div><h2 id="h-share">שליחה למדריך</h2><p class="dash-sub">נפתחת הודעת וואטסאפ מוכנה עם סיכום ההתקדמות, והשליחה נעשית רק אחרי שתאשרו אותה באפליקציה.</p></div><div class="c-actions"><button class="c-btn primary" type="button" data-share>📱 לשלוח את הלוח ליחיאל בוואטסאפ</button><button class="c-btn" type="button" data-share-other>למספר אחר</button></div></section>
 <p class="dash-sub">הנתונים נשמרים בדפדפן הזה בלבד. איפוס אפשר לעשות דרך ההגדרות (⚙).</p>`;
 $('[data-share]').onclick=()=>send(INSTRUCTOR_PHONE,text);
 $('[data-share-other]').onclick=()=>sendOther(text);
 Course.refreshHeader();
}

Course.mountHeader({subtitle:'לוח התקדמות'});
Course.onChange(render);
render();
})();
