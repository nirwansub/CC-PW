import {ROLES,DURATION} from './assessment.js';
const fail=message=>Object.assign(new Error(message),{status:400});
const selected=r=>r.materialSelection?.releasedAt?r.materialSelection.roles||[]:[];
const sameRoles=(a,b)=>a.length===b.length&&a.every(k=>b.includes(k));
export const POST_TIMING_VERSION='20261008-shift-duration';
export function postTiming(r){const count=selected(r).length;return count>=1&&count<=2?{testMinutes:13,turnoverMinutes:2}:{testMinutes:DURATION.post,turnoverMinutes:1};}
export function validatePostSchedule(r,input){
 const roles=selected(r);
 const timing=postTiming(r),slotMs=(timing.testMinutes+timing.turnoverMinutes)*60000;
 if(!roles.length)throw fail('Materi peserta belum diterbitkan.');
 if(!input||!Array.isArray(input.slots)||input.slots.length!==roles.length)throw fail('Jadwal wajib memuat setiap modul pilihan tepat satu kali.');
 const seen=new Set();
 const slots=input.slots.map(s=>{
  if(!s||!roles.includes(s.roleKey)||seen.has(s.roleKey))throw fail('Modul jadwal tidak sesuai pilihan peserta atau berulang.');seen.add(s.roleKey);
  if(typeof s.cohort!=='string'||!s.cohort.trim()||s.cohort.length>80)throw fail('Isi nama kloter.');
  if(!Number.isInteger(s.computer)||s.computer<1||s.computer>999)throw fail('Nomor komputer tidak valid.');
  if(!Number.isFinite(s.startAt)||!Number.isFinite(s.cohortStartAt)||s.startAt<s.cohortStartAt||(s.startAt-s.cohortStartAt)%slotMs!==0)throw fail('Waktu modul harus mengikuti slot '+slotMs/60000+' menit sejak awal kloter.');
  const startAt=s.startAt,endAt=startAt+timing.testMinutes*60000;
  return {roleKey:s.roleKey,cohort:s.cohort.trim(),computer:s.computer,cohortStartAt:s.cohortStartAt,startAt,endAt,turnoverEndAt:startAt+slotMs};
 }).sort((a,b)=>a.startAt-b.startAt);
 if(slots.some((s,i)=>i&&s.startAt<slots[i-1].turnoverEndAt))throw fail('Jadwal modul peserta saling bertumpuk.');
 if(input.location!==undefined&&(typeof input.location!=='string'||input.location.length>200))throw fail('Lokasi tidak valid.');
 if(input.temporary!==undefined&&typeof input.temporary!=='boolean')throw fail('Status jadwal sementara tidak valid.');
 if(input.briefingAt!==undefined&&(!Number.isFinite(input.briefingAt)||input.briefingAt>slots[0].startAt||slots[0].startAt-input.briefingAt>3600000))throw fail('Waktu briefing tidak valid.');
 return {temporary:input.temporary===true,roles:[...roles],...timing,timingVersion:POST_TIMING_VERSION,briefingAt:input.briefingAt??null,location:input.location?.trim()||'',slots,publishedAt:Date.now()};
}
export function participantPostInfo(r){
 const roles=selected(r),s=r.postSchedule;
 const timing=postTiming(r),published=!!s?.publishedAt&&sameRoles(s.roles||[],roles)&&s.slots.every(slot=>slot.endAt-slot.startAt===timing.testMinutes*60000&&slot.turnoverEndAt-slot.endAt===timing.turnoverMinutes*60000);
 return {candidateName:r.candidateName,modules:roles.map(k=>({roleKey:k,label:(k.startsWith('cc-')?'CC':'PW')+' · '+ROLES[k].role})),...timing,notice:r.postScheduleNotice||'',
  schedule:published?{published:true,temporary:s.temporary===true,location:s.location,briefingAt:s.briefingAt,publishedAt:s.publishedAt,slots:s.slots.map(slot=>({...slot,label:(slot.roleKey.startsWith('cc-')?'CC':'PW')+' · '+ROLES[slot.roleKey].role,startMinute:(slot.startAt-slot.cohortStartAt)/60000,endMinute:(slot.endAt-slot.cohortStartAt)/60000}))}:{published:false}};
}
