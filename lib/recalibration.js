import crypto from 'node:crypto';
import {read,write,mutate,Conflict} from './storage.js';
import {questionsFor} from './assessment.js';
import {gradeEssays,validateGrades,GRADING_VERSION,DEFAULT_GRADING_MODEL} from './grading.js';
import {fingerprint,gradeChanges} from './evidence-audit.js';
import {aggregate} from './scoring.js';
export const CALIBRATION_BATCH='humanis-20261005';
const fail=(message,status=409)=>Object.assign(new Error(message),{status});
const ids=()=>questionsFor('comparison').map(q=>q.id);
export function eligibleForCalibration(s){return !!s&&['submitted','terminated'].includes(s.status)&&ids().every(id=>typeof s.answers?.[id]==='string'&&s.answers[id].trim());}
const current=s=>s?.grading?.calibrationBatch===CALIBRATION_BATCH&&s?.grading?.gradingVersion===GRADING_VERSION&&s?.grading?.model===DEFAULT_GRADING_MODEL&&s?.grading?.reasoning?.effort==='medium';
const summary=j=>({batchId:CALIBRATION_BATCH,status:j.status,completed:j.grades?.length||0,total:10,model:DEFAULT_GRADING_MODEL,gradingVersion:GRADING_VERSION});
export async function recalibrateComparison(token,phase,cfg,{chunkSize=2,fetcher=fetch}={}){
 if(!/^[A-Za-z0-9_-]{24,64}$/.test(token||''))throw fail('Kode tidak valid',400);
 if(!['step','apply','status'].includes(phase)||![1,2].includes(chunkSize))throw fail('Aksi kalibrasi tidak valid',400);
 const rp='assessments/v2/'+token+'.json',jp='calibrations/'+CALIBRATION_BATCH+'/'+token+'.json';
 let r=(await read(rp))?.value,s=r?.stages?.comparison;
 if(!eligibleForCalibration(s))throw fail('Lewati: pendalaman belum dikirim atau 10 jawaban belum lengkap');
 if(current(s))return{...summary({status:'applied',grades:s.grades}),alreadyApplied:true};
 if(phase!=='status'&&cfg.model!==DEFAULT_GRADING_MODEL)throw fail('Model aktif berbeda dari model kalibrasi');
 if(s.grading?.status==='running'&&s.grading.expiresAt>Date.now()||s.evidenceJob?.expiresAt>Date.now())throw fail('Penilaian lain sedang berjalan');
 let job=(await read(jp))?.value;
 if(!job){
  if(phase==='status')return summary({status:'not_started',grades:[]});
  if(phase==='apply')throw fail('Kalibrasi belum lengkap');
  const fresh={batchId:CALIBRATION_BATCH,model:DEFAULT_GRADING_MODEL,gradingVersion:GRADING_VERSION,sourceFingerprint:fingerprint(s),answers:structuredClone(s.answers),status:'pending',grades:[],chunks:[],createdAt:Date.now()};
  try{await write(jp,fresh,null,{create:true});}catch(e){if(!(e instanceof Conflict))throw e;}
  job=(await read(jp)).value;
 }
 if(job.gradingVersion!==GRADING_VERSION||job.model!==DEFAULT_GRADING_MODEL)throw fail('Versi kalibrasi berubah');
 if(job.sourceFingerprint!==fingerprint(s))throw fail('Jawaban atau nilai sumber berubah; kalibrasi tidak diterapkan');
 if(phase==='status')return summary(job);
 if(phase==='apply'){
  if(job.status!=='ready'||job.grades.length!==10)throw fail('Kalibrasi belum lengkap');
  validateGrades(questionsFor('comparison'),{grades:job.grades},s.answers,{requireDetails:true});
  const result=aggregate('comparison',s.answers,job.grades);if(!result.complete)throw fail('Hasil kalibrasi belum lengkap');
  const applied=await mutate(rp,record=>{
   const stage=record.stages.comparison;
   if(current(stage))return{alreadyApplied:true};
   if(fingerprint(stage)!==job.sourceFingerprint)throw fail('Jawaban atau nilai berubah; penerapan dibatalkan');
   if(stage.grading?.status==='running'&&stage.grading.expiresAt>Date.now()||stage.evidenceJob?.expiresAt>Date.now())throw fail('Penilaian lain sedang berjalan');
   const at=Date.now();stage.reviewHistory??=[];
   stage.reviewHistory.push({at,method:'model_calibration',batchId:CALIBRATION_BATCH,reason:'Kalibrasi seluruh pendalaman lengkap ke GPT-6.1 Sol medium atas instruksi penyelenggara, 5 Oktober 2026',previousGrades:structuredClone(stage.grades||[]),previousGrading:structuredClone(stage.grading||{}),previousResult:structuredClone(stage.result||null),previousReviewRequired:stage.reviewRequired,previousEvidenceAudit:structuredClone(stage.evidenceAudit||null),previousEvidenceRevision:structuredClone(stage.evidenceRevision||null),sourceFingerprint:job.sourceFingerprint,changes:gradeChanges(stage.grades,job.grades)});
   stage.grades=structuredClone(job.grades);stage.result=result;delete stage.evidenceAudit;delete stage.evidenceRevision;delete stage.evidenceAuditError;
   const reviewRequired=job.grades.some(g=>g.flags.length||g.criteria.some(c=>c.confidence<.65));
   stage.grading={status:'complete',method:'model_calibration',calibrationBatch:CALIBRATION_BATCH,model:DEFAULT_GRADING_MODEL,reasoning:{effort:'medium'},gradingVersion:GRADING_VERSION,gradedAt:at,version:job.chunks[0]?.version,reviewRequired,usage:job.chunks.reduce((sum,c)=>{for(const k of ['input_tokens','output_tokens','total_tokens'])sum[k]=(sum[k]||0)+(c.usage?.[k]||0);return sum;},{})};
   stage.reviewRequired=!!stage.reviewRequired||reviewRequired||stage.status==='terminated'||!!stage.securityEvents?.some(e=>e.kind==='warning');
   return{alreadyApplied:false};
  });
  await mutate(jp,j=>{j.status='applied';j.appliedAt=Date.now();delete j.lease;});
  return{...summary({...job,status:'applied'}),...applied};
 }
 let work,lease=crypto.randomUUID();
 await mutate(jp,j=>{
  if(j.status==='ready'||j.status==='applied'){work=null;return;}
  if(j.lease?.expiresAt>Date.now())throw fail('Kalibrasi peserta ini sedang berjalan');
  const remaining=ids().filter(id=>!j.grades.some(g=>g.id===id));
  const selected=remaining.slice(0,chunkSize);if(!selected.length)throw fail('Status kalibrasi tidak konsisten');
  j.lease={id:lease,expiresAt:Date.now()+80000,questionIds:selected};j.status='running';
  work=Object.fromEntries(selected.map(id=>[id,j.answers[id]]));
 });
 if(!work)return summary((await read(jp)).value);
 try{
  const evaluated=await gradeEssays('comparison',work,cfg.key,DEFAULT_GRADING_MODEL,fetcher);
  if(evaluated.model!==DEFAULT_GRADING_MODEL||evaluated.reasoning?.effort!=='medium')throw fail('Model hasil tidak sesuai');
  await mutate(jp,j=>{
   if(j.lease?.id!==lease)throw fail('Pekerjaan kalibrasi sudah diganti');
   const expected=j.lease.questionIds;
   if(evaluated.grades.length!==expected.length||evaluated.grades.some(g=>!expected.includes(g.id)))throw fail('Hasil potongan tidak lengkap');
   j.grades=[...j.grades.filter(g=>!expected.includes(g.id)),...evaluated.grades];
   j.chunks.push({questionIds:expected,usage:evaluated.usage,version:evaluated.version,at:Date.now()});
   j.status=j.grades.length===10?'ready':'pending';j.updatedAt=Date.now();delete j.lease;delete j.error;
  });
 }catch(e){await mutate(jp,j=>{if(j.lease?.id===lease){j.status='pending';j.error={code:e.code||'CALIBRATION_FAILED',at:Date.now()};delete j.lease;}});throw e;}
 return summary((await read(jp)).value);
}
