import test from 'node:test';import assert from 'node:assert/strict';
import handler from '../api/index.js';import {reset} from './memory-blob.js';import {read,write} from '../lib/storage.js';
import {PRE_POST_DEADLINE_AT,blockedAfterDeadline} from '../lib/access-deadline.js';
test('cutoff uses 09:00 Jakarta and every candidate boundary is closed at the exact deadline',()=>{
 assert.equal(new Date(PRE_POST_DEADLINE_AT).toISOString(),'2026-10-03T02:00:00.000Z');
 for(const action of ['profile','comparison-resume','leadership-resume','candidate-materials','material-pdf','materials','materials-read']){assert.equal(blockedAfterDeadline(action,'',PRE_POST_DEADLINE_AT-1),false);assert.equal(blockedAfterDeadline(action,'',PRE_POST_DEADLINE_AT),true);}
 for(const stage of ['comparison','leadership'])for(const action of ['start','quiz','save','submit','violation','evaluate','security-warning','security-resume','security-timeout'])assert.equal(blockedAfterDeadline(action,stage,PRE_POST_DEADLINE_AT),true);
 for(const stage of ['pre','post:pw-curator'])assert.equal(blockedAfterDeadline('save',stage,PRE_POST_DEADLINE_AT),false);
});
test('live handler closes direct URLs and active attempts, keeps stored answers and permits admin review and pre-test',async()=>{
 reset();const realNow=Date.now;let now=PRE_POST_DEADLINE_AT-1000,cookie='';Date.now=()=>now;
 process.env.ADMIN_PASSWORD='deadline-test-only';process.env.ADMIN_SECRET='deadline-secret-test-only';
 const api=async(action,data,params={},auth=true)=>{const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',headers:{host:'localhost',...(auth&&cookie?{cookie}:{})},body:data},res={code:200,headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;}};await handler(req,res);return res;};
 try{
 const login=await api('admin-login',{password:process.env.ADMIN_PASSWORD});cookie=login.headers['Set-Cookie'].split(';')[0];
 await write('settings/v3-operations.json',{postTestsLocked:true,comparisonEnabled:true,selfServeMaterials:true,materialsHeld:false});
 const inv=(await api('admin-invite',{candidateName:'QA cutoff'})).value;
 assert.equal((await api('start',{token:inv.token,stage:'comparison',consent:true,identity:{name:'QA cutoff',contact:'qa@example.invalid'},preferences:['pw-curator']})).code,200);
 assert.equal((await api('save',{token:inv.token,stage:'comparison',answers:{cmp01:'Stored before cutoff'},revision:1})).code,200);
 const before=(await read('assessments/v2/'+inv.token+'.json')).value;now=PRE_POST_DEADLINE_AT;
 for(const action of ['profile','comparison-resume','leadership-resume','candidate-materials','save','submit','violation','evaluate','security-warning','security-resume','security-timeout']){const res=await api(action,{token:inv.token,stage:'comparison',answers:{cmp01:'Late answer'},revision:2});assert.equal(res.code,423,action);assert.equal(res.value.prePostClosed,true);}
 for(const action of ['quiz','material-pdf','materials','materials-read'])assert.equal((await api(action,null,{token:inv.token,code:inv.accessCode,stage:'comparison'})).code,423,action);
 assert.deepEqual((await read('assessments/v2/'+inv.token+'.json')).value,before);
 const state=(await api('invite',null,{token:inv.token})).value;assert.equal(state.prePostClosed,true);assert.equal(state.download,null);assert.equal(state.roleSelection,null);assert.equal(state.postTestEnabled,false);
 assert.equal((await api('resolve-code',{code:inv.accessCode})).code,200);assert.equal((await api('admin-submissions',null,{id:inv.token})).code,200);
 const fresh=(await api('admin-invite',{candidateName:'QA pre still open'})).value;
 const pre=await api('start',{token:fresh.token,stage:'pre',identity:{name:'QA pre still open',contact:'qa@example.invalid'},preferences:['pw-curator']});assert.equal(pre.code,200);assert.equal(pre.value.questions.length,32);
 assert.equal((await api('start',{token:inv.token,stage:'post:pw-curator'})).code,409);
 }finally{Date.now=realNow;}
});
