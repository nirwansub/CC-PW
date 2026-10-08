import {ROLES} from './assessment.js';
import {baselineReady} from './scoring.js';
const finished=s=>['submitted','terminated'].includes(s?.status)&&s.grading?.status==='complete'&&s.result?.complete;
const score=(s,role)=>{if(!finished(s))return null;const value=s.result.roleFits?.find(f=>f.roleKey===role)?.score;return Number.isFinite(value)?value:null;};
export function recommendationCandidate(r,role){
 if(!ROLES[role]||!r.materialSelection?.releasedAt||!r.materialSelection.roles?.includes(role)||!r.postTestAccess?.enabled||!baselineReady(r))return null;
 const stage=r.stages?.['post:'+role],post=score(stage,role);if(post===null)return null;
 const pre=score(r.stages?.pre,role),comparison=score(r.stages?.comparison,role),values=[pre,comparison].filter(Number.isFinite);if(!values.length)return null;
 const baseline=values.reduce((a,b)=>a+b,0)/values.length,final=post*.5+baseline*.5;
 return {token:r.token,name:r.candidateName,code:r.accessCode||'',team:r.currentTeam||'',pre,comparison,post,baseline,final,answered:stage.result.answeredCount??Object.keys(stage.answers||{}).length,total:stage.result.totalQuestions??6,reviewRequired:!!stage.reviewRequired||!!r.stages?.comparison?.reviewRequired,bankVersion:stage.questionBankVersion||'legacy'};
}
export function positionRecommendations(records,selection={choices:{}}){
 return Object.entries(ROLES).map(([roleKey,role])=>{
  const candidates=records.map(r=>recommendationCandidate(r,roleKey)).filter(Boolean).sort((a,b)=>b.final-a.final||b.post-a.post||b.baseline-a.baseline||String(a.name).localeCompare(String(b.name),'id')||a.code.localeCompare(b.code));
  return {roleKey,label:(roleKey.startsWith('cc-')?'CC':'PW')+' · '+role.role,team:role.team,candidates:candidates.map((r,i)=>{const value=selection.choices?.[roleKey]?.[r.token];return{...r,rank:i+1,manual:typeof value==='boolean'?value:null,selected:typeof value==='boolean'?value:i<5};})};
 });
}
