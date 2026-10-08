import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.js';
import {reset} from './memory-blob.js';
import {read,mutate,write} from '../lib/storage.js';
import {leadershipReady} from '../lib/leadership.js';
test('code-based schedule release preserves an incomplete leader assessment and opens only authorized post modules after cutoff',async()=>{
 reset();const realNow=Date.now;Date.now=()=>Date.parse('2026-10-08T10:00:00+07:00');
 process.env.ADMIN_PASSWORD='release-test';process.env.ADMIN_SECRET='release-test-secret';let cookie='';
 const api=async(action,data,params={},auth=true)=>{const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',headers:{host:'localhost',...(auth&&cookie?{cookie}:{})},body:data},res={code:200,headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;}};await handler(req,res);return res;};
 try{
  const login=await api('admin-login',{password:'release-test'});cookie=login.headers['Set-Cookie'].split(';')[0];
  await write('settings/v3-operations.json',{materialsHeld:false,postTestsLocked:false,selfServeMaterials:true});
  const inv=(await api('admin-invite',{candidateName:'Leader fixture'})).value;
  const original={status:'submitted',answers:{cmp01:'Evidence'},securityEvents:[],grading:{status:'complete'},result:{complete:true,comparable:true,answeredCount:10,capability:[],roleFits:[]}};
  await mutate('assessments/v2/'+inv.token+'.json',r=>{r.requiresComparison=true;r.leaderTrack={enabled:true};r.stages.comparison=structuredClone(original);});
  const roles=['cc-publicist','cc-executor','pw-curator','pw-workplace'],start=Date.parse('2026-10-08T14:10:00+07:00');
  const payload={code:inv.accessCode,expectedName:inv.candidateName,roles,postAccess:true,leadershipException:'Authorized leader requirement exception',schedule:{briefingAt:start-600000,slots:roles.map((roleKey,i)=>({roleKey,cohort:'P1',computer:7,cohortStartAt:start,startAt:start+i*600000}))}};
  assert.equal((await api('admin-post-schedule',payload,{},false)).code,401);
  assert.equal((await api('admin-post-schedule',{...payload,expectedName:'Wrong name'})).code,409);
  assert.equal((await api('admin-post-schedule',payload)).code,200);
  const record=(await read('assessments/v2/'+inv.token+'.json')).value;
  assert.equal(leadershipReady(record),false);assert.deepEqual(record.stages.comparison,original);assert.equal(record.stages.leadership,undefined);
  const info=(await api('post-info',{code:inv.accessCode},{},false)).value;
  assert.equal(info.schedule.published,true);assert.equal(info.testMinutes,9);assert.equal(info.schedule.briefingAt,start-600000);assert.equal('token' in info,false);
  const state=(await api('invite',null,{token:inv.token})).value;
  assert.equal(state.prePostClosed,true);assert.equal(state.postTestEnabled,true);assert.equal(state.leadershipReady,false);assert.equal(state.materialRoles.length,4);assert.equal(state.download,null);
  assert.equal((await api('start',{token:inv.token,stage:'post:pw-curator'})).code,200);
  assert.equal((await api('start',{token:inv.token,stage:'post:cc-creative'})).code,409);
  assert.equal((await api('profile',{token:inv.token,profile:{english:'Changed'}})).code,423);
  assert.equal((await api('start',{token:inv.token,stage:'leadership'})).code,423);
 }finally{Date.now=realNow;}
});
