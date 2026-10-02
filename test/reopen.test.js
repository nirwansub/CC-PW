import test from 'node:test';import assert from 'node:assert/strict';
import {reset} from './memory-blob.js';import {read,write} from '../lib/storage.js';
import {reopenInvitations} from '../scripts/reopen-invitations.mjs';
test('authorized reload reopens unused codes, preserves evidence and filters, is idempotent and keeps post locked',async()=>{
 reset();process.env.VERCEL_ENV='production';process.env.ADMIN_SECRET='test-reload-only';
 await write('settings/v3-operations.json',{postTestsLocked:true});
 const fixtures=[{token:'unused',accessCode:'123456',expiresAt:1,stages:{},adminVisibility:{hidden:true}},{token:'started',accessCode:'234567',expiresAt:1,stages:{comparison:{status:'active',answers:{cmp01:'Saved evidence'}}}}];
 for(const r of fixtures){await write('assessments/v2/'+r.token+'.json',r);await write('access/v2-codes/'+r.accessCode+'.json',{token:r.token});}
 await reopenInvitations();
 const reopened=(await read('assessments/v2/unused.json')).value;
 assert.ok(reopened.expiresAt>Date.now()+29*86400000);assert.deepEqual(reopened.stages,{});assert.deepEqual(reopened.adminVisibility,{hidden:true});assert.equal(reopened.invitationAccessHistory[0].previousExpiresAt,1);
 assert.deepEqual((await read('assessments/v2/started.json')).value,fixtures[1]);
 await reopenInvitations();assert.deepEqual((await read('assessments/v2/unused.json')).value,reopened);
 assert.equal((await read('settings/v3-operations.json')).value.postTestsLocked,true);
 assert.deepEqual((await read('settings/invitation-reopen-20261002.json')).value.counts,{records:2,unused:1,expired:1,extended:1,verified:2});
 delete process.env.VERCEL_ENV;
});
