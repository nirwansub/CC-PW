import {ROLES,DURATION} from './assessment.js';
const fail=message=>Object.assign(new Error(message),{status:400});
const selected=r=>r.materialSelection?.releasedAt?r.materialSelection.roles||[]:[];
const sameRoles=(a,b)=>a.length===b.length&&a.every(k=>b.includes(k));
export function validatePostSchedule(r,input){
 const roles=selected(r);
 if(!roles.length)throw fail('Materi peserta belum diterbitkan.');
 if(!input||!Array.isArray(input.slots)||input.slots.length!==roles.length)throw fail('Jadwal wajib memuat setiap modul pilihan tepat satu kali.');
 const seen=new Set();
 const slots=input.slots.map(s=>{
  if(!s||!roles.includes(s.roleKey)||seen.has(s.roleKey))throw fail('Modul jadwal tidak sesuai pilihan peserta atau berulang.');seen.add(s.roleKey);
  if(typeof s.cohort!=='string'||!s.cohort.trim()||s.cohort.length>80)throw fail('Isi nama kloter.');
  if(!Number.isInteger(s.computer)||s.computer<1||s.computer>999)throw fail('Nomor komputer tidak valid.');
  if(!Number.isFinite(s.startAt)||!Number.isFinite(s.cohortStartAt)||s.startAt<s.cohortStartAt||(s.startAt-s.cohortStartAt)%600000!==0)throw fail('Waktu modul harus mengikuti slot 10 menit sejak awal kloter.');
  const startAt=s.startAt,endAt=startAt+DURATION.post*60000;
  return {roleKey:s.roleKey,cohort:s.cohort.trim(),computer:s.computer,cohortStartAt:s.cohortStartAt,startAt,endAt,turnoverEndAt:startAt+600000};
 }).sort((a,b)=>a.startAt-b.startAt);
 if(slots.some((s,i)=>i&&s.startAt<slots[i-1].turnoverEndAt))throw fail('Jadwal modul peserta saling bertumpuk.');
 if(input.location!==undefined&&(typeof input.location!=='string'||input.location.length>200))throw fail('Lokasi tidak valid.');
 if(input.temporary!==undefined&&typeof input.temporary!=='boolean')throw fail('Status jadwal sementara tidak valid.');
 return {temporary:input.temporary===true,roles:[...roles],location:input.location?.trim()||'',slots,publishedAt:Date.now()};
}
export function participantPostInfo(r){
 const roles=selected(r),s=r.postSchedule;
 const published=!!s?.publishedAt&&sameRoles(s.roles||[],roles);
 return {candidateName:r.candidateName,modules:roles.map(k=>({roleKey:k,label:(k.startsWith('cc-')?'CC':'PW')+' · '+ROLES[k].role})),testMinutes:DURATION.post,turnoverMinutes:1,
  schedule:published?{published:true,temporary:s.temporary===true,location:s.location,publishedAt:s.publishedAt,slots:s.slots.map(slot=>({...slot,label:(slot.roleKey.startsWith('cc-')?'CC':'PW')+' · '+ROLES[slot.roleKey].role,startMinute:(slot.startAt-slot.cohortStartAt)/60000,endMinute:(slot.endAt-slot.cohortStartAt)/60000}))}:{published:false}};
}
