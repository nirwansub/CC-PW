import assert from 'node:assert/strict';
import {read,write,mutate,listValues} from '../lib/storage.js';
import {resolveCode} from '../lib/access.js';
const marker='settings/invitation-reopen-20261002.json';
export async function reopenInvitations(){
 if(process.env.VERCEL_ENV!=='production')return;
 if((await read(marker))?.value?.state==='complete')return;
 const now=Date.now(),until=now+30*86400000;
 const rows=await listValues('assessments/v2/',{paths:true});
 const counts={records:rows.length,unused:0,expired:0,extended:0,verified:0};
 for(const {pathname,value:r} of rows){
  if(!/^[1-9]\d{5}$/.test(r.accessCode||''))continue;
  const entry=(await read('access/v2-codes/'+r.accessCode+'.json'))?.value;
  assert.equal(entry?.token,r.token,'Invitation mapping must match before reopening');
  if(!Object.keys(r.stages||{}).length){
   counts.unused++;if(r.expiresAt<now)counts.expired++;
   await mutate(pathname,x=>{if(!Object.keys(x.stages||{}).length&&x.expiresAt<until){x.invitationAccessHistory??=[];x.invitationAccessHistory.push({at:now,reason:'authorized_reopen_20261002',previousExpiresAt:x.expiresAt});x.expiresAt=until;counts.extended++;}});
  }
  assert.equal(await resolveCode(r.accessCode,{headers:{'x-forwarded-for':'invitation-reopen-verification'}}),r.token);
  counts.verified++;
 }
 assert.equal((await read('settings/v3-operations.json'))?.value?.postTestsLocked,true,'Post-test must remain locked');
 await write(marker,{state:'complete',completedAt:Date.now(),until,counts});
 console.log('INVITATION_REOPEN_VERIFIED',JSON.stringify(counts));
}
