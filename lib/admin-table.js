import {participantPhoto} from './participant-photo.js';
import {ROLES,CAPS} from './assessment.js';
import {LEADER_CAPS} from './leadership.js';
import {comparisonReady} from './candidate-flow.js';

const fits=result=>Object.fromEntries((result?.roleFits||[]).map(x=>[x.roleKey,x.score]));
const caps=result=>Object.fromEntries((result?.capability||[]).map(x=>[x.key||x.cap,x.score]));
const snapshot=(result,grading,at)=>result?{roleScores:fits(result),capabilityScores:caps(result),model:grading?.model||grading?.method||'',at:grading?.gradedAt||at||null}:null;
const history=s=>[
 ...(s?.scoreHistory||[]).map(h=>({...h,source:'score'})),
 ...(s?.reviewHistory||[]).map(h=>({...h,source:'review'})),
 ...(s?.resumeHistory||[]).filter(h=>h.previous?.result).map(h=>({at:h.at,previousResult:h.previous.result,previousGrading:h.previous.grading,source:'resume'}))
].filter(h=>h.previousResult).sort((a,b)=>(a.at||0)-(b.at||0));
const earliest=(s,stage)=>history(s).find(h=>stage==='comparison'?h.previousResult?.comparable===true:h.previousGrading?.status==='complete'&&h.previousResult?.complete);
const priorCalibration=s=>[...(s?.reviewHistory||[])].reverse().find(h=>h.method==='model_calibration'&&h.previousResult);
export function tableParticipant(r){
 const pre=r.stages?.pre,comparison=r.stages?.comparison,leader=r.stages?.leadership;
 const selected=r.materialSelection?.roles||[];
 if(!comparisonReady(r)||!r.materialSelection?.releasedAt||!selected.length)return null;
 const preFirst=earliest(pre,'pre'),comparisonFirst=earliest(comparison,'comparison'),before=priorCalibration(comparison);
 const current=s=>s?.grading?.status==='complete'?snapshot(s.result,s.grading,s.submittedAt):null;
 const archived=h=>h?snapshot(h.previousResult,h.previousGrading,h.at):null;
 return {
  photo:participantPhoto(r),token:r.token,name:r.candidateName,team:r.currentTeam||'',code:r.accessCode||'',
  selected,preferences:r.preferences||[],recommended:(comparison.result?.roleFits||[]).filter(f=>f.score!==null).slice(0,2).map(f=>f.roleKey),
  selectedSource:r.materialSelection.source||'',materialsAt:r.materialSelection.releasedAt,
  preAnswers:Object.values(pre?.answers||{}).filter(x=>x!==null&&x!==undefined&&String(x).trim()).length,
  comparisonAnswers:Object.values(comparison?.answers||{}).filter(x=>x!==null&&x!==undefined&&String(x).trim()).length,
  calibrationAt:comparison?.grading?.calibrationBatch?comparison.grading.gradedAt||null:null,
  reviewRequired:!!comparison?.reviewRequired,leader:!!r.leaderTrack?.enabled,
  leaderScore:leader?.grading?.status==='complete'?leader.result?.leadershipScore??null:null,
  leaderCapability:leader?.grading?.status==='complete'?caps(leader.result):{},
  postAccess:!!r.postTestAccess?.enabled,
  readCount:selected.filter(role=>r.materialRead?.[role]).length,
  scores:{final:current(comparison),beforeCalibration:archived(before),comparisonFirst:archived(comparisonFirst)||current(comparison),preCurrent:current(pre),preFirst:archived(preFirst)||current(pre)}
 };
}
export const tableColumns={roles:Object.keys(ROLES),capabilities:Object.keys(CAPS),capabilityLabels:CAPS,leaderCapabilities:Object.keys(LEADER_CAPS),leaderLabels:LEADER_CAPS};
