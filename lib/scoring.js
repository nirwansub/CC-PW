import {CAPS,WEIGHTS,ROLES,questionsFor,PILOT} from './assessment.js';
export function validateAnswers(stage,answers,{partial=false}={}){
 const qs=questionsFor(stage);if(!qs)throw new Error('Tahap tidak valid');
 if(!answers||typeof answers!=='object'||Array.isArray(answers))throw new Error('Jawaban tidak valid');
 const clean={};for(const q of qs){const a=answers[q.id];if(a===undefined||a===null||a===''){if(!partial)throw new Error('Semua pertanyaan wajib dijawab');continue;}
 if(q.type==='sjt'){if(!Number.isInteger(a)||a<0||a>=q.options.length)throw new Error('Pilihan jawaban tidak valid');clean[q.id]=a;}
 else{if(typeof a!=='string'||a.length>q.maxLength)throw new Error('Esai terlalu panjang atau tidak valid');if(!a.trim()&&!partial)throw new Error('Esai wajib diisi');clean[q.id]=a.trim();}}
 return clean;
}
export function aggregate(stage,answers,grades=[]){
 const totals={}; const pending=[];const qs=questionsFor(stage);
 const add=(cap,points)=>{totals[cap]??={points:0,max:0,observations:0};totals[cap].max+=4;totals[cap].points+=points;totals[cap].observations++;};
 for(const q of qs){const a=answers[q.id];if(q.type==='sjt'){const caps=[...new Set(q.options.flatMap(o=>Object.keys(o.signals)))];for(const cap of caps)add(cap,q.options[a]?.signals[cap]??0);}
 else{const g=grades.find(x=>x.id===q.id);if(!a?.trim()){for(const c of q.criteria)add(c.cap,0);continue;}
 if(!g){pending.push(q.id);continue;}for(const c of q.criteria){const evidence=g.criteria.find(x=>x.cap===c.cap);if(!evidence){pending.push(q.id);break;}add(c.cap,evidence.score);}}}
 const capability=Object.entries(totals).map(([key,v])=>({key,label:CAPS[key],score:Math.round(v.points/v.max*100),observations:v.observations}));
 const roleFits=Object.keys(ROLES).map(role=>{let points=0,weight=0,covered=0;const maxWeight=Object.values(WEIGHTS[role]).reduce((a,b)=>a+b,0);for(const [cap,w]of Object.entries(WEIGHTS[role])){const c=capability.find(x=>x.key===cap);if(c){points+=c.score*w;weight+=w;covered+=w;}}
 return{roleKey:role,...ROLES[role],score:weight?Math.round(points/weight):0,coverage:Math.round(covered/maxWeight*100)};}).sort((a,b)=>b.score-a.score||a.roleKey.localeCompare(b.roleKey));
 return{capability,roleFits,pending,complete:pending.length===0};
}
export function routing(result,preferences=[]){if(!result.complete)return{shortlist:[],thirdFlag:null,status:'pending'};const top=result.roleFits.slice(0,2).map(x=>({...x,applied:preferences.includes(x.roleKey)}));const third=result.roleFits[2];return{shortlist:top,thirdFlag:third&&top[1].score-third.score<=PILOT.thirdGap?{...third,applied:preferences.includes(third.roleKey),reason:'Selisih dengan posisi kedua ≤ 3 poin; validasi bila diperlukan.'}:null,status:'ready'};}
export function followupRoles(record){return record.materialSelection?.releasedAt?(record.materialSelection.roles||[]):[];}
export function candidateSummary(record){const pre=record.stages?.pre;const result=pre?.result;const route=result&&pre.status==='submitted'?routing(result,record.preferences):{shortlist:[],thirdFlag:null,status:'pending'};const stages=Object.fromEntries(Object.entries(record.stages||{}).filter(([k])=>!k.startsWith('practical:')).map(([k,s])=>[k,{status:s.status,expiresAt:s.expiresAt,submittedAt:s.submittedAt,grading:s.grading?.status,terminationReason:s.terminationReason}]));return{version:record.version,candidateName:record.candidateName,currentTeam:record.currentTeam||'',accessCode:record.accessCode||'',preferences:record.preferences,profileStatus:record.profileStatus||'not_set',stages,shortlist:route.shortlist.map(x=>({roleKey:x.roleKey,team:x.team,role:x.role,applied:x.applied})),materialRoles:pre?.status==='submitted'?followupRoles(record).map(k=>({roleKey:k,...ROLES[k],applied:record.preferences.includes(k)})):[],materialsReleased:!!record.materialSelection?.releasedAt,routingStatus:route.status};}
export function finalRoleResults(record){const pre=record.stages?.pre?.result;if(!pre?.complete||record.stages.pre.status!=='submitted')return[];return followupRoles(record).map(role=>{const f=pre.roleFits.find(x=>x.roleKey===role),stage=record.stages[`post:${role}`];const post=stage?.result?.complete&&stage.status==='submitted'?stage.result.roleFits.find(x=>x.roleKey===role)?.score:null;return{...f,applied:record.preferences.includes(role),pre:f.score,post,gain:post===null?null:post-f.score,practicalStatus:'external'};});}
