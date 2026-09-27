// תרחישים נוספים: כאב בחזה, התקף אסתמה קשה והרעלת אופיואידים.
(function(){
const score=(category,points)=>({category,points});
const action=(id,label,group,importance,points,reveals=[],extra={})=>({id,label,group,importance,score:points,reveals,...extra});
const question=(id,text,category,answer,importance,points,reveals=[],extra={})=>({id,text,category,answer,importance,score:score('anamnesis',points),reveals,...extra});
// הניקוד המקסימלי מחושב מסכום הנקודות החיוביות בכל קטגוריה.
function autoMax(s){const max={safety:0,primary:0,emergency:0,priorities:0,anamnesis:0,followup:0,reassessment:0};[...s.actions,...s.primaryAssessment,...s.anamnesis].forEach(x=>{if(x.score&&x.score.points>0)max[x.score.category]=(max[x.score.category]||0)+x.score.points});s.scoring={max};return s}

const LIST=[
{
 id:'acs-11',category:'כאב בחזה',difficulty:'בינוני',duration:'10–12 דקות',
 learningObjectives:['אפיון כאב בחזה לפי OPQRST','זיהוי תמונה של תסמונת כלילית חריפה','שלילת התוויות נגד לפני אספירין','מניעת מאמץ, AED מוכן ופינוי דחוף'],
 scene:{dispatchReason:'לחץ בחזה',location:'דירה בקומה 4, בלי מעלית',shortDescription:'הבן פתח את הדלת. המטופל יושב על הספה.',patientCount:1,preArrivalInfo:'גבר בן 58, בהכרה. לחץ בחזה מלפני חצי שעה.',immediateView:'יושב על הספה, חיוור ומזיע, יד אחת על החזה.'},
 patient:{age:58,chiefComplaint:'לחץ באמצע החזה',consciousness:'ערני, AVPU=A',behavior:'חרד, מדבר במשפטים מלאים',appearance:'חיוור, מזיע',findings:['זיעה קרה'],vitals:{respiratoryRate:'22',pulse:'96, סדיר',bloodPressure:'158/94',spo2:'95%',glucose:'142 mg/dL'},history:{conditions:['יתר לחץ דם','סוכרת סוג 2','מעשן'],medications:['כדור ללחץ דם','מטפורמין'],allergies:'אין ידועות',lastMeal:'לפני שעתיים',events:'סחב שקיות במדרגות; הכאב לא עבר במנוחה'}},
 facts:{'gloves-on':'כפפות נלבשו','scene-safe':'הזירה בטוחה; מטופל אחד','airway-open':'מדבר במשפטים מלאים; נתיב אוויר פתוח','breathing':'22 נשימות בדקה, סטורציה 95%','circulation':'דופק 96 סדיר, ל״ד 158/94, עור חיוור ומזיע','neuro':'ערני ומתמצא, ללא חסר','glucose':'סוכר 142 mg/dL','pain-character':'לחץ כבד באמצע החזה','onset-exertion':'התחיל לפני חצי שעה במאמץ ולא עבר במנוחה','radiation':'מקרין ליד שמאל וללסת','severity':'עוצמה 8 מתוך 10','associated':'בחילה וזיעה','risk-factors':'יתר לחץ דם, סוכרת ועישון','no-aspirin-allergy':'אין רגישות לאספירין','no-bleeding-risk':'אין דימום, כיב, ניתוח או חבלה לאחרונה','acs-suspected':'התמונה חשודה לתסמונת כלילית חריפה','als-called':'ALS הוזעק עם דיווח על חשד ל־ACS','aspirin-given':'ניתן אספירין 300 מ״ג ללעיסה','rested':'המטופל יושב בנוחות ולא מתאמץ','aed-ready':'AED מוכן ליד המטופל','reassessed':'מדדים חוזרים: דופק 92, ל״ד 150/90, הכאב 7 מתוך 10','transport':'פינוי דחוף בכיסא מדרגות עם ניטור'},
 primaryAssessment:[
  action('airway','הערכת נתיב אוויר','primary','חובה',score('primary',6),['airway-open'],{criticalOmission:true,result:'מדבר במשפטים מלאים. נתיב האוויר פתוח.'}),
  action('breathing','הערכת נשימה וסטורציה','primary','חובה',score('primary',6),['breathing'],{result:'22 נשימות בדקה, סטורציה 95%.'}),
  action('circulation','דופק, עור ולחץ דם','primary','חובה',score('primary',7),['circulation'],{criticalOmission:true,result:'דופק 96 סדיר, ל״ד 158/94. העור חיוור ומזיע.'}),
  action('neuro','הערכת הכרה','primary','חובה',score('primary',4),['neuro'],{result:'ערני ומתמצא.'}),
  action('glucose','בדיקת סוכר','primary','מומלצת',score('primary',3),['glucose'],{result:'142 mg/dL.'}),
  action('recognize-acs','זיהוי חשד ל־ACS','primary','חובה',score('emergency',12),['acs-suspected'],{requires:['pain-character','circulation'],criticalOmission:true,result:'לחץ בחזה, זיעה ובחילה במאמץ אצל אדם עם גורמי סיכון. מטפלים כ־ACS.'})],
 anamnesis:[
  question('chief','מה אתה מרגיש עכשיו?','תלונה עיקרית','״לחץ כבד באמצע החזה. כמו שמישהו יושב עליי.״','חשובה',5,['pain-character'],{unlocks:['radiation','severity']}),
  question('onset','מתי זה התחיל ומה עשית באותו רגע?','מחלה נוכחית','״לפני חצי שעה, סחבתי שקיות במדרגות. ישבתי וזה לא עבר.״','חשובה',5,['onset-exertion']),
  question('radiation','הכאב עובר לעוד מקום?','שאלת המשך','״ליד שמאל, וקצת ללסת.״','חשובה',4,['radiation'],{condition:{question:'chief'},score:score('followup',4)}),
  question('severity','כמה חזק הכאב, מ־1 עד 10?','שאלת המשך','״שמונה.״','משלימה',3,['severity'],{condition:{question:'chief'},score:score('followup',3)}),
  question('associated','יש קוצר נשימה, בחילה או זיעה?','תסמינים נלווים','״בחילה, ואני כולי רטוב.״','חשובה',4,['associated']),
  question('history','יש לך מחלות רקע?','רקע רפואי','״לחץ דם וסוכרת. ואני מעשן.״','חשובה',4,['risk-factors']),
  question('meds','אילו תרופות אתה לוקח?','SAMPLE','״כדור ללחץ דם ומטפורמין.״','משלימה',3,['meds']),
  question('allergy','יש לך רגישות לתרופות? לאספירין?','SAMPLE','״לא, לקחתי אספירין פעם וזה היה בסדר.״','חשובה',5,['no-aspirin-allergy']),
  question('bleeding','היה לך לאחרונה דימום, כיב בקיבה, ניתוח או חבלה?','התוויות נגד','״לא, כלום.״','חשובה',5,['no-bleeding-risk']),
  question('team','לאיזו קבוצה אתה אוהד?','לא רלוונטי','״מה זה משנה עכשיו?״','לא רלוונטית',-2,[],{feedback:'השאלה לא מקדמת את ההערכה. בכאב בחזה הזמן חשוב.'})],
 actions:[
  action('ppe','לבישת כפפות','safety','חובה',score('safety',6),['gloves-on'],{result:'הצוות ממוגן.'}),
  action('scan-scene','סריקת הזירה','safety','חובה',score('safety',6),['scene-safe'],{result:'מטופל אחד, אין סכנה. קומה רביעית בלי מעלית.'}),
  action('rest','הושבה נוחה ומניעת כל מאמץ','treatment','חובה',score('priorities',6),['rested'],{result:'המטופל יושב בנוחות. מבקשים ממנו לא לקום.'}),
  action('call-als','הזעקת ALS','resources','חובה',score('priorities',10),['als-called'],{requires:['acs-suspected'],criticalOmission:true,result:'המוקד מעודכן. ALS בדרך.'}),
  action('aspirin','מתן אספירין 300 מ״ג ללעיסה','treatment','חובה',score('emergency',12),['aspirin-given'],{requires:['acs-suspected','no-aspirin-allergy','no-bleeding-risk'],criticalOmission:true,result:'המטופל לועס 300 מ״ג אספירין.'}),
  action('aspirin-unchecked','לתת אספירין מיד, בלי לשאול על רגישות ודימום','treatment','מיותרת',score('emergency',-12),[],{critical:true,result:'לפני אספירין שוללים רגישות, דימום פעיל, כיב, ניתוח וחבלה.'}),
  action('aed-ready','הכנת AED ליד המטופל','resources','מומלצת',score('priorities',5),['aed-ready'],{result:'ה־AED פתוח ומוכן. באוטם הסכנה המיידית היא פרפור חדרים.'}),
  action('walk-down','לבקש ממנו לרדת ברגל לאמבולנס','transport','מיותרת',score('priorities',-12),[],{critical:true,result:'מאמץ מגביר את הצריכה של שריר הלב בחמצן. מפנים בכיסא או באלונקה.'}),
  action('reassess','מדדים חוזרים והערכת כאב','reassessment','חובה',score('reassessment',10),['reassessed'],{requires:['circulation'],result:'דופק 92, ל״ד 150/90. הכאב 7 מתוך 10.',vitals:{pulse:'92, סדיר',bloodPressure:'150/90'}}),
  action('urgent-transport','פינוי דחוף בכיסא מדרגות, עם ניטור','transport','חובה',score('priorities',10),['transport'],{requires:['acs-suspected'],criticalOmission:true,result:'המטופל בכיסא, הציוד וה־AED איתו. יוצאים.'})],
 events:[{id:'acs-worse',trigger:{interactionsAtLeast:9,missingFacts:['als-called']},change:{vitals:{pulse:'114, לא סדיר',bloodPressure:'132/84'}},feedback:'הכאב מתחזק והדופק נעשה לא סדיר. צריך ALS עכשיו ו־AED קרוב.'}],
 expectedPath:{principles:[['ppe','scan-scene'],['airway','breathing','circulation'],['chief','onset','radiation','associated'],['recognize-acs','call-als','rest'],['allergy','bleeding','aspirin'],['aed-ready','reassess','urgent-transport']],requiredFacts:['scene-safe','circulation','pain-character','acs-suspected','als-called','no-aspirin-allergy','no-bleeding-risk','aspirin-given','transport']},
 feedback:{explanations:{acs:'חובש לא מאבחן אוטם. לחץ בחזה עם זיעה, בחילה והקרנה מטופל כ־ACS עד שיוכח אחרת.',aspirin:'אספירין 300 מ״ג ללעיסה ניתן רק אחרי ששללת רגישות, דימום פעיל, כיב, ניתוח וחבלה.',effort:'כל מאמץ מגדיל את הצורך של הלב בחמצן. המטופל לא הולך, גם לא ״רק עד האמבולנס״.',aed:'הסכנה המיידית באוטם היא פרפור חדרים. AED מוכן חוסך שניות יקרות.'}},
 reasoning:{
  impression:{opts:['תסמונת כלילית חריפה (ACS)','צרבת','כאב שרירי מהמאמץ','התקף חרדה'],why:'לחץ באמצע החזה שמקרין ליד וללסת, במאמץ ולא עובר במנוחה, עם זיעה ובחילה, אצל מעשן עם סוכרת ויתר לחץ דם.'},
  urgency:{opts:['פינוי דחוף בכיסא או באלונקה, עם ALS, ניטור ו־AED','ירידה ברגל לאמבולנס כדי לחסוך זמן','מחכים לראות אם הכאב עובר אחרי האספירין','הבן יסיע אותו לבית החולים'],why:'בלי מאמץ, עם ניטור ועם AED קרוב. הזמן עד הטיפול בבית החולים קובע כמה שריר לב יינצל.'},
  handoff:{opts:['בן 58, יתר לחץ דם, סוכרת, מעשן. לפני חצי שעה במאמץ: לחץ באמצע החזה שמקרין ליד שמאל וללסת, 8 מתוך 10, עם בחילה וזיעה. קיבל אספירין 300 ללעיסה אחרי שלילת התוויות נגד. דופק 92, ל״ד 150/90, סטורציה 95%','בן 58 עם כאב בחזה. קיבל אספירין','בן 58, כאב בחזה כבר יומיים, נראה שרירי','בן 58, לחץ בחזה. לא בדקנו רגישות לפני האספירין'],why:'בכאב בחזה מוסרים מתי התחיל ובאיזה מצב, איך הכאב מרגיש ולאן מקרין, מה ניתן ומתי, ואת המדדים.'}
 }
},
{
 id:'asthma-12',category:'התקף אסתמה',difficulty:'בינוני',duration:'8–10 דקות',
 learningObjectives:['זיהוי התקף אסתמה קשה','תנוחה, חמצן והזעקת ALS','זיהוי סימני תשישות וכשל נשימתי','שאלות על התקפים קודמים ושימוש במשאף'],
 scene:{dispatchReason:'קוצר נשימה במגרש ספורט',location:'מגרש כדורגל בבית ספר',shortDescription:'המורה לספורט מחכה ליד השער.',patientCount:1,preArrivalInfo:'נער בן 16, אסתמטי, קוצר נשימה קשה.',immediateView:'יושב על הספסל נשען קדימה על הברכיים, נושם מהר, מדבר רק מילים בודדות.'},
 patient:{age:16,chiefComplaint:'קוצר נשימה קשה',consciousness:'ערני וחרד, AVPU=A',behavior:'מדבר במילים בודדות',appearance:'נשען קדימה, משתמש בשרירי עזר',findings:['צפצופים','נשיפה ארוכה'],vitals:{respiratoryRate:'32, מאומץ',pulse:'124',bloodPressure:'128/80',spo2:'90%'},history:{conditions:['אסתמה'],medications:['משאף להרחבת סימפונות'],allergies:'אבק',lastMeal:'לפני 3 שעות',events:'ריצה במגרש מאובק; השתמש במשאף פעמיים בלי הקלה'}},
 facts:{'gloves-on':'כפפות נלבשו','scene-safe':'הזירה בטוחה','airway-open':'נתיב אוויר פתוח; מדבר במילים בודדות','distress':'32 נשימות מאומצות, שרירי עזר, צפצופים ונשיפה ארוכה, סטורציה 90%','circulation':'דופק 124, ל״ד 128/80','neuro':'ערני וחרד','severe-asthma':'התקף אסתמה קשה: מילים בודדות, סטורציה 90%, לא הגיב למשאף','inhaler-failed':'השתמש במשאף פעמיים בלי הקלה','prior-intubation':'לפני שנתיים אושפז בטיפול נמרץ והונשם','trigger':'ריצה במגרש מאובק','sitting':'יושב זקוף, נשען קדימה','oxygen-given':'חמצן ניתן לפי הפרוטוקול','inhaler-assisted':'השתמש במשאף בעזרה לפי הפרוטוקול','als-called':'ALS הוזעק','reassessed':'מדדים חוזרים: 28 נשימות, סטורציה 93%, עדיין צפצופים','transport':'פינוי דחוף בישיבה, עם חמצן'},
 primaryAssessment:[
  action('airway','הערכת נתיב אוויר','primary','חובה',score('primary',6),['airway-open'],{result:'נתיב האוויר פתוח. הוא מדבר רק מילה או שתיים בכל נשימה.'}),
  action('breathing','הערכת נשימה וסטורציה','primary','חובה',score('primary',8),['distress'],{criticalOmission:true,result:'32 נשימות מאומצות, שרירי עזר, צפצופים ונשיפה ארוכה. סטורציה 90%.'}),
  action('circulation','דופק ולחץ דם','primary','חובה',score('primary',5),['circulation'],{result:'דופק 124, ל״ד 128/80.'}),
  action('neuro','הערכת הכרה','primary','חובה',score('primary',4),['neuro'],{result:'ערני וחרד.'}),
  action('recognize-severe','זיהוי התקף קשה','primary','חובה',score('emergency',12),['severe-asthma'],{requires:['distress'],criticalOmission:true,result:'מילים בודדות, סטורציה 90% ולא הגיב למשאף: התקף קשה.'})],
 anamnesis:[
  question('chief','מה קורה?','תלונה עיקרית','״לא… מצליח… לנשום.״','חשובה',3,['chief']),
  question('inhaler','השתמשת במשאף? כמה פעמים?','מחלה נוכחית','המורה: ״פעמיים, וזה לא עזר.״','חשובה',5,['inhaler-failed']),
  question('previous','היית פעם מאושפז או מונשם בגלל אסתמה?','רקע רפואי','המורה: ״לפני שנתיים הוא היה בטיפול נמרץ, הונשם.״','חשובה',6,['prior-intubation']),
  question('trigger','מה עשית כשזה התחיל?','מחלה נוכחית','המורה: ״רץ במגרש, היה הרבה אבק היום.״','משלימה',3,['trigger']),
  question('allergy','יש רגישות לתרופות או לדברים אחרים?','SAMPLE','מהנהן ומסמן ״אבק״.','משלימה',2,['allergy']),
  question('chest-pain','יש כאב בחזה?','אבחנה מבדלת','מניד בראש לשלילה.','משלימה',2,['no-chest-pain']),
  question('score','מי ניצח במשחק?','לא רלוונטי','הוא מסתכל עליך ולא עונה. אין לו אוויר לדבר.','לא רלוונטית',-2,[],{feedback:'כל מילה עולה לו באוויר. שואלים רק מה שחשוב, ורצוי שאלות כן/לא.'})],
 actions:[
  action('ppe','לבישת כפפות','safety','חובה',score('safety',5),['gloves-on'],{result:'הצוות ממוגן.'}),
  action('scan-scene','סריקת הזירה','safety','חובה',score('safety',5),['scene-safe'],{result:'מגרש פתוח, אין סכנה.'}),
  action('position','ישיבה זקופה, נשען קדימה','treatment','חובה',score('priorities',6),['sitting'],{result:'הוא נשאר בישיבה, כמו שנוח לו לנשום.'}),
  action('oxygen','מתן חמצן לפי הפרוטוקול','treatment','חובה',score('priorities',10),['oxygen-given'],{requires:['distress'],criticalOmission:true,result:'חמצן ניתן. הסטורציה עולה לאט.',vitals:{spo2:'92%'}}),
  action('assist-inhaler','עזרה בשימוש במשאף האישי לפי הפרוטוקול','treatment','מומלצת',score('priorities',5),['inhaler-assisted'],{requires:['inhaler-failed'],result:'השתמש במשאף בעזרתך. יש הקלה קטנה.',vitals:{respiratoryRate:'28, מאומץ'}}),
  action('call-als','הזעקת ALS','resources','חובה',score('priorities',10),['als-called'],{requires:['distress'],criticalOmission:true,result:'המוקד מעודכן. ALS בדרך.'}),
  action('lay-flat','להשכיב אותו על הגב כדי שינוח','treatment','מיותרת',score('priorities',-10),[],{critical:true,result:'בשכיבה קשה לו יותר לנשום. חולה עם קוצר נשימה יושב.'}),
  action('paper-bag','לבקש שינשום לתוך שקית כדי להירגע','treatment','מיותרת',score('priorities',-10),[],{critical:true,result:'שקית מורידה את החמצן. הוא לא בהתקף חרדה, הוא בהתקף אסתמה.'}),
  action('reassess','מדדים חוזרים אחרי הטיפול','reassessment','חובה',score('reassessment',10),['reassessed'],{requires:['oxygen-given'],result:'28 נשימות, סטורציה 93%, עדיין צפצופים.',vitals:{respiratoryRate:'28, מאומץ',spo2:'93%'}}),
  action('urgent-transport','פינוי דחוף בישיבה, עם חמצן','transport','חובה',score('priorities',8),['transport'],{requires:['severe-asthma'],criticalOmission:true,result:'יוצאים. הוא יושב על האלונקה עם חמצן.'})],
 events:[{id:'tiring',trigger:{interactionsAtLeast:7,missingFacts:['oxygen-given']},change:{consciousness:'ישנוני, AVPU=V',vitals:{respiratoryRate:'12, שטחית',spo2:'85%',pulse:'132'}},feedback:'הוא נעשה שקט ומדבר פחות, והצפצופים כמעט לא נשמעים. זה לא שיפור. זה סימן לתשישות ולכשל נשימתי.'}],
 expectedPath:{principles:[['ppe','scan-scene'],['airway','breathing','recognize-severe'],['position','oxygen','call-als'],['inhaler','previous'],['assist-inhaler','reassess','urgent-transport']],requiredFacts:['distress','severe-asthma','oxygen-given','als-called','transport']},
 feedback:{explanations:{severity:'מילים בודדות, שרירי עזר וסטורציה נמוכה אחרי משאף הם סימנים להתקף קשה.',silent:'כשמטופל אסתמטי נעשה שקט והצפצופים נעלמים, בדרך כלל אין מספיק אוויר שזז. זה סימן סכנה.',history:'אשפוז בטיפול נמרץ או הנשמה בעבר מעלים את הסיכון בהתקף הנוכחי.',position:'חולה עם קוצר נשימה יושב. לא משכיבים אותו.'}},
 reasoning:{
  impression:{opts:['התקף אסתמה קשה','התקף חרדה','אנפילקסיס','גוף זר בדרכי האוויר'],why:'אסתמה ידועה, התחיל בריצה במגרש מאובק, צפצופים ונשיפה ארוכה, ולא הגיב למשאף. אין פריחה או נפיחות שיכוונו לאנפילקסיס.'},
  urgency:{opts:['פינוי דחוף בישיבה, עם חמצן ו־ALS','מחכים שהמשאף ישפיע ואז מחליטים','ההורים יאספו אותו מבית הספר','משכיבים אותו לנוח ובודקים שוב בעוד רבע שעה'],why:'התקף קשה שלא הגיב למשאף, אצל מי שכבר הונשם בעבר, יכול להידרדר מהר.'},
  handoff:{opts:['בן 16, אסתמה, הונשם בעבר. התקף בריצה במגרש מאובק, משאף פעמיים בלי הקלה. מילים בודדות, 32 נשימות, סטורציה 90%. קיבל חמצן ומשאף בעזרה. עכשיו 28 נשימות, סטורציה 93%, עדיין צפצופים','בן 16 עם קוצר נשימה. קיבל חמצן','בן 16, התקף חרדה במגרש. נושם מהר','בן 16, אסתמה. לא שאלנו על התקפים קודמים'],why:'באסתמה מוסרים את חומרת ההתקף, מה כבר נוסה, את ההיסטוריה של התקפים קשים, ואת המדדים לפני ואחרי.'}
 }
},
{
 id:'opioid-13',category:'הרעלה',difficulty:'קשה',duration:'10–12 דקות',
 learningObjectives:['בטיחות בזירה עם מחטים','זיהוי דיכוי נשימתי','פתיחת נתיב אוויר והנשמה במפוח','שלילת היפוגליקמיה ושאלות על החומר'],
 scene:{dispatchReason:'אדם לא מגיב בחדר מדרגות',location:'חדר מדרגות בבניין מגורים',shortDescription:'שכן מצא אותו והתקשר. חבר של המטופל עומד בצד.',patientCount:1,preArrivalInfo:'גבר כבן 30, לא מגיב. השכן אומר שהוא ״נושם מוזר״.',immediateView:'שוכב על הגב, נחירות איטיות, שפתיים כחלחלות. מזרק על המדרגה לידו.'},
 patient:{age:30,chiefComplaint:'לא מגיב',consciousness:'מגיב לכאב בלבד, AVPU=P',behavior:'לא מגיב לקול',appearance:'שפתיים כחלחלות, אישונים קטנים מאוד',findings:['נחירות','אישוני סיכה','סימני דקירות באמה'],vitals:{respiratoryRate:'6, שטחית',pulse:'58',bloodPressure:'104/66',spo2:'82%',glucose:'96 mg/dL'},history:{conditions:['לא ידוע'],medications:['לא ידוע'],allergies:'לא ידועות',lastMeal:'לא ידוע',events:'לפי החבר: הזריק לפני כרבע שעה חומר שקנה היום'}},
 facts:{'gloves-on':'כפפות נלבשו','scene-safe':'הזירה בטוחה אחרי טיפול במזרק','needle-seen':'מזרק משומש על המדרגה','needle-secured':'המזרק הוכנס בבטחה למיכל לפסולת חדה','airway-partial':'נחירות. נתיב האוויר חסום חלקית','airway-opened':'נתיב האוויר נפתח בהטיית ראש והרמת סנטר','slow-breathing':'6 נשימות שטחיות בדקה, סטורציה 82%','ventilated':'מונשם במפוח עם חמצן, 10–12 בדקה','circulation':'דופק 58, ל״ד 104/66','pinpoint':'AVPU=P, אישוני סיכה','glucose':'סוכר 96 mg/dL','opioid-suspected':'דיכוי נשימה, אישוני סיכה ומזרק: חשד להרעלת אופיואידים','injected':'הזריק לפני כרבע שעה חומר שקנה היום','others-used':'עוד אדם השתמש באותו חומר ונמצא בדירה','als-called':'ALS הוזעק עם דיווח על חשד לאופיואידים','aed-ready':'AED מוכן','reassessed':'בהנשמה: סטורציה 94%, דופק 72','transport':'פינוי דחוף עם הנשמה ומעקב'},
 primaryAssessment:[
  action('airway','הערכת נתיב אוויר','primary','חובה',score('primary',6),['airway-partial'],{criticalOmission:true,result:'נחירות איטיות. נתיב האוויר חסום חלקית.'}),
  action('open-airway','פתיחת נתיב אוויר: הטיית ראש והרמת סנטר','primary','חובה',score('emergency',8),['airway-opened'],{requires:['airway-partial'],criticalOmission:true,result:'הנחירות נעלמו. האוויר עובר.'}),
  action('breathing','הערכת נשימה וסטורציה','primary','חובה',score('primary',7),['slow-breathing'],{criticalOmission:true,result:'6 נשימות שטחיות בדקה. סטורציה 82%.'}),
  action('circulation','דופק ולחץ דם','primary','חובה',score('primary',5),['circulation'],{result:'דופק 58, ל״ד 104/66.'}),
  action('neuro','AVPU ואישונים','primary','חובה',score('primary',5),['pinpoint'],{result:'מגיב רק לכאב. אישונים קטנים מאוד.'}),
  action('glucose','בדיקת סוכר','primary','חובה',score('emergency',6),['glucose'],{criticalOmission:true,result:'96 mg/dL. זה לא סוכר נמוך.'}),
  action('recognize-opioid','זיהוי חשד לאופיואידים','primary','חובה',score('emergency',8),['opioid-suspected'],{requires:['slow-breathing','pinpoint'],result:'דיכוי נשימה, אישוני סיכה ומזרק: חשד להרעלת אופיואידים.'})],
 anamnesis:[
  question('what-happened','מה קרה? מתי מצאו אותו?','מחלה נוכחית','השכן: ״מצאתי אותו ככה לפני חמש דקות.״','חשובה',3,['found']),
  question('substance','הוא לקח משהו? מה ומתי?','הרעלה','החבר, בהיסוס: ״הזריק לפני רבע שעה משהו שקנה היום.״','חשובה',6,['injected'],{unlocks:['others']}),
  question('others','עוד מישהו השתמש באותו חומר?','שאלת המשך','החבר: ״כן, עוד חבר. הוא ישן בדירה.״','חשובה',6,['others-used'],{condition:{question:'substance'},score:score('followup',6)}),
  question('history','יש לו מחלות רקע?','רקע רפואי','החבר: ״לא שאני יודע.״','משלימה',2,['history']),
  question('fall','הוא נפל או נחבל?','חבלה','השכן: ״לא נראה לי, הוא היה שוכב כבר.״','משלימה',2,['no-fall']),
  question('why','למה הוא עושה את זה?','לא רלוונטי','החבר מתחיל להתווכח ומתרחק.','לא רלוונטית',-3,[],{feedback:'שאלה שיפוטית לא עוזרת לטיפול, ועלולה לגרום לחבר להפסיק לתת מידע.'})],
 actions:[
  action('ppe','לבישת כפפות','safety','חובה',score('safety',5),['gloves-on'],{result:'הצוות ממוגן.'}),
  action('scan-scene','סריקת הזירה','safety','חובה',score('safety',6),['scene-safe','needle-seen'],{result:'מזרק משומש על המדרגה. אין סכנה נוספת.'}),
  action('secure-needle','הכנסת המזרק למיכל לפסולת חדה, בזהירות','safety','מומלצת',score('safety',5),['needle-secured'],{requires:['needle-seen'],result:'המזרק במיכל. אף אחד לא יידקר.'}),
  action('pick-needle','להרים את המזרק ביד ולהעביר הצידה','safety','מיותרת',score('safety',-12),[],{critical:true,result:'סכנת דקירה וחשיפה לדם. לא מרימים מחט ביד.'}),
  action('ventilate','הנשמה במפוח עם חמצן, 10–12 בדקה','treatment','חובה',score('priorities',14),['ventilated'],{requires:['slow-breathing'],criticalOmission:true,result:'בית החזה עולה בכל הנשמה. השפתיים מוורידות.',vitals:{spo2:'94%',pulse:'72',respiratoryRate:'מונשם 10–12 בדקה'}}),
  action('mask-only','מסכת חמצן בלי הנשמה','treatment','מיותרת',score('priorities',-10),[],{critical:true,result:'בשש נשימות שטחיות בדקה החמצן לא מגיע לריאות. צריך להנשים.'}),
  action('cold-water','לשפוך עליו מים קרים כדי שיתעורר','treatment','מיותרת',score('priorities',-6),[],{result:'זה לא מעורר אותו ולא עוזר לנשימה. מבזבזים זמן.'}),
  action('call-als','הזעקת ALS','resources','חובה',score('priorities',10),['als-called'],{criticalOmission:true,result:'המוקד מעודכן. ALS בדרך.'}),
  action('aed-ready','הכנת AED','resources','מומלצת',score('priorities',4),['aed-ready'],{result:'ה־AED מוכן. דיכוי נשימה ממושך יכול להסתיים בדום לב.'}),
  action('reassess','מדדים חוזרים בזמן ההנשמה','reassessment','חובה',score('reassessment',10),['reassessed'],{requires:['ventilated'],result:'סטורציה 94%, דופק 72.'}),
  action('urgent-transport','פינוי דחוף עם הנשמה ומעקב','transport','חובה',score('priorities',8),['transport'],{requires:['ventilated'],criticalOmission:true,result:'יוצאים. ההנשמה נמשכת בדרך.'})],
 events:[{id:'apnea',trigger:{interactionsAtLeast:5,missingFacts:['ventilated']},change:{consciousness:'לא מגיב, AVPU=U',vitals:{respiratoryRate:'4, שטחית',spo2:'74%',pulse:'48'}},feedback:'הנשימה נעשית עוד יותר איטית, 4 בדקה, והשפתיים מכחילות. הדופק יורד. צריך להנשים עכשיו.'}],
 expectedPath:{principles:[['ppe','scan-scene','secure-needle'],['airway','open-airway','breathing'],['ventilate','call-als'],['circulation','neuro','glucose'],['substance','others'],['aed-ready','reassess','urgent-transport']],requiredFacts:['scene-safe','airway-opened','slow-breathing','ventilated','glucose','als-called','transport']},
 feedback:{explanations:{safety:'מחט משומשת היא סכנה למטפל. לא מרימים ביד.',ventilation:'באופיואידים הסכנה היא הפסקת נשימה. קצב של 6 שטחיות בדקה לא מספיק, וחמצן במסכה לא יעזור. מנשימים במפוח.',glucose:'היפוגליקמיה יכולה להיראות דומה. בודקים סוכר בכל ירידה בהכרה.',others:'אם עוד מישהו השתמש באותו חומר, ייתכן שיש מטופל נוסף. מדווחים למוקד.'}},
 reasoning:{
  impression:{opts:['הרעלת אופיואידים עם דיכוי נשימתי','היפוגליקמיה','מצב אחרי פרכוס','שיכרון אלכוהול'],why:'נשימה איטית ושטחית, אישוני סיכה, מזרק ודקירות באמה, וסוכר תקין.'},
  urgency:{opts:['ממשיכים להנשים, מבקשים ALS, מדווחים למוקד על מטופל אפשרי נוסף בדירה, ומפנים דחוף','מחכים שיתעורר ואז מחליטים','משכיבים על הצד ומחכים ל־ALS בלי להנשים','החבר ישגיח עליו בבית'],why:'המטופל תלוי בהנשמה. בנוסף, חבר שהשתמש באותו חומר עלול להיות במצב דומה, ואף אחד לא בודק אותו.'},
  handoff:{opts:['גבר כבן 30, לפי חבר הזריק לפני רבע שעה חומר שקנה היום. נמצא עם 6 נשימות שטחיות, סטורציה 82%, אישוני סיכה, AVPU=P. סוכר 96. נפתח נתיב אוויר ומונשם במפוח עם חמצן. עכשיו סטורציה 94%, דופק 72. עוד אדם השתמש באותו חומר ונמצא בדירה','גבר מסומם, מונשם','גבר כבן 30 לא מגיב. כנראה שיכור. סוכר לא נבדק','גבר כבן 30, אופיואידים. קיבל חמצן במסכה'],why:'מוסרים מה החומר ומתי, את מצב הנשימה לפני ואחרי, שנשלל סוכר נמוך, ושייתכן מטופל נוסף.'}
 }
}
];
LIST.forEach(s=>{autoMax(s);(window.SCENARIOS=window.SCENARIOS||[]).push(s)});
})();
