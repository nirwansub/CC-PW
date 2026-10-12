import test from 'node:test';import assert from 'node:assert/strict';
import handler from '../api/index.js';import {reset} from './memory-blob.js';import {read,write} from '../lib/storage.js';
import {PRE_POST_DEADLINE_AT,prePostClosed,blockedAfterDeadline} from '../lib/access-deadline.js';
test('internal assessment has no scheduled cutoff, including after the old October 3 deadline and future dates',()=>{
 assert.equal(PRE_POST_DEADLINE_AT,null);
 for(const date of ['2026-10-03T09:00:00+07:00','2026-10-12T17:45:00+07:00','2030-01-01T00:00:00+07:00']){
  const now=Date.parse(date);assert.equal(prePostClosed(now),false);
  for(const action of ['profile','comparison-resume','leadership-resume','candidate-materials','material-pdf','materials','materials-read'])assert.equal(blockedAfterDeadline(action,'',now),false);
  for(const stage of ['comparison','leadership'])for(const action of ['start','quiz','save','submit','violation','evaluate','security-warning','security-resume','security-timeout'])assert.equal(blockedAfterDeadline(action,stage,now),false);
 }
});
test('reopened live handler allows pendalaman and profile after old cutoff, preserves existing answers and retains prerequisites',async()=>{
 reset();const realNow=Date.now;Date.now=()=>Date.parse('2026-10-12T17:45:00+07:00');let cookie='';process.env.ADMIN_PASSWORD='deadline-test-only';process.env.ADMIN_SECRET='deadline-secret-test-only';
 const api=async(action,data,params={})=>{const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',headers:{host:'localhost',...(cookie?{cookie}:{})},body:data},res={code:200,headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;}};await handler(req,res);return res;};
 try{
 cookie=(await api('admin-login',{password:process.env.ADMIN_PASSWORD})).headers['Set-Cookie'].split(';')[0];
 await write('settings/v3-operations.json',{postTestsLocked:true,comparisonEnabled:true,selfServeMaterials:true,materialsHeld:false});
 const inv=(await api('admin-invite',{candidateName:'QA internal reopened'})).value;
 assert.equal((await api('start',{token:inv.token,stage:'comparison',consent:true,identity:{name:inv.candidateName,contact:'qa@example.invalid'},preferences:['pw-curator']})).code,200);
 assert.equal((await api('save',{token:inv.token,stage:'comparison',answers:{cmp01:'Jawaban tersimpan untuk tes internal'},revision:1})).code,200);
 const before=(await read('assessments/v2/'+inv.token+'.json')).value;
 const state=(await api('invite',null,{token:inv.token})).value;assert.equal(state.prePostClosed,false);assert.equal(state.prePostDeadlineAt,null);
 assert.equal((await api('quiz',null,{token:inv.token,stage:'comparison'})).code,200);
 assert.deepEqual((await read('assessments/v2/'+inv.token+'.json')).value,before);
 assert.equal((await api('candidate-materials',{token:inv.token,roles:['pw-curator']})).code,409);
 assert.equal((await api('start',{token:inv.token,stage:'leadership'})).code,403);
 assert.equal((await api('profile',{token:inv.token,profile:{talents:'Organisasi acara'}})).code,409);
 const r=structuredClone(before);r.stages.comparison.status='submitted';r.stages.comparison.expiresAt=null;r.stages.comparison.submittedAt=Date.now();await write('assessments/v2/'+inv.token+'.json',r);
 assert.equal((await api('profile',{token:inv.token,profile:{talents:'Organisasi acara'}})).code,200);
 assert.equal((await read('assessments/v2/'+inv.token+'.json')).value.stages.comparison.answers.cmp01,before.stages.comparison.answers.cmp01);
 assert.equal((await api('health')).value.prePostClosed,false);
 }finally{Date.now=realNow;}
});
