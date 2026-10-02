// מדריך הערכת מטופל: ABCDE, אנמנזה (SAMPLE ו־OPQRST) ובונה דיווח. אין שמירה ואין שליחת נתונים.
(function(){
const {esc}=Course;
const $=s=>document.querySelector(s);

// ---- ABCDE ----
const STEPS=[
 {k:'0',l:'0',t:'בטיחות ורושם ראשוני',color:'mid',
  check:['בטיחות הזירה: סכנות, מספר מטופלים, ציוד מגן וכפפות.','רושם ראשוני: האם המטופל נראה במצב חמור, ועדים או רמזים בזירה.','מטופל שלא מגיב, בלי נשימה תקינה: מתחילים החייאה לפי חלק א׳.'],
  measure:['הכרה לפי AVPU: A ערני, V מגיב לקול, P מגיב לכאב, U לא מגיב.'],
  warn:['ריח חזק של גז או סכנה בזירה: לא נכנסים, מדווחים ומבקשים כיבוי.'],
  note:'מטפל שנפגע לא עוזר לאף אחד.'},
 {k:'A',l:'A',t:'נתיב אוויר',color:'ok',
  check:['מדבר במשפטים מלאים? אם כן, נתיב האוויר כנראה פתוח.','קולות חריגים (גרגור, שריקה), הפרשות, גוף זר, נפיחות בפנים או בצוואר.'],
  measure:[],
  warn:['מטופל שלא יכול לדבר, משתעל בלי קול או נחנק.'],
  note:'נתיב לא פתוח מטפלים בו מיד, לפי ההכשרה, לפני שממשיכים הלאה.'},
 {k:'B',l:'B',t:'נשימה',color:'ok',
  check:['קצב (12–20 במבוגר), עומק ומאמץ.','קולות נשימה, צבע עור ושפתיים, שימוש בשרירי עזר.','דיבור: משפטים מלאים או מילים בודדות.'],
  measure:['קצב נשימה','סטורציה (94% ומעלה תקין)'],
  warn:['נשימה שטחית או איטית (8 שטחיות לא מספיקות), מעל 25 בדקה, כחלון, סטורציה נמוכה.'],
  note:'אצל חולי COPD הסטורציה הרגילה לפעמים נמוכה, ולכן שואלים מה הבסיס.'},
 {k:'C',l:'C',t:'מחזור דם',color:'ok',
  check:['דופק: קצב, סדירות ומלאות (60–100 במבוגר במנוחה).','עור: צבע, טמפרטורה ולחות. מילוי קפילרי עד 2 שניות.','דימום חיצוני משמעותי.'],
  measure:['דופק','לחץ דם (סיסטולי מתחת ל־90 נמוך)'],
  warn:['דופק מהיר, עור קר ולח ולחץ נמוך: סימני זילוח ירוד והלם.','דימום שאינו נעצר.'],
  note:'דימום גדול עוצרים מיד, גם לפני השלמת ההערכה.'},
 {k:'D',l:'D',t:'הכרה ותפקוד נוירולוגי',color:'ok',
  check:['הכרה לפי AVPU, ובלבול או שינוי מהמצב הרגיל.','אישונים: גודל ותגובה לאור.','תנועה וכוח בגפיים, ושבץ לפי FAST: פנים, יד, דיבור, זמן.'],
  measure:['סוכר'],
  warn:['ירידה בהכרה, אישונים לא שווים, חולשה בצד אחד, פרכוס.'],
  note:'בכל שינוי בהכרה בודקים סוכר, כי סוכר נמוך מחקה שבץ, שכרות ופרכוס.'},
 {k:'E',l:'E',t:'חשיפה',color:'ok',
  check:['חשיפה ממוקדת לפי התלונה: פריחה, פצעים, סימני מחט, חבלות.','שומרים על פרטיות ועל חום, ומכסים שוב.'],
  measure:['טמפרטורה, אם רלוונטי'],
  warn:['פצע שלא נראה קודם, סימני מחט או פריחה מתפשטת.'],
  note:'חושפים רק מה שצריך ומכסים מיד אחר כך.'},
 {k:'→',l:'↻',t:'אחרי ההערכה',color:'mid',
  check:['חוזרים על המדדים כל 5–10 דקות, ואחרי כל שינוי או טיפול. המגמה חשובה כמו הערך.','בבעיה משמעותית ב־ABCD או כשיש ספק: מזמינים ALS.','רק אחרי שאין איום על החיים אוספים אנמנזה מלאה.'],
  measure:['רושמים את השעה של כל מדידה.'],
  warn:['מדדים שהחמירו בין שתי מדידות: מגבירים ניטור, מעריכים שוב ומדווחים.'],
  note:'קודם שומרים על החיים. השאלות מחכות.'}
];

// ---- אנמנזה ----
const SAMPLE=[
 ['S','תסמינים','מה מפריע לך עכשיו? מה הרגשת קודם?'],
 ['A','רגישויות','יש לך רגישות לתרופות או למזון?'],
 ['M','תרופות','אילו תרופות אתה לוקח? כולל אינסולין ומדללי דם. מתי לקחת אחרונה?'],
 ['P','רקע רפואי','אילו מחלות יש לך? ניתוחים או אשפוזים בעבר?'],
 ['L','ארוחה אחרונה','מתי אכלת ושתית לאחרונה?'],
 ['E','אירועים שקדמו','מה קרה לפני שזה התחיל? מה עשית באותו רגע?']
];
const OPQRST=[
 ['O','התחלה','מתי זה התחיל? פתאום או בהדרגה?'],
 ['P','מה משפיע','מה מחמיר? מה מקל? האם מנוחה או תנועה משנים?'],
 ['Q','אופי','איך זה מרגיש? לוחץ, דוקר, שורף?'],
 ['R','הקרנה','לאן זה הולך? יד, לסת, גב?'],
 ['S','עוצמה','מ־0 עד 10, כמה חזק?'],
 ['T','זמן','כמה זמן זה נמשך? זה היה כבר בעבר?']
];
const TIPS=[
 'מתחילים בשאלה פתוחה, כמו ״מה מפריע לך עכשיו?״. שאלה פתוחה נותנת למטופל לספר.',
 'לא שואלים שאלה מובילה כמו ״הכאב לא מקרין, נכון?״. עדיף ״לאן הכאב הולך?״.',
 'מטופל חרד: מדברים בשקט ובגובה העיניים, ומסבירים מה עושים.',
 'מטופל שלא מגיב: אוספים מידע מעדים, מבני משפחה ומרמזים בזירה, כמו צמידים, תרופות ומסמכים.',
 'שואלים מה המצב הרגיל, ומשווים. שינוי מהרגיל הוא הממצא החשוב.',
 'התרופות שנמצאו בבית: לוקחים או רושמים ומוסרים לצוות.'
];

// ---- דיווח ----
const FIELDS=[
 ['age','גיל','number','לדוגמה: 68'],
 ['sex','מין','select',['','גבר','אישה']],
 ['complaint','תלונה עיקרית או חשד','text','לדוגמה: חולשה ביד ימין ודיבור משובש'],
 ['onset','מתי התחיל','text','לדוגמה: 06:40, התעורר כך. תקין לאחרונה אתמול ב־23:00'],
 ['history','רקע, תרופות ורגישויות','text','לדוגמה: יתר לחץ דם, מדלל דם. רגישות לפניצילין'],
 ['avpu','הכרה','select',['','A ערני','V מגיב לקול','P מגיב לכאב','U לא מגיב']],
 ['pulse','דופק','number','בדקה'],
 ['resp','נשימה','number','בדקה'],
 ['spo2','סטורציה %','number','%'],
 ['bp','לחץ דם','text','לדוגמה: 178/96'],
 ['glu','סוכר','number','mg/dL'],
 ['time','שעת המדידה','text','לדוגמה: 07:05'],
 ['done','מה נעשה','text','לדוגמה: חמצן, ג׳ל גלוקוז, הושב בישיבה'],
 ['trend','מצב עכשיו','select',['','משתפר','יציב','מחמיר']]
];
const REQUIRED=[['age','גיל'],['complaint','תלונה או חשד'],['onset','מתי התחיל'],['time','שעת המדידה'],['done','מה נעשה'],['trend','מצב עכשיו']];
const EXAMPLE='בת 24, סוכרת סוג 1 עם משאבה. דילגה על צהריים והלכה שעה. נמצאה מבולבלת, קרה ולחה, סוכר 48. בולעת, קיבלה גלוקוז בפה. עכשיו ערנית, סוכר 82, דופק 92.';

function buildReport(v){
 const who=[v.age?`${v.sex==='אישה'?'בת':v.sex==='גבר'?'בן':'גיל'} ${v.age}`:'',v.complaint].filter(Boolean).join(', ');
 const vit=[v.avpu?`הכרה ${v.avpu.split(' ')[0]}`:'',v.pulse?`דופק ${v.pulse}`:'',v.resp?`נשימה ${v.resp}`:'',v.spo2?`סטורציה ${v.spo2}%`:'',v.bp?`ל״ד ${v.bp}`:'',v.glu?`סוכר ${v.glu}`:''].filter(Boolean).join(', ');
 const parts=[];
 if(who)parts.push(who+'.');
 if(v.onset)parts.push(`התחיל: ${v.onset}.`);
 if(v.history)parts.push(`רקע: ${v.history}.`);
 if(vit)parts.push(`מדדים${v.time?` (${v.time})`:''}: ${vit}.`);
 if(v.done)parts.push(`טופל: ${v.done}.`);
 if(v.trend)parts.push(`מצב עכשיו: ${v.trend}.`);
 return parts.join('\n');
}
function fieldHtml([id,label,type,extra]){
 const input=type==='select'?`<select id="f-${id}">${extra.map(o=>`<option value="${esc(o)}">${esc(o||'בחרו')}</option>`).join('')}</select>`:`<input id="f-${id}" type="${type==='number'?'number':'text'}" ${type==='number'?'inputmode="decimal" min="0"':'maxlength="120"'} placeholder="${esc(extra)}">`;
 return `<label class="c-field"><span>${esc(label)}</span>${input}</label>`;
}
function values(){const v={};FIELDS.forEach(([id])=>{v[id]=($('#f-'+id).value||'').trim()});return v}
function updateReport(){
 const v=values(),text=buildReport(v);
 $('#report-out').textContent=text||'ממלאים את השדות ורואים כאן דיווח מוכן.';
 $('#report-out').classList.toggle('empty',!text);
 const missing=REQUIRED.filter(([id])=>!v[id]);
 $('#report-missing').innerHTML=text?(missing.length?`<b>חסר:</b> ${missing.map(([,l])=>`<span class="chip mid">${esc(l)}</span>`).join(' ')}`:'<span class="chip ok">כל הפרטים העיקריים קיימים</span>'):'';
 $('#copy').disabled=!text;
}
async function copyReport(){
 const text=buildReport(values());if(!text)return;
 try{await navigator.clipboard.writeText(text);Course.toast('הדיווח הועתק')}
 catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');Course.toast('הדיווח הועתק')}catch(err){Course.toast('לא הצלחנו להעתיק',true)}ta.remove()}
}

// ---- בניית הדף ----
const TABS=[['abcde','ABCDE'],['history','אנמנזה'],['report','דיווח']];
let tab='abcde';
function stepHtml(s){
 const list=(a)=>a.length?`<ul class="v-list">${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';
 return `<article class="v-card step"><div class="step-l ${s.color}" aria-hidden="true">${esc(s.l)}</div><div class="step-body"><h3>${esc(s.t)}</h3>
  <div class="step-sec"><b>מה בודקים</b>${list(s.check)}</div>
  ${s.measure.length?`<div class="step-sec"><b>מדידות</b>${list(s.measure)}</div>`:''}
  <div class="step-sec warn"><b>סימני אזהרה</b>${list(s.warn)}</div>
  <p class="v-note">${esc(s.note)}</p></div></article>`;
}
function tabHtml(){
 if(tab==='abcde')return `<p class="lead-p">סדר קבוע שחוזרים עליו אחרי כל שינוי. ההערכה תמיד קודמת לאנמנזה המלאה, אם יש איום על החיים.</p><div class="steps-col">${STEPS.map(stepHtml).join('')}</div>`;
 if(tab==='history')return `<div class="m-cols"><section class="v-card"><h3>SAMPLE: אנמנזה כללית</h3><div class="q-list">${SAMPLE.map(([l,n,q])=>`<div class="q"><span class="q-l">${l}</span><div><b>${esc(n)}</b><small>${esc(q)}</small></div></div>`).join('')}</div></section>
  <section class="v-card"><h3>OPQRST: אפיון כאב או תלונה</h3><div class="q-list">${OPQRST.map(([l,n,q])=>`<div class="q"><span class="q-l">${l}</span><div><b>${esc(n)}</b><small>${esc(q)}</small></div></div>`).join('')}</div></section></div>
  <section class="v-card"><h3>איך שואלים</h3><ul class="v-list">${TIPS.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;
 return `<p class="lead-p">דיווח קצר וסדור לצוות המקבל: מי, מה, מתי, רקע, ממצאים, מה נעשה ומה המצב עכשיו. המגמה והשעות חשובות לא פחות מהמספרים.</p>
  <div class="m-cols"><section class="v-card"><h3>בניית דיווח</h3><div class="tool-grid report-grid">${FIELDS.map(fieldHtml).join('')}</div><div class="c-actions"><button class="c-btn" type="button" id="clear-report">ניקוי</button></div></section>
  <div class="m-side"><section class="v-card"><h3>הדיווח שלך</h3><pre id="report-out" class="report-out empty" aria-live="polite"></pre><div id="report-missing" class="report-missing"></div><div class="c-actions"><button class="c-btn primary" type="button" id="copy" disabled>העתקת הדיווח</button></div></section>
  <section class="v-card"><h3>דוגמה</h3><p class="example">${esc(EXAMPLE)}</p><p class="v-note">שימו לב: גיל ורקע, מה קרה, ממצא חשוב עם מספר, מה טופל, ומצב עכשיו.</p></section></div></div>
  <p class="v-note">אל תכתבו שם, תעודת זהות או פרטים מזהים של מטופל אמיתי. הכלי לתרגול בלבד, ולא נשמר ולא נשלח לשום מקום.</p>`;
}
function render(){
 $('#assess').innerHTML=`<a class="v-back" href="part2-review.html">← חזרה לחלק ב׳</a>
 <section class="v-hero"><span class="kicker">חלק ב׳</span><h1>הערכת מטופל</h1><p>ABCDE, שאלות לאנמנזה ותבנית לדיווח.</p>
  <div class="v-cta"><a class="c-btn primary" href="part2-review.html?topic=0">לתרגל שאלות על אנמנזה</a><a class="c-btn" href="index.html#simulator">לסימולטור האנמנזה</a><a class="c-btn" href="vitals.html">מדריך מדידות</a></div></section>
 <nav class="v-tabs" role="tablist" aria-label="נושאים">${TABS.map(([id,n])=>`<button class="v-tab${id===tab?' on':''}" type="button" role="tab" aria-selected="${id===tab}" data-t="${id}">${n}</button>`).join('')}</nav>
 <div id="tab-panel" role="tabpanel">${tabHtml()}</div>`;
 document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;history.replaceState(null,'','#'+tab);render()});
 if(tab==='report'){
  document.querySelectorAll('#tab-panel input,#tab-panel select').forEach(el=>{el.oninput=updateReport;el.onchange=updateReport});
  $('#copy').onclick=copyReport;
  $('#clear-report').onclick=()=>{FIELDS.forEach(([id])=>{$('#f-'+id).value=''});updateReport()};
  updateReport();
 }
}
Course.mountHeader({subtitle:'הערכת מטופל'});
const h=location.hash.slice(1);if(TABS.some(([id])=>id===h))tab=h;
render();
})();
