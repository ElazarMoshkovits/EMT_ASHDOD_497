const LETTERS=['א','ב','ג','ד'];
function q(text,opts,correct,why,scenario){return{text:text,opts:opts,correct:correct,why:why,scenario:!!scenario}}
const TOPICS=[
 {icon:'🧭',name:'אנמנזה וגישה לחולה',desc:'רושם ראשוני, ABCDE, מדדים, תקשורת ופינוי',color:'#4de2da',qs:[
  q('מהם שלושת מקורות המידע המרכזיים להערכת חולה?',['רושם ראשוני, אנמנזה ומדדים','מדדים, אבחנה וצילום','אנמנזה, תרופות וגיל','רושם ראשוני, פינוי ותיעוד'],0,'הערכה טובה משלבת את הרושם הראשוני, האנמנזה והמדדים — ולא נשענת על מקור יחיד.'),
  q('מהו סדר הגישה השיטתית לחולה נושם?',['ABCDE','CABDE','EDCBA','SAMPLE בלבד'],0,'בחולה נושם עובדים באופן שיטתי לפי A נתיב אוויר, B נשימה, C מחזור דם, D נוירולוגיה ו־E חשיפה ממוקדת.'),
  q('איזו פתיחה מתאימה ביותר לאנמנזה?',['מה מפריע לך עכשיו?','אתה לא לוקח תרופות, נכון?','זה רק לחץ, נכון?','למה חיכית עד עכשיו?'],0,'מתחילים בשאלה פתוחה, מאפשרים למטופל להשלים תשובה ונמנעים משאלה מובילה או מאשימה.'),
  q('איזה מידע יש לברר על כאב?',['מיקום, אופי, הקרנה, עוצמה, משך ומה מחמיר או מקל','רק עוצמה מ־1 עד 10','רק אם הכאב מקרין','רק מתי התחיל'],0,'אפיון מלא של כאב כולל מיקום, אופי, הקרנה, עוצמה, משך, רציפות וגורמים מחמירים או מקלים.'),
  q('מטופל מחוסר הכרה אך נושם. מאין אוספים אנמנזה?',['מעדים, קרובים ורמזים בזירה לאחר וידוא סימני חיים','ממתינים שיתעורר','רק ממסמכים רפואיים','לא אוספים אנמנזה'],0,'לאחר הערכת סימני חיים ו־ABCDE, נעזרים בעדים, קרובים, צמידים, תרופות, מסמכים וציוד בזירה.'),
  q('מהו טווח הנשימה התקין במבוגר?',['12–20 בדקה','4–8 בדקה','22–30 בדקה','30–40 בדקה'],0,'הטווח התקין הוא 12–20 נשימות בדקה. במקביל בודקים עומק, סדירות, מאמץ וקולות נשימה.'),
  q('סטורציה אינה מתאימה למראה המטופל. מה נכון לעשות?',['לבדוק איכות אות ופרפוזיה ולהעריך את המטופל כולו','להאמין תמיד למכשיר','להתעלם מכל המדדים','להחליף מיד את תוכנית הפינוי לפי המספר בלבד'],0,'גפה קרה, תנועה, לק, לחץ דם נמוך וחיישן לא מתאים עלולים לשבש קריאה. מטפלים במטופל ולא במספר בלבד.',true),
  q('באיזו תדירות יש לחזור על מדדים?',['לפחות כל 5–10 דקות ולאחר שינוי או טיפול','פעם אחת בלבד','כל שעה','רק אם המטופל מבקש'],0,'המגמה חשובה לא פחות מהערך הבודד. חוזרים על המדדים לפחות כל 5–10 דקות ולאחר כל שינוי או טיפול.'),
  q('מתי מזמינים ALS?',['בבעיה משמעותית ב־ABCD, כשיש יתרון לצוות מתקדם או כשנותר ספק אמיתי','רק בדום לב','רק אם המטופל מעל גיל 65','רק לאחר ההגעה לבית החולים'],0,'הזמנת ALS מתאימה בבעיה משמעותית, כשפרוטוקול מחייב, כשיש יתרון ברור לצוות מתקדם וגם בספק אמיתי.'),
  q('חולה נראה דחוף אך המשפחה מציעה להסיעו ברכב פרטי. מה נכון?',['לפנות באמבולנס, לטפל ולנטר בדרך','להסכים כדי לחסוך זמן','לאפשר רק אם בן משפחה נוהג מהר','להשאיר את ההחלטה ללא הסבר'],0,'חולה דחוף מפנים באמבולנס, כדי לאפשר טיפול וניטור רציפים בדרך.',true)
 ]},
 {icon:'⚡',name:'עילפון ופרכוסים',desc:'זיהוי, בטיחות בזמן פרכוס, פוסט־איקטלי וסטטוס',color:'#ffd166',qs:[
  q('מהו סטטוס אפילפטיקוס?',['פרכוס 5 דקות ומעלה או פרכוסים חוזרים ללא חזרה להכרה','כל פרכוס ראשון','בלבול שנמשך דקה','עילפון עם רעד קצר'],0,'סטטוס הוא פרכוס ממושך של 5 דקות ומעלה או פרכוסים חוזרים בלי חזרה להכרה תקינה ביניהם.'),
  q('מה אסור לעשות בזמן פרכוס פעיל?',['לרסן בכוח או להכניס חפץ לפה','להרחיק חפצים מסוכנים','לרפד את סביבת הראש','להזעיק ALS'],0,'אין לרסן את ההתכווצויות ואין להכניס אצבעות, חפצים או מנתב לפה בזמן הפרכוס.'),
  q('מהי הפעולה העיקרית מיד לאחר סיום ההתכווצויות?',['פתיחת נתיב אוויר, סילוק הפרשות והערכת נשימה','העמדה והליכה','מתן אוכל','עזיבת המטופל למנוחה'],0,'בשלב הפוסט־איקטלי יש לפתוח נתיב אוויר, לטפל בהפרשות, לבדוק נשימה ולתת חמצן או סיוע לפי הצורך.'),
  q('בזמן פרכוס טוני־קלוני פעיל, מה ניתן למדוד באופן סביר אם בטוח?',['סוכר','לחץ דם מדויק','דופק רדיאלי מדויק','בדיקת כוח גס'],0,'אם הדבר אפשרי ובטוח ניתן למדוד סוכר; דופק ולחץ דם אינם אמינים בזמן ההתכווצויות.'),
  q('באיזה גיל שכיחים פרכוסי חום?',['6 חודשים עד 5 שנים','לידה עד חודש','6–12 שנים בלבד','מעל גיל 18'],0,'פרכוסי חום נפוצים בעיקר מגיל 6 חודשים ועד 5 שנים.'),
  q('ילד עבר פרכוס חום ראשון וחזר לעצמו. מה נכון?',['לפנות להמשך בירור גם אם נראה שהגורם הוא חום','אין צורך בבדיקה','לקרר בקרח','לתת אוכל מיד'],0,'פרכוס חום ראשון מחייב פינוי והמשך בירור; אין לבצע קירור קיצוני.',true),
  q('מה מאפיין עילפון פשוט ברוב המקרים?',['חזרה להכרה בתוך פחות מדקה לאחר שכיבה','מצב פוסט־איקטלי ממושך','התכווצויות ממושכות','חוסר הכרה לשעה'],0,'עילפון נובע מירידה זמנית בזרימת הדם למוח ובדרך כלל חולף במהירות לאחר שכיבה.'),
  q('מטופל מרגיש שעומד להתעלף. מהי פעולה מתאימה?',['להשכיב ולהרים רגליים','להעמיד ולהוליך','לשפוך עליו מים','לתת סטירות'],0,'לפני עילפון משכיבים ומרימים רגליים; אם אי־אפשר, מושיבים עם הראש בין הברכיים.',true),
  q('מטופל אינו חוזר במהירות להכרה לאחר אירוע שנראה כעילפון. מה נכון?',['לחפש סיבה אחרת, להזעיק ALS ולטפל כמצב חמור','להמתין ללא ניטור','להעמיד אותו','להניח שזה עילפון רגיל'],0,'התאוששות ממושכת אינה מתאימה לעילפון פשוט ומחייבת הערכה וטיפול דחופים.'),
  q('איזה ממצא מתאים יותר לפרכוס מאשר לעילפון?',['חזרה הדרגתית עם בלבול פוסט־איקטלי','תחושת החשכה בעיניים לפני האירוע','אירוע בעמידה ממושכת','חזרה מהירה לאחר שכיבה'],0,'בלבול וישנוניות עם חזרה הדרגתית אופייניים למצב פוסט־איקטלי אחרי פרכוס.')
 ]},
 {icon:'🧠',name:'שבץ ומצבי חירום נוירולוגיים',desc:'FAST, זמן אחרון תקין, TIA וחיקויי שבץ',color:'#9a8cff',qs:[
  q('מה בודק FAST?',['פנים, ידיים, דיבור וזמן','חום, נתיב אוויר, עור וטיפול','דופק, נשימה, לחץ דם וסוכר','אישונים, כאב, שיווי משקל וחום'],0,'FAST בודק Face, Arm, Speech ומדגיש Time — תיעוד הזמן ופינוי דחוף.'),
  q('איזה זמן חשוב במיוחד לתעד בחשד לשבץ?',['תחילת הסימנים או הפעם האחרונה שנראה תקין','שעת הארוחה האחרונה בלבד','מועד בדיקת לחץ הדם הראשונה בלבד','זמן יציאת האמבולנס בלבד'],0,'כאשר זמן ההתחלה אינו ידוע, מתעדים מתי המטופל נראה לאחרונה ללא התסמינים.'),
  q('מה נכון לגבי TIA בשטח?',['הסימנים יכולים לחלוף אך הגישה והפינוי זהים לשבץ','אין צורך בפינוי אם חלף','ניתן להבדיל בוודאות משבץ בשטח','TIA אינו אירוע נוירולוגי'],0,'בשדה אי־אפשר להבדיל בבטחה בין TIA לשבץ; גם אם הסימנים חלפו נדרש פינוי דחוף.'),
  q('איזו בדיקה מסייעת לשלול חיקוי שכיח של שבץ?',['בדיקת סוכר','מדידת חום בלבד','בדיקת שמיעה','מישוש בטן'],0,'היפוגליקמיה עלולה לחקות שבץ ולכן בודקים סוכר כחלק מההערכה.'),
  q('איזה סימן נכלל בבדיקת Face?',['צניחת צד בפנים בחיוך','כאב בחזה','נפיחות ברגליים','שיעול'],0,'מבקשים לחייך ומחפשים אסימטריה או צניחת צד בפנים.'),
  q('מטופל התעורר עם קושי בדיבור. בת זוגו ראתה אותו תקין לפני השינה. מהו הזמן הרלוונטי?',['הפעם האחרונה שנראה תקין לפני השינה','רגע ההתעוררות בלבד','זמן הגעת הכונן','אין צורך בזמן אם התעורר כך'],0,'בשבץ בהתעוררות הזמן החשוב הוא הפעם האחרונה שבה נראה תקין, ולא רק זמן גילוי הסימנים.',true),
  q('איזו תלונת ראייה יכולה להיות סימן לשבץ?',['אובדן חלק משדה הראייה או כפל ראייה','רק קוצר ראייה כרוני','צריבה אחרי אבק בלבד','צורך במשקפי קריאה'],0,'יש לשאול במפורש על טשטוש, כפל ראייה, אובדן שדה או עיוורון בעין אחת.'),
  q('מהו סוג השבץ השכיח ביותר?',['איסכמי — כ־85%','המורגי — כ־85%','TIA — כ־85%','כולם שכיחים באותה מידה'],0,'כ־85% ממקרי השבץ הם איסכמיים ונגרמים מחסימה של כלי דם במוח.'),
  q('איזה גורם קשור לשבץ המורגי?',['יתר לחץ דם או דופן כלי דם חלשה','דילוג על ארוחה בלבד','אסתמה','שבר בגפה'],0,'שבץ המורגי נגרם מקרע ודימום וקשור בין היתר ליתר לחץ דם, מום כלי דם וחבלת ראש עם מדללי דם.'),
  q('FAST חיובי והסוכר תקין. מהו המשך מתאים?',['פינוי דחוף לבית חולים מתאים ודיווח מוקדם','המתנה לשיפור בבית','מתן אוכל','הליכה לצורך בדיקת יציבות'],0,'לאחר טיפול באיומי ABCDE יש לפנות בדחיפות לבית חולים ייעודי ולמסור דיווח מוקדם.',true)
 ]},
 {icon:'🩸',name:'סוכרת ומצבי חירום גליקמיים',desc:'היפוגליקמיה, היפרגליקמיה, גלוקוז ומדידה נכונה',color:'#61e294',qs:[
  q('מהו טווח גלוקוז תקין בצום?',['כ־70–100 mg/dL','20–40 mg/dL','140–180 mg/dL','250–400 mg/dL'],0,'טווח גלוקוז תקין בצום הוא כ־70–100 mg/dL.'),
  q('איזה תיאור מתאים להיפוגליקמיה?',['התפתחות מהירה, עור קר ולח ושינוי התנהגות','התפתחות של ימים ועור יבש בלבד','רק צמא והשתנה מרובה','ללא שינוי הכרה'],0,'היפוגליקמיה מתפתחת לרוב בתוך דקות ויכולה לגרום להזעה, רעב, סחרחורת, התנהגות חריגה, פרכוס וירידה בהכרה.'),
  q('איזה תיאור מתאים יותר להיפרגליקמיה?',['התפתחות הדרגתית, צמא, השתנה מרובה והתייבשות','הופעה תוך שניות עם עור קר','שיפור לאחר דילוג על אינסולין','דופק איטי ומלא תמיד'],0,'היפרגליקמיה מתפתחת בשעות עד ימים ועלולה לגרום לצמא, השתנה, עור יבש, כאבי בטן, הקאות והתייבשות.'),
  q('סוכר 48 mg/dL, המטופל בהכרה מלאה ובולע היטב. מה מתאים?',['מזון או משקה מתוק/גלוקוג׳ל לפי הפרוטוקול','אינסולין','להשאיר ללא טיפול','לגרום להקאה'],0,'בהכרה מלאה ויכולת בליעה ניתן לתת סוכר פומי לפי הפרוטוקול, תוך הערכה חוזרת ופינוי מתאים.',true),
  q('מטופל היפוגליקמי בהכרה מעורפלת ואינו בולע היטב. מה אסור?',['לתת אוכל או משקה דרך הפה','לשמור על נתיב אוויר','להזעיק ALS לפי מצבו','לבדוק סוכר'],0,'כאשר ההכרה מעורפלת או חסרה אין לתת אוכל או משקה בגלל סכנת אספירציה.'),
  q('האם חובש נותן אינסולין בהיפרגליקמיה?',['לא — הטיפול הטרום־אשפוזי אינו כולל אינסולין','כן, בכל ערך מעל 140','כן, אם המשפחה מסכימה','רק בסוכרת סוג 1 ללא התייעצות'],0,'חובש אינו מזריק אינסולין. מטפלים ב־ABC, מנטרים ומפנים בהתאם למצב.'),
  q('מה משמעות LOW או HIGH במד הסוכר?',['ערך מחוץ לטווח המכשיר, שיש לפרש לפי מפרט וקליניקה','אבחנה סופית','תקלה ודאית בכל מקרה','ערך תקין'],0,'LOW ו־HIGH מציינים שהערך מתחת או מעל טווח המדידה; יש לבדוק את מפרט המכשיר ולהתייחס למצב המטופל.'),
  q('לאחר חיטוי האצבע לפני דקירה, מה עושים?',['ממתינים כ־30 שניות לייבוש','דוקרים מיד כשהאלכוהול רטוב','סוחטים בחוזקה','מורחים גלוקוז על האצבע'],0,'ממתינים לייבוש חומר החיטוי כדי לצמצם זיהום של הדגימה ושגיאת מדידה.'),
  q('תוצאת סוכר אינה מתאימה לקליניקה. מה נכון?',['לחזור על הבדיקה ולהעריך את המטופל','להתעלם מהמטופל','לקבל תמיד את התוצאה הראשונה','לתת אינסולין ליתר ביטחון'],0,'מקלון פגום, מעט דם, סחיטה, הלם או התייבשות עלולים לשבש תוצאה; חוזרים על הבדיקה ומטפלים לפי הקליניקה.'),
  q('מטופלת סוכרתית מזיעה, מבולבלת ודופקה מהיר. מה הבדיקה המיידית החשובה?',['גלוקוז בדם כחלק מ־ABCDE','בדיקת ראייה בלבד','צילום חזה','בדיקת שמיעה'],0,'התמונה מתאימה להיפוגליקמיה אפשרית; בודקים סוכר במהירות בלי להזניח את ABCDE.',true)
 ]},
 {icon:'☣️',name:'הרעלות',desc:'בטיחות, דרכי חשיפה, אופיואידים, חומרים צורבים ו־CO',color:'#ff9f5b',qs:[
  q('מה קודם לכל טיפול בזירת הרעלה?',['בטיחות המטפל והערכת הסביבה','איסוף כל האריזות בידיים חשופות','כניסה מהירה לחדר סגור','גרימת הקאה'],0,'אין להיכנס לסביבה מסוכנת. יש לחפש גזים, עשן, כימיקלים, מחטים וחפצים חדים.'),
  q('איזה מידע יש לברר בחשד להרעלה?',['חומר, כמות, דרך חשיפה, זמן ושילובים','רק שם החומר','רק גיל המטופל','רק אם היו הקאות'],0,'יש לברר מה החומר, כמה, באיזו דרך ומתי נחשף המטופל, וכן שילובים, גיל, סימנים ותסמינים.'),
  q('מה נכון בחשד להרעלה לפני הופעת סימנים?',['לא להמתין; לפנות למוקד/מרכז הרעלות ולפעול לפי הנחיות','להמתין עד שיופיעו סימנים','לגרום להקאה','לתת חלב'],0,'אין להמתין להופעת סימנים ואין לגרום להקאה או לתת אוכל ושתייה.'),
  q('מהו האיום העיקרי בהרעלת אופיואידים?',['דיכוי עד הפסקת נשימה','יתר לחץ דם קיצוני','היפרוונטילציה בלבד','חום גבוה תמיד'],0,'אופיואידים גורמים לסדציה, ברדיפנאה ואישוני סיכה; הסכנה המרכזית היא כשל נשימתי.'),
  q('בבליעת חומצה או בסיס, מה אסור לעשות?',['לגרום להקאה','להעריך נתיב אוויר','להזעיק סיוע','לשמור את האריזה'],0,'הקאה חושפת שוב את הוושט והפה לחומר הצורב ועלולה להחמיר את הפגיעה.'),
  q('מה נכון לגבי סטורציה רגילה בהרעלת CO?',['היא עלולה להיראות תקינה ולהטעות','היא תמיד אפס','היא מאבחנת CO בוודאות','היא אינה נדלקת'],0,'פחמן חד־חמצני משבש נשיאת חמצן, ופולס־אוקסימטר רגיל עלול להציג ערך שנראה תקין.'),
  q('איזה סיפור זירה מעלה חשד משמעותי ל־CO?',['רכב מונע בחלל סגור','נפילה ברחוב פתוח','חתך ביד','מאמץ ספורטיבי בחוץ'],0,'רכב מונע בחלל סגור, חימום פגום או אש בחדר לא מאוורר הם רמזים מרכזיים.',true),
  q('מהו טיפול ראשוני מתאים בחשד להרעלת CO לאחר יציאה בטוחה?',['ABCDE, חמצן בריכוז גבוה ופינוי דחוף','המתנה למד סטורציה נמוך','גרימת הקאה','מתן מזון'],0,'לאחר חילוץ בטוח מטפלים לפי ABCDE, נותנים חמצן בריכוז גבוה לפי הפרוטוקול ומפנים בדחיפות.'),
  q('כיצד פועל ציאניד בעיקר?',['משבש את השימוש התאי בחמצן','חוסם מכנית את קנה הנשימה','מעלה רק את רמת הסוכר','גורם רק לכוויה בעור'],0,'בציאניד החנק הוא ברמת התא, ולכן חמצון מכני לבדו אינו פותר את הרעילות.'),
  q('מטופל תחת השפעה נעשה תוקפני ויש סביבו מחטים. מה נכון?',['לשמור מרחק ובטיחות ולהזעיק משאבים מתאימים','להתקרב לבד','לאסוף את המחטים ביד','לחסום את היציאה בגוף'],0,'בטיחות הזירה קודמת. מטופל תחת השפעה עלול להיות אלים, ויש להימנע מחשיפה למחטים ולסכנות.',true)
 ]},
 {icon:'🫁',name:'מצבי חירום נשימתיים',desc:'מצוקה וכשל, אסתמה, COPD, אנפילקסיס והיפרוונטילציה',color:'#5ba9ff',qs:[
  q('איזה סימן מעיד על כשל נשימתי מאיים יותר מאשר על מצוקה מפוצה?',['ירידה במאמץ בגלל תשישות ושינוי הכרה','טכיפנאה עם יכולת דיבור','שיעול יעיל','אי־שקט קל בלבד'],0,'ירידה במאמץ אינה בהכרח שיפור; עם תנועת אוויר חלשה ושינוי הכרה היא עלולה להעיד על תשישות וכשל.'),
  q('מה מאפיין התקף אסתמה?',['ברונכוספזם, נשיפה מוארכת וצפצופים','רק בצקת ברגליים','כאב שמשתנה בלחיצה בלבד','נשימה איטית ללא קושי'],0,'אסתמה גורמת להיצרות בדרכי האוויר התחתונות, נשיפה מוארכת, צפצופים, שיעול וטכיפנאה.'),
  q('מהו סטטוס אסתמטיקוס?',['התקף ממושך שאינו מגיב עם תשישות או כחלון','כל צפצוף קל','שיעול שנמשך דקה','אסתמה ללא תסמינים'],0,'זהו מצב מסכן חיים המחייב ALS ופינוי דחוף.'),
  q('מה ההבדל העיקרי בין אמפיזמה לברונכיטיס כרונית?',['באמפיזמה נהרסות דפנות נאדיות; בברונכיטיס יש ייצור ליחה כרוני','אין הבדל','אמפיזמה היא רק אלרגיה','ברונכיטיס פוגעת רק בלב'],0,'אמפיזמה מפחיתה את שטח חילוף הגזים; ברונכיטיס כרונית חוסמת דרכי אוויר בליחה ופוגעת באוורור.'),
  q('מתי יש חשד לאנפילקסיס?',['הופעה חריפה רב־מערכתית לאחר אלרגן עם פגיעה נשימתית או המודינמית','פריחה מקומית ישנה בלבד','כאב שריר לאחר מאמץ','נזלת כרונית בלבד'],0,'אנפילקסיס חשוד כשיש הופעה מהירה של עור/ריריות יחד עם נשימה או לחץ דם, או שתי מערכות ויותר לאחר חשיפה.'),
  q('מהו מינון האדרנלין בערכת ההזרקה?',['0.15 מ״ג מתחת לגיל 10 ו־0.3 מ״ג מגיל 10','1 מ״ג לכל גיל','0.3 מ״ג רק מעל גיל 18','המינון נקבע לפי גובה בלבד'],0,'בערכת ההזרקה נותנים 0.15 מ״ג מתחת לגיל 10 ו־0.3 מ״ג מגיל 10, במסגרת פרוטוקול אנפילקסיס.'),
  q('היכן מזריקים מזרק אדרנלין אוטומטי?',['בחלק החיצוני של אמצע הירך','בכף היד','בצוואר','בבטן העליונה'],0,'המזרק האוטומטי מוצמד לחלק החיצוני של אמצע הירך, וניתן להזריק דרך בגד לאחר בדיקת הכיס.'),
  q('אין שיפור משמעותי אחרי מנת אדרנלין באנפילקסיס. מה נכון?',['לשקול מנה נוספת אחרי 5–10 דקות ולהתייעץ אחרי שתי מנות','לתת מיד עשר מנות','להפסיק ניטור','להמתין שעה'],0,'ממשיכים הערכה ופינוי דחוף; ניתן לשקול מנה נוספת לאחר 5–10 דקות ולפעול לפי הפרוטוקול והמוקד.',true),
  q('מטופלת נושמת מהר לאחר אירוע מלחיץ ומתלוננת על נימול. מה אסור לעשות?',['לבקש ממנה לנשום לתוך שקית','לבצע ABCDE ומדדים','לשלול סיבה רפואית','לדבר ברוגע'],0,'אין להשתמש בשקית. יש לשלול היפרגליקמיה, חבלת ראש, פגיעת חזה וסיבות מסוכנות אחרות לפני ייחוס לחרדה.'),
  q('מטופלת עם נפיחות שפתיים, צפצופים ולחץ דם נמוך אחרי אכילה. מה העדיפות?',['זיהוי אנפילקסיס, אדרנלין IM לפי פרוטוקול ופינוי דחוף','להמתין לפריחה מלאה','לתת מים','לבקש שתלך'],0,'יש כאן פגיעה נשימתית והמודינמית לאחר חשיפה אפשרית; אדרנלין IM הוא טיפול מפתח לפי הפרוטוקול.',true)
 ]},
 {icon:'❤️',name:'מצבי חירום קרדיאליים',desc:'ACS, תעוקה, אוטם, אספירין, אי־ספיקת לב והלם',color:'#ff5d73',qs:[
  q('מה מאפיין תעוקה יציבה?',['מתחילה במאמץ וחולפת לרוב במנוחה או בתרופה מוכרת','מופיעה תמיד במנוחה ואינה חולפת','נמשכת ימים ללא שינוי','משתנה תמיד בלחיצה על החזה'],0,'תעוקה יציבה מופיעה כשהדרישה לחמצן עולה ובדרך כלל חולפת בתוך 5–15 דקות במנוחה או עם תרופה מוכרת.'),
  q('מה מעלה חשד לתעוקה לא יציבה?',['כאב חדש, תכוף או חזק יותר שאינו חולף כרגיל','כאב שריר מוכר שחולף במגע','כאב קצר אחרי תנועה בלבד','גרד בחזה'],0,'כאב חדש, מחמיר, מופיע במאמץ קטן יותר או אינו מגיב למנוחה כרגיל הוא דגל אדום.'),
  q('איזה תיאור מתאים לכאב לבבי טיפוסי?',['לחץ מפושט שאינו משתנה במגע, נשימה או תנוחה','כאב נקודתי שמשתנה בלחיצה','גרד בעור','כאב שמופיע רק בתנועת אצבע'],0,'כאב לבבי מתואר לעיתים כלוחץ ומפושט ויכול להקרין ליד, צוואר, לסת, גב או בטן עליונה.'),
  q('אצל מי שכיח יותר אוטם שקט ללא כאב טיפוסי?',['נשים, חולי סוכרת וקשישים','רק ספורטאים צעירים','רק ילדים','רק מטופלים עם אסתמה'],0,'אוטם שקט שכיח יותר בנשים, חולי סוכרת, קשישים ואנשים עם צריכת אלכוהול מוגברת.'),
  q('כיצד מגדיר חובש כאב חשוד ממקור לבבי בשטח?',['תסמונת כלילית חריפה — ACS','אוטם ודאי','תעוקה יציבה ודאית','דלקת שריר ודאית'],0,'החובש אינו מאבחן אוטם בשטח; כאב חשוד מטופל כתסמונת כלילית חריפה.'),
  q('מהי הסכנה המיידית העיקרית באוטם שריר הלב?',['פרפור חדרים — VF','דלקת גרון','היפוגליקמיה בלבד','שבר בצלע'],0,'VF היא הפרעת קצב מסכנת חיים הדורשת דפיברילציה מיידית.'),
  q('מהו מינון האספירין בחשד ל־ACS?',['300 מ״ג בלעיסה','30 מ״ג בבליעה','1 גרם בהזרקה','לא נותנים אספירין ב־ACS'],0,'המינון הוא 300 מ״ג בלעיסה, לאחר הערכה ותשאול ושלילת התוויות נגד.'),
  q('אילו התוויות נגד יש לשלול לפני מתן אספירין?',['רגישות, דימום פעיל, טראומה, כיב פעיל, היריון או ניתוח','קוצר נשימה בלבד','גיל מעל 40','דופק מהיר'],0,'שוללים רגישות, דימום פעיל, טראומה, כיב פעיל, היריון וניתוח. מתחת לגיל 12 לא נותנים; במקרה של ספק מתייעצים עם המוקד.'),
  q('איזה מצב מתאים לבצקת ריאות על רקע אי־ספיקת לב שמאל?',['קוצר נשימה, שיעול וכיח וקושי בשכיבה','כאב אצבע בלבד','פריחה מקומית','שיפור בשכיבה שטוחה'],0,'גודש ריאתי יכול לגרום לקוצר נשימה, שיעול וכיח, קושי בשכיבה או בלילה ולעיתים בלבול ובצקות.'),
  q('מטופל עם לחץ בחזה, זיעה קרה, קוצר נשימה וחולשה. מה נכון?',['לטפל כ־ACS, לנטר ולפנות בדחיפות','להניח שמדובר בצרבת','לבקש שילך כדי לבדוק סבילות','להמתין שהכאב יחלוף'],0,'התמונה חשודה ל־ACS. מבצעים ABCDE, מזמינים משאבים, מטפלים לפי פרוטוקול ומפנים ללא עיכוב.',true)
 ]}
];

TOPICS.forEach(function(topic,ti){topic.qs.forEach(function(item,qi){item.id='p2-'+ti+'-'+qi;item.topicIndex=ti})});
const ALL=TOPICS.reduce(function(list,topic){return list.concat(topic.qs)},[]);
const $=function(s){return document.querySelector(s)};
const defaults={name:'חובש/ת',xp:0,sound:true,part2Stars:{},part2Mistakes:[],part2SavedReview:[],part2Stats:{answered:0,correct:0}};
let profile=loadProfile(),session=null,tick=null,toastTimer=null;

function loadProfile(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem('medicQuestProfile')||'{}'))}catch(e){return Object.assign({},defaults)}}
function save(){localStorage.setItem('medicQuestProfile',JSON.stringify(profile));updateHeader()}
function shuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function updateHeader(){
 $('#xp').textContent=Number(profile.xp)||0;
 const starCount=Object.values(profile.part2Stars||{}).reduce(function(a,b){return a+(Number(b)||0)},0);
 $('#stars').textContent=starCount;
 const stats=profile.part2Stats||{answered:0,correct:0};
 const mastery=stats.answered?Math.round(stats.correct/stats.answered*100):0;
 $('#mastery').textContent=mastery+'%';
 $('#answeredSummary').textContent=stats.answered?'דיוק מצטבר: '+stats.correct+'/'+stats.answered:'עוד לא נענו שאלות';
 $('#welcome').textContent=profile.name==='חובש/ת'?'מצבי חירום רפואיים — מתרגלים לפי נושא':'ברוך הבא, '+profile.name;
 $('#soundBtn').textContent=profile.sound===false?'🔇':'🔊';
 const count=(profile.part2Mistakes||[]).length;
 $('#mistakeLabel').textContent=count===1?'שאלה אחת שממתינה לתרגול חוזר':count>1?count+' שאלות שממתינות לתרגול חוזר':'אין כרגע טעויות לתרגול';
}
function renderTopics(){
 const host=$('#topics');host.innerHTML='';
 TOPICS.forEach(function(topic,i){
  const card=document.createElement('button');card.className='topic-card';card.dataset.icon=topic.icon;card.style.setProperty('--topic',topic.color);
  const star=Number((profile.part2Stars||{})[i])||0;
  card.innerHTML='<span class="topic-no">0'+(i+1)+'</span><h3>'+topic.icon+' '+topic.name+'</h3><p>'+topic.desc+'</p><div class="topic-foot"><span>'+topic.qs.length+' שאלות</span><span class="topic-stars">'+('★'.repeat(star)+'☆'.repeat(3-star))+'</span></div>';
  card.onclick=function(){startGame(topic.qs,{mode:'topic',topicIndex:i,label:topic.name})};host.appendChild(card);
 });
}
function show(view){$('#home').classList.toggle('hidden',view!=='home');$('#game').classList.toggle('hidden',view!=='game');window.scrollTo({top:0,behavior:'smooth'})}
function mixedQueue(){let list=[];TOPICS.forEach(function(topic){list=list.concat(shuffle(topic.qs).slice(0,2))});return shuffle(list)}
function reviewQueue(){const ids=new Set([].concat(profile.part2Mistakes||[],profile.part2SavedReview||[]));return shuffle(ALL.filter(function(item){return ids.has(item.id)}))}
function startGame(items,meta){
 clearInterval(tick);session={queue:shuffle(items),index:0,score:0,correct:0,hearts:3,answered:false,answers:[],meta:meta};show('game');renderQuestion();
}
function renderQuestion(){
 const item=session.queue[session.index],topic=TOPICS[item.topicIndex];
 session.answered=false;$('#gameTitle').textContent=session.meta.label;$('#qCount').textContent=(session.index+1)+'/'+session.queue.length;
 $('#progressBar').style.width=(session.index/session.queue.length*100)+'%';$('#hearts').textContent='♥'.repeat(session.hearts)+'♡'.repeat(3-session.hearts);
 $('#topic').textContent=topic.name;$('#scenarioPill').classList.toggle('hidden',!item.scenario);$('#question').textContent=item.text;
 $('#explain').classList.add('hidden');$('#nextBtn').classList.add('hidden');updateReviewButton(item);
 const host=$('#answers');host.innerHTML='';
 item.opts.forEach(function(option,i){const b=document.createElement('button');b.className='answer';b.innerHTML='<span class="letter">'+LETTERS[i]+'</span><span>'+option+'</span>';b.onclick=function(){answer(i,b,false)};host.appendChild(b)});
 startTimer();
}
function startTimer(){
 clearInterval(tick);let left=35;const timer=$('#timer');timer.querySelector('span').textContent=left;timer.style.setProperty('--time','360deg');
 tick=setInterval(function(){left--;timer.querySelector('span').textContent=left;timer.style.setProperty('--time',(left/35*360)+'deg');if(left<=0){clearInterval(tick);answer(-1,null,true)}},1000);
}
function answer(choice,button,timedOut){
 if(session.answered)return;session.answered=true;clearInterval(tick);
 const item=session.queue[session.index],correct=choice===item.correct,buttons=[].slice.call(document.querySelectorAll('.answer'));
 buttons.forEach(function(b,i){b.disabled=true;if(i===item.correct)b.classList.add('correct')});
 if(!correct){session.hearts=Math.max(0,session.hearts-1);if(button)button.classList.add('wrong');addUnique('part2Mistakes',item.id)}else{session.correct++;session.score+=item.scenario?140:100;removeValue('part2Mistakes',item.id)}
 profile.part2Stats=profile.part2Stats||{answered:0,correct:0};profile.part2Stats.answered++;if(correct)profile.part2Stats.correct++;
 session.answers.push({id:item.id,correct:correct,topicIndex:item.topicIndex});profile.xp=(Number(profile.xp)||0)+(correct?(item.scenario?140:100):10);save();beep(correct?'ok':'bad');
 const explain=$('#explain');explain.textContent=(timedOut?'הזמן הסתיים. ':'')+(correct?'נכון! ':'לא בדיוק. ')+item.why;explain.classList.remove('hidden');
 $('#hearts').textContent='♥'.repeat(session.hearts)+'♡'.repeat(3-session.hearts);$('#nextBtn').textContent=session.index===session.queue.length-1?'לסיכום ←':'לשאלה הבאה ←';$('#nextBtn').classList.remove('hidden');
}
function next(){if(!session.answered)return;if(session.index<session.queue.length-1){session.index++;renderQuestion()}else finishGame()}
function finishGame(){
 clearInterval(tick);const percent=Math.round(session.correct/session.queue.length*100),stars=percent>=90?3:percent>=75?2:percent>=60?1:0;
 if(session.meta.mode==='topic'){profile.part2Stars=profile.part2Stars||{};profile.part2Stars[session.meta.topicIndex]=Math.max(Number(profile.part2Stars[session.meta.topicIndex])||0,stars);save()}
 const wrongByTopic={};session.answers.filter(function(a){return !a.correct}).forEach(function(a){wrongByTopic[a.topicIndex]=(wrongByTopic[a.topicIndex]||0)+1});
 const weak=Object.keys(wrongByTopic).sort(function(a,b){return wrongByTopic[b]-wrongByTopic[a]}).map(function(i){return TOPICS[i].name});
 const modal=$('#modal'),card=$('#modalCard');card.innerHTML='<div class="big-emoji">'+(percent>=90?'🏆':percent>=70?'👏':'📚')+'</div><h2>'+ (percent>=90?'שליטה מצוינת':percent>=70?'בסיס טוב — ממשיכים לחדד':'כדאי לתרגל שוב') +'</h2><p>'+session.meta.label+'</p><div class="result-grid"><div class="stat"><b>'+percent+'%</b><small>ציון</small></div><div class="stat"><b>'+session.correct+'/'+session.queue.length+'</b><small>נכונות</small></div><div class="stat"><b>'+session.score+'</b><small>נקודות</small></div></div>'+(weak.length?'<div class="weak-list"><b>נושאים שכדאי לחזק</b><ul>'+weak.map(function(name){return '<li>'+name+'</li>'}).join('')+'</ul></div>':'')+'<div class="result-actions"><button class="primary" id="retryResult">תרגול חוזר</button><button class="review-btn" id="homeResult">בחירת נושא</button><a class="review-btn" href="index.html#part-b">סימולטור אנמנזה</a></div>';
 modal.classList.remove('hidden');$('#retryResult').onclick=function(){modal.classList.add('hidden');startGame(session.queue,session.meta)};$('#homeResult').onclick=function(){modal.classList.add('hidden');show('home');renderTopics()};
}
function addUnique(key,id){profile[key]=profile[key]||[];if(profile[key].indexOf(id)<0)profile[key].push(id)}
function removeValue(key,id){profile[key]=(profile[key]||[]).filter(function(x){return x!==id})}
function updateReviewButton(item){const saved=(profile.part2SavedReview||[]).indexOf(item.id)>=0;$('#reviewBtn').classList.toggle('saved',saved);$('#reviewBtn').textContent=saved?'★ נשמר לחזרה':'🔖 שמור לחזרה'}
function toggleReview(){if(!session)return;const item=session.queue[session.index];if((profile.part2SavedReview||[]).indexOf(item.id)>=0)removeValue('part2SavedReview',item.id);else addUnique('part2SavedReview',item.id);save();updateReviewButton(item);toast((profile.part2SavedReview||[]).indexOf(item.id)>=0?'השאלה נשמרה לחזרה':'השאלה הוסרה מהחזרה')}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.add('hidden')},2400)}
function beep(kind){if(profile.sound===false)return;try{const C=window.AudioContext||window.webkitAudioContext,ctx=new C(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=kind==='ok'?660:190;gain.gain.value=.045;osc.connect(gain);gain.connect(ctx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.14);osc.stop(ctx.currentTime+.15)}catch(e){}}
function editProfile(){const current=profile.name==='חובש/ת'?'':profile.name,nextName=prompt('שם השחקן/ית:',current);if(nextName===null)return;profile.name=nextName.trim()||'חובש/ת';save()}
function resetPart2(){if(!confirm('לאפס את הכוכבים, הטעויות והסטטיסטיקה של חלק ב׳? הנקודות הכלליות יישמרו.'))return;profile.part2Stars={};profile.part2Mistakes=[];profile.part2SavedReview=[];profile.part2Stats={answered:0,correct:0};save();renderTopics();toast('התקדמות חלק ב׳ אופסה')}

$('#mixedBtn').onclick=function(){startGame(mixedQueue(),{mode:'mixed',label:'אתגר משולב — חלק ב׳'})};
$('#mistakesBtn').onclick=function(){const queue=reviewQueue();if(!queue.length){toast('אין כרגע טעויות או שאלות שמורות 🎉');return}startGame(queue,{mode:'review',label:'בנק הטעויות והחזרה'})};
$('#nextBtn').onclick=next;$('#quitBtn').onclick=function(){clearInterval(tick);show('home')};$('#reviewBtn').onclick=toggleReview;
$('#profileBtn').onclick=editProfile;$('#resetBtn').onclick=resetPart2;$('#soundBtn').onclick=function(){profile.sound=profile.sound===false;save();if(profile.sound)beep('ok')};
renderTopics();updateHeader();
if(new URLSearchParams(location.search).get('mode')==='mixed')setTimeout(function(){$('#mixedBtn').click()},80);
