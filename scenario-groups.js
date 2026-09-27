(function(){
const levelOf=difficulty=>difficulty==='מתחיל'||difficulty==='קל'?'קל':difficulty==='מתקדם'||difficulty==='קשה'?'קשה':'בינוני';
const levelCopy={
 'קל':'מקרים עם תבנית יחסית ברורה לתרגול סדר עבודה בסיסי.',
 'בינוני':'נדרש לשלב ממצאים, תשאול עדים ושאלות המשך.',
 'קשה':'האבחנה אינה גלויה בתחילת האירוע והמידע המכריע נחשף בהדרגה.'
};
renderPart2=function(){
 app.dataset.part='b';
 engine=null;
 const indexed=SCENARIOS.map(scenario=>({scenario}));
 let displayIndex=0;
 const groups=['קל','בינוני','קשה'].map(level=>{
  const cards=indexed.filter(item=>levelOf(item.scenario.difficulty)===level).map(({scenario:s})=>'<button class="scenario-card" data-scenario="'+s.id+'"><span class="case-no">'+String(++displayIndex).padStart(2,'0')+'</span><div class="difficulty '+level+'">'+level+'</div><h3>'+esc(s.scene.dispatchReason)+'</h3><p>'+esc(s.scene.location)+'</p><div class="card-foot"><span>'+esc(s.category)+'</span><span>'+esc(s.duration)+'</span></div></button>').join('');
  return '<section class="difficulty-group" aria-labelledby="level-'+level+'"><div class="difficulty-heading"><div><span>'+level+'</span><h3 id="level-'+level+'">דרגת קושי: '+level+'</h3></div><p>'+levelCopy[level]+'</p></div><div class="scenario-grid">'+cards+'</div></section>';
 }).join('');
 app.innerHTML='<header class="top"><div class="brand"><span class="brand-mark">✚</span><div><strong>קורס חובשים 497</strong><small>חלק ב׳</small></div></div></header><section class="part-b-hub"><div class="section-head"><div><span>01</span><h2>בחרו משחק</h2></div><button class="back" id="course-home">← חזרה לבחירת חלק</button></div><div class="part-b-game-grid"><a class="part-b-game topic-game" href="part2-review.html"><span>🎓</span><div><small>70 שאלות ומצבים מהשטח</small><h3>תרגול לפי נושא</h3><p>תרגול נפרד לכל אחד משבעת נושאי חלק ב׳, עם ניקוד ומשוב מיידי.</p><b>לבחירת נושא ←</b></div></a><a class="part-b-game mixed-game" href="part2-review.html?mode=mixed"><span>⚡</span><div><small>כל נושאי חלק ב׳</small><h3>אתגר משולב</h3><p>14 שאלות אקראיות שבודקות את כל נושאי מצבי החירום הרפואיים.</p><b>התחלת האתגר ←</b></div></a><button class="part-b-game simulator-game" id="jump-simulator"><span>🚨</span><div><small>10 תרחישים בשלוש דרגות קושי</small><h3>סימולטור אנמנזה</h3><p>נהלו את הזירה, בחרו פעולות ושאלות וקבלו תחקיר מסכם.</p><b>לבחירת תרחיש ↓</b></div></button></div></section><section class="cases-section part-b-picker" id="anamnesis-simulator"><div class="section-head"><div><span>02</span><h2>תרחישי סימולטור אנמנזה</h2></div><p>בחרו זירה, טפלו במטופל וקבלו תחקיר מסכם</p></div>'+groups+'</section><footer class="course-footer"><span>הוכן על ידי אלעזר מושקוביץ עבור קורס חובשים אשדוד 497</span><span>לתרגול בלבד • יש לפעול רק לפי הנחיות המדריך שלנו ר&#39; יחיאל מייברג.</span></footer>';
 document.getElementById('course-home').onclick=function(){history.replaceState(null,'',location.pathname);renderHome()};
 document.getElementById('jump-simulator').onclick=function(){document.getElementById('anamnesis-simulator').scrollIntoView({behavior:'smooth'})};
 document.querySelectorAll('[data-scenario]').forEach(function(button){button.onclick=function(){start(button.dataset.scenario)}});
 injectCourseHeader();
 window.scrollTo({top:0,left:0,behavior:'auto'});
};
if(location.hash==='#part-b')renderPart2();
})();
