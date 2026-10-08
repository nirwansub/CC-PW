import test from 'node:test';import assert from 'node:assert/strict';import {positionRecommendations} from '../lib/position-recommendations.js';import handler from '../api/index.js';import {reset} from './memory-blob.js';import {write,read} from '../lib/storage.js';
const result=(score,comparable=false)=>({complete:true,comparable,answeredCount:6,totalQuestions:6,roleFits:[{roleKey:'cc-executor',score},{roleKey:'pw-executor',score}]});
const stage=(score,comparable=false)=>({status:'submitted',grading:{status:'complete'},result:result(score,comparable),answers:{},securityEvents:[]});
const candidate=(n,post=90,pre=60,cmp=80)=>({token:'candidate_fixture_token_'+n.toString().padStart(4,'0'),candidateName:'Participant '+n,accessCode:String(100000+n),preferences:[],postTestAccess:{enabled:true},materialSelection:{releasedAt:1,roles:['cc-executor','pw-executor']},stages:{pre:stage(pre),comparison:stage(cmp,true),'post:cc-executor':stage(post),'post:pw-executor':stage(post)}});
test('combined score uses latest per-stage scores, absent pre is unmeasured, excludes unfinished grading and selects top five',()=>{
 const a=candidate(1);a.scoreHistory=[{post:100}];const rows=[a,...Array.from({length:6},(_,i)=>candidate(i+2,80-i))];const ungraded=candidate(20,100);ungraded.stages['post:cc-executor'].grading.status='running';rows.push(ungraded);
 const data=positionRecommendations(rows);assert.equal(data.length,8);const r=data.find(r=>r.roleKey==='cc-executor');assert.equal(r.candidates.length,7);assert.equal(r.candidates[0].final,80);assert.equal(r.candidates.filter(c=>c.selected).length,5);
 delete a.stages.pre;assert.equal(positionRecommendations([a])[3].candidates[0].final,85);
 a.stages['post:cc-executor'].result.roleFits[0].score=0;assert.equal(positionRecommendations([a])[3].candidates[0].post,0);
});
test('manual selections survive new higher scores and remain independent across positions',()=>{
 const rows=Array.from({length:7},(_,i)=>candidate(i+1,90-i));const overrides={choices:{'cc-executor':{[rows[0].token]:false,[rows[6].token]:true}}};
 let data=positionRecommendations(rows,overrides);assert.equal(data[3].candidates[0].selected,false);assert.equal(data[3].candidates[6].selected,true);assert.equal(data[7].candidates[0].selected,true);
 data=positionRecommendations([candidate(30,100),...rows],overrides);assert.equal(data[3].candidates.find(c=>c.token===rows[6].token).selected,true);
});
test('admin recommendations read without changing active exams; persisted shortlist changes only its own settings with conflict guard',async()=>{
 reset();const now=Date.now;Date.now=()=>Date.parse('2026-10-08T15:00:00+07:00');process.env.ADMIN_PASSWORD='fixture';process.env.ADMIN_SECRET='fixture-secret';let cookie='';
 const api=async(action,data,auth=true)=>{const res={code:200,headers:{},status(c){this.code=c;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;}};await handler({url:'/api?action='+action,method:data?'POST':'GET',headers:{host:'localhost',...(auth?{cookie}:{})},body:data},res);return res;};
 try{
  cookie=(await api('admin-login',{password:'fixture'})).headers['Set-Cookie'].split(';')[0];const r=candidate(1);r.stages['post:pw-executor']={status:'active',expiresAt:1,answers:{},securityEvents:[]};await write('assessments/v2/'+r.token+'.json',r);const before=(await read('assessments/v2/'+r.token+'.json')).value;
  assert.equal((await api('admin-position-recommendations',null,false)).code,401);const output=(await api('admin-position-recommendations')).value;assert.equal(output.positions[3].candidates.length,1);assert.equal(output.positions[7].candidates.length,0);assert.equal('answers' in output.positions[3].candidates[0],false);
  const payload={roleKey:'cc-executor',token:r.token,checked:false,expectedSelection:null};assert.equal((await api('admin-position-shortlist',payload,false)).code,401);assert.equal((await api('admin-position-shortlist',payload)).code,200);assert.equal((await api('admin-position-shortlist',{...payload,checked:true})).code,409);
  assert.equal((await api('admin-position-recommendations')).value.positions[3].candidates[0].selected,false);assert.deepEqual((await read('assessments/v2/'+r.token+'.json')).value,before);
 }finally{Date.now=now;}
});
