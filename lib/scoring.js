import {aggregateLeadership} from './leadership.js';
import {CAPS,WEIGHTS,ROLES,questionsFor,PILOT} from './assessment.js';
export const SCORING_VERSION='evidence-v3-2026-10-01';
export const SCORING_POLICY={version:SCORING_VERSION,missing:'unmeasured',mcq:'explicit_positive_signals_only',normalization:'attainable_item_max',evidenceMinimum:2,calibrated:false};
export function validateAnswers(stage,answers,{partial=false}={}){
 const qs=questionsFor(stage);if(!qs)throw new Error('Tahap tidak valid');
 if(!answers||typeof answers!=='object'||Array.isArray(answers))throw new Error('Jawaban tidak valid');
 const clean={};for(const q of qs){const a=answers[q.id];if(a===undefined||a===null||a===''){if(!partial)throw new Error('Semua pertanyaan wajib dijawab');continue;}
 if(q.type==='sjt'){if(!Number.isInteger(a)||a<0||a>=q.options.length)throw new Error('Pilihan jawaban tidak valid');clean[q.id]=a;}
 else{if(typeof a!=='string'||a.length>q.maxLength)throw new Error('Esai terlalu panjang atau tidak valid');if(!a.trim()&&!partial)throw new Error('Esai wajib diisi');clean[q.id]=a.trim();}}
 return clean;
}
export function aggregate(stage,answers,grades=[]){
 if(stage==='leadership')return aggregateLeadership(answers,grades);
 const qs=questionsFor(stage);if(!qs)throw new Error('Tahap tidak valid');
 const totals=Object.fromEntries(Object.keys(CAPS).map(cap=>[cap,{points:0,observations:0,possible:0,essayObservations:0,lowConfidence:0}]));
 const pending=[];let answeredCount=0;
 for(const q of qs){
  const caps=q.type==='sjt'?[...new Set(q.options.flatMap(o=>Object.keys(o.signals)))]:q.criteria.map(c=>c.cap);
  for(const cap of caps)totals[cap].possible++;
  const a=answers[q.id];
  if(q.type==='sjt'){
   if(!Number.isInteger(a)||!q.options[a])continue;answeredCount++;
   // An absent signal is unmeasured, not evidence of poor capability.
   for(const [cap,points]of Object.entries(q.options[a].signals)){
    const max=Math.max(...q.options.map(o=>o.signals[cap]??0));if(!max)continue;
    totals[cap].points+=points/max*100;totals[cap].observations++;
   }
  }else{
   if(!a?.trim())continue;answeredCount++;const g=grades.find(x=>x.id===q.id);
   if(!g){pending.push(q.id);continue;}
   for(const c of q.criteria){const evidence=g.criteria.find(x=>x.cap===c.cap);
    if(!evidence){pending.push(q.id);continue;}
    totals[c.cap].points+=evidence.score/4*100;totals[c.cap].observations++;totals[c.cap].essayObservations++;
    if(evidence.confidence<.65||g.flags?.length)totals[c.cap].lowConfidence++;
   }
  }
 }
 const capability=Object.entries(totals).map(([key,v])=>({key,label:CAPS[key],score:v.observations?Math.round(v.points/v.observations):null,observations:v.observations,possible:v.possible,essayObservations:v.essayObservations,coverage:v.possible?Math.round(v.observations/v.possible*100):0,lowConfidence:v.lowConfidence}));
 const roleFits=Object.keys(ROLES).map(role=>{
  let points=0,weight=0,covered=0;const maxWeight=Object.values(WEIGHTS[role]).reduce((a,b)=>a+b,0),missingCore=[];
  for(const [cap,w]of Object.entries(WEIGHTS[role])){
   const c=capability.find(x=>x.key===cap);if(c.score!==null){points+=c.score*w;weight+=w;}
   covered+=w*Math.min(c.observations/SCORING_POLICY.evidenceMinimum,1);
   if(w>=3&&(c.observations<2||!c.essayObservations))missingCore.push(cap);
  }
  const reviewRequired=capability.some(c=>c.lowConfidence&&WEIGHTS[role][c.key]>=3);
  const evidenceReady=missingCore.length===0&&weight===maxWeight&&!reviewRequired;
  return{roleKey:role,...ROLES[role],score:weight?Math.round(points/weight):null,coverage:Math.round(covered/maxWeight*100),missingCore,evidenceReady,evidenceStatus:!weight?'no_evidence':evidenceReady?'initial_evidence':'limited_evidence',reviewRequired};
 }).sort((a,b)=>(b.score??-1)-(a.score??-1)||a.roleKey.localeCompare(b.roleKey));
 return{scoringVersion:SCORING_VERSION,policy:SCORING_POLICY,capability,roleFits,pending:[...new Set(pending)],answeredCount,totalQuestions:qs.length,completion:Math.round(answeredCount/qs.length*100),complete:pending.length===0,comparable:stage==='comparison'&&answeredCount===qs.length&&pending.length===0,mcqLimitation:stage==='pre'?'Pilihan ganda memiliki sinyal 3–4; hasil diagnostik belum terkalibrasi dan perlu pendalaman pembanding.':null};
}
export function primaryAssessment(record){
 const comparison=record.stages?.comparison;
 if(['submitted','terminated'].includes(comparison?.status)&&comparison.result?.comparable)return{source:'comparison',label:'Pendalaman pembanding',result:comparison.result,reviewRequired:!!comparison.reviewRequired};
 return{source:'pre',label:'Pre-test diagnostik',result:record.stages?.pre?.result,reviewRequired:!!record.stages?.pre?.reviewRequired};
}
export function routing(result,preferences=[]){
 if(!result?.complete)return{shortlist:[],thirdFlag:null,status:'pending'};
 const fits=result.roleFits.filter(x=>x.score!==null);const top=fits.slice(0,2).map(x=>({...x,applied:preferences.includes(x.roleKey)}));const third=fits[2];
 return{shortlist:top,thirdFlag:third&&top[1]&&top[1].score-third.score<=PILOT.thirdGap?{...third,applied:preferences.includes(third.roleKey),reason:'Selisih dengan posisi kedua ≤ 3 poin; validasi bila diperlukan.'}:null,status:fits.length?'ready':'no_evidence',diagnostic:!result.comparable};
}
export function followupRoles(record){return record.materialSelection?.releasedAt?(record.materialSelection.roles||[]):[];}
export function candidateSummary(record){
 const pre=record.stages?.pre;const primary=primaryAssessment(record);const route=primary.result&&(['submitted','terminated'].includes(pre?.status)||primary.source==='comparison')?routing(primary.result,record.preferences):{shortlist:[],thirdFlag:null,status:'pending'};
 const stages=Object.fromEntries(Object.entries(record.stages||{}).filter(([k])=>!k.startsWith('practical:')).map(([k,s])=>[k,{status:s.status,expiresAt:s.expiresAt,submittedAt:s.submittedAt,grading:s.grading?.status,terminationReason:s.terminationReason,autoSubmitReason:s.autoSubmitReason,answeredCount:s.result?.answeredCount,totalQuestions:s.result?.totalQuestions,comparable:!!s.result?.comparable}]));
 return{version:record.version,candidateName:record.candidateName,currentTeam:record.currentTeam||'',accessCode:record.accessCode||'',preferences:record.preferences,profileStatus:record.profileStatus||'not_set',profile:record.profile||{},contact:record.identity?.contact||'',stages,assessmentSource:primary.source,shortlist:route.shortlist.map(x=>({roleKey:x.roleKey,team:x.team,role:x.role,applied:x.applied})),materialRoles:(['submitted','terminated'].includes(pre?.status)||primary.source==='comparison')?followupRoles(record).map(k=>({roleKey:k,...ROLES[k],applied:record.preferences.includes(k)})):[],materialsReleased:!!record.materialSelection?.releasedAt,postTestEnabled:!!record.postTestAccess?.enabled,routingStatus:route.status};
}
export function finalRoleResults(record){
 const primary=primaryAssessment(record),pre=primary.result;if(!pre?.complete)return[];
 return followupRoles(record).map(role=>{const f=pre.roleFits.find(x=>x.roleKey===role),stage=record.stages[`post:${role}`];const post=stage?.result?.complete&&['submitted','terminated'].includes(stage.status)?stage.result.roleFits.find(x=>x.roleKey===role)?.score:null;
 // Role-specific post-test and universal baseline are not equivalent forms.
 return{...f,applied:record.preferences.includes(role),pre:f.score,post,gain:null,baselineSource:primary.source,practicalStatus:'external'};});
}

export function baselineReady(record){const primary=primaryAssessment(record);return !!primary.result?.complete&&(primary.source==='comparison'||(!record.requiresComparison&&['submitted','terminated'].includes(record.stages?.pre?.status)));}
