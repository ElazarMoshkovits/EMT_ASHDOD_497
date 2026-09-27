(function(){
const categories=['safety','primary','emergency','priorities','anamnesis','followup','reassessment','reasoning'];
// אילו מדדים נמדדים בכל פעולת הערכה, לפי מזהה הפעולה. פעולה יכולה להגדיר measures משלה.
const MEASURES={breathing:['respiratoryRate','spo2'],circulation:['pulse','bloodPressure'],glucose:['glucose'],temperature:['temperature']};
const VITAL_LABELS={respiratoryRate:'נשימות',pulse:'דופק',bloodPressure:'ל״ד',spo2:'סטורציה',glucose:'סוכר',temperature:'חום'};
const REASONING_POINTS=4;
const CRITICAL_CAP=59;

class AnamnesisEngine{
 constructor(scenario){
  this.scenario=scenario;
  this.state={phase:'scene',actions:[],questions:[],facts:[],unlocked:[],events:[],criticalErrors:[],score:Object.fromEntries(categories.map(k=>[k,0])),interactions:0,patient:{consciousness:scenario.patient.consciousness},vitals:Object.assign({},scenario.patient.vitals),vitalLog:{},log:[],history:[],reasoning:{}};
 }
 hasFact(id){return this.state.facts.includes(id)} didAction(id){return this.state.actions.includes(id)} asked(id){return this.state.questions.includes(id)}
 evaluate(c={}){if(!c||!Object.keys(c).length)return true;if(c.action&&!this.didAction(c.action))return false;if(c.question&&!this.asked(c.question))return false;if(c.fact&&!this.hasFact(c.fact))return false;if(c.interactionsAtLeast&&this.state.interactions<c.interactionsAtLeast)return false;if(c.missingFacts&&c.missingFacts.some(f=>this.hasFact(f)))return false;if(c.missingActions&&c.missingActions.some(a=>this.didAction(a)))return false;if(c.all&&!c.all.every(x=>this.evaluate(x)))return false;if(c.any&&!c.any.some(x=>this.evaluate(x)))return false;return true}
 addFacts(ids=[]){ids.forEach(id=>{if(!this.hasFact(id))this.state.facts.push(id)})}
 applyScore(s){if(s)this.state.score[s.category]=(this.state.score[s.category]||0)+s.points}
 applyVitals(patch){if(patch)Object.assign(this.state.vitals,patch)}
 allActions(){return [...this.scenario.actions,...this.scenario.primaryAssessment]}
 measuresOf(a){return a.measures||MEASURES[a.id]||[]}
 recordVitals(keys){
  const log=this.state.vitalLog,t=this.state.interactions;
  keys.forEach(k=>{if(this.state.vitals[k]==null)return;(log[k]=log[k]||[]).push({t,v:this.state.vitals[k]})});
 }
 measuredKeys(){return Object.keys(this.state.vitalLog)}
 perform(id){
  const a=this.allActions().find(x=>x.id===id);
  if(!a||this.didAction(id))return {ok:false,message:'הפעולה כבר בוצעה.'};
  if((a.requires||[]).some(x=>!this.hasFact(x)))return {ok:false,message:'עוד חסר מידע כדי לעשות את זה. מה צריך לבדוק או לשאול קודם?'};
  this.state.actions.push(id);this.state.history.push(['a',id]);this.state.interactions++;
  this.addFacts(a.reveals);this.applyScore(a.score);this.applyVitals(a.vitals);
  const keys=this.measuresOf(a);if(keys.length)this.recordVitals(keys);
  if(a.critical&&!this.state.criticalErrors.includes(id))this.state.criticalErrors.push(id);
  this.state.log.push({kind:a.critical?'bad':'action',text:a.result||a.label});
  this.processEvents();
  return {ok:true,message:a.result||'בוצע.',critical:!!a.critical};
 }
 ask(id){
  const q=this.scenario.anamnesis.find(x=>x.id===id);
  if(!q||this.asked(id)||!this.isQuestionAvailable(q))return {ok:false,message:'השאלה לא זמינה כרגע.'};
  this.state.questions.push(id);this.state.history.push(['q',id]);this.state.interactions++;
  this.addFacts(q.reveals);this.applyScore(q.score);
  (q.unlocks||[]).forEach(x=>{if(!this.state.unlocked.includes(x))this.state.unlocked.push(x)});
  this.state.log.push({kind:(q.score?.points||0)<0?'bad':'answer',text:q.answer});
  this.processEvents();
  return {ok:true,message:q.answer,feedback:q.feedback};
 }
 // מדידה חוזרת של כל המדדים שכבר נמדדו. נחשבת פעולה, כי גם בשטח היא לוקחת זמן.
 remeasure(){
  const keys=this.measuredKeys();if(!keys.length)return {ok:false,message:'עוד לא נמדדו מדדים. מתחילים בהערכה ראשונית.'};
  this.state.history.push(['m']);this.state.interactions++;this.recordVitals(keys);
  const line=keys.map(k=>`${VITAL_LABELS[k]||k}: ${this.state.vitals[k]}`).join(' · ');
  this.state.log.push({kind:'action',text:'מדידה חוזרת: '+line});
  this.processEvents();
  return {ok:true,message:'מדידה חוזרת: '+line};
 }
 isQuestionAvailable(q){return !this.asked(q.id)&&(!q.condition||this.evaluate(q.condition))}
 processEvents(){
  for(const e of this.scenario.events||[]){
   if(!this.state.events.includes(e.id)&&this.evaluate(e.trigger)){
    this.state.events.push(e.id);this.addFacts(e.change?.addFacts);
    if(e.change?.consciousness)this.state.patient.consciousness=e.change.consciousness;
    this.applyVitals(e.change?.vitals);
    this.state.log.push({kind:'event',text:e.feedback});
   }
  }
 }
 answerReasoning(key,choice){this.state.reasoning[key]=choice}
 replay(history){
  history.forEach(([kind,id])=>{if(kind==='a')this.perform(id);else if(kind==='q')this.ask(id);else if(kind==='m')this.remeasure()});
 }
 getReport(){
  const all=this.allActions(),required=all.filter(a=>a.importance==='חובה'),missed=required.filter(a=>!this.didAction(a.id)),missedFacts=(this.scenario.expectedPath.requiredFacts||[]).filter(f=>!this.hasFact(f));
  const unnecessary=[...all.filter(a=>this.didAction(a.id)&&(a.importance==='מיותרת'||(a.score?.points||0)<0)),...this.scenario.anamnesis.filter(q=>this.asked(q.id)&&q.importance==='לא רלוונטית')];
  const followups=this.scenario.anamnesis.filter(q=>q.condition&&!this.asked(q.id)&&this.evaluate(q.condition));
  const missedCritical=missed.filter(a=>a.criticalOmission).map(a=>a.id),critical=[...new Set([...this.state.criticalErrors,...missedCritical])];
  const reasoning=this.scenario.reasoning||{},rKeys=Object.keys(reasoning);
  const score=Object.assign({},this.state.score);score.reasoning=rKeys.filter(k=>this.state.reasoning[k]===0).length*REASONING_POINTS;
  const maxBy=Object.assign({},this.scenario.scoring.max,{reasoning:rKeys.length*REASONING_POINTS});
  const earned=Object.values(score).reduce((a,b)=>a+Math.max(0,b),0),max=Object.values(maxBy).reduce((a,b)=>a+b,0);
  let percent=Math.max(0,Math.min(100,Math.round(earned/max*100-critical.length*8)));
  const capped=critical.length>0&&percent>CRITICAL_CAP;if(capped)percent=CRITICAL_CAP;
  return {percent,capped,missed,missedFacts,unnecessary,followups,critical,criticalActions:this.state.criticalErrors.slice(),missedCritical,score,max:maxBy};
 }
}
window.AnamnesisEngine=AnamnesisEngine;
window.VITAL_LABELS=VITAL_LABELS;
window.CRITICAL_CAP=CRITICAL_CAP;
})();
