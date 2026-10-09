import {postTiming} from './post-schedule.js';
export function recoverPost(r,{stage,incidentId,minutes=5},now=Date.now()){
 if(!stage?.startsWith('post:')||minutes!==5||!r.materialSelection?.roles?.includes(stage.slice(5)))throw Object.assign(new Error('Modul pemulihan tidak sesuai pilihan peserta.'),{status:400});
 const s=r.stages?.[stage];if(!s)throw Object.assign(new Error('Modul belum pernah dikerjakan.'),{status:409});
 if(s.recoveryHistory?.some(h=>h.incidentId===incidentId))return {alreadyRecovered:true,status:s.status,answersPreserved:Object.keys(s.answers||{}).length};
 if(s.status==='active')throw Object.assign(new Error('Modul ini masih aktif. Tunggu selesai sebelum pemulihan.'),{status:409});
 if(!['submitted','terminated'].includes(s.status))throw Object.assign(new Error('Status modul tidak dapat dipulihkan.'),{status:409});
 if(s.grading?.status==='running'&&s.grading.expiresAt>now)throw Object.assign(new Error('Penilaian sedang berjalan. Coba kembali setelah selesai.'),{status:409});
 const previous=structuredClone({...s,recoveryHistory:undefined});s.recoveryHistory??=[];s.recoveryHistory.push({incidentId,at:now,reason:'power_outage_20261008',previous});
 s.status='paused';s.remainingMs=minutes*60000;s.expiresAt=null;s.recoveredAt=now;s.reviewRequired=true;
 for(const key of ['submittedAt','terminationReason','autoSubmitReason','result','grading','grades'])delete s[key];
 for(const e of s.securityEvents||[])if(e.kind==='warning'&&!e.confirmedAt){e.confirmedAt=now;e.recoveryIncidentId=incidentId;}
 return {alreadyRecovered:false,status:s.status,answersPreserved:Object.keys(s.answers||{}).length};
}

export function recoverEmptyPost(r,{stage,incidentId},now=Date.now()){
 const s=r.stages?.[stage];
 if(!s?.recoveryHistory?.some(h=>h.incidentId===incidentId)&&Object.values(s?.answers||{}).some(a=>a!==null&&a!==undefined&&String(a).trim()))throw Object.assign(new Error('Pemulihan susulan ini hanya untuk modul dengan 0 jawaban.'),{status:409});
 const result=recoverPost(r,{stage,incidentId,minutes:5},now),minutes=postTiming(r).testMinutes;
 if(!result.alreadyRecovered){s.remainingMs=minutes*60000;s.recoveryHistory.at(-1).reason='empty_post_test_susulan';}
 return {...result,minutes};
}
