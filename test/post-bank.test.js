import test from 'node:test';import assert from 'node:assert/strict';
import {POST,LEGACY_POST,PRE,ROLES,POST_BANK_VERSION,publicQuestions} from '../lib/assessment.js';
import {aggregate} from '../lib/scoring.js';import {read,write,mutate} from '../lib/storage.js';import {reset} from './memory-blob.js';import handler from '../api/index.js';
test('all eight advanced banks have four differentiated decisions and two distinct role-specific cases',()=>{
 assert.equal(PRE.length,32);const essays=[];
 for(const role of Object.keys(ROLES)){const qs=POST[role];assert.equal(qs.length,6);assert.equal(qs.filter(q=>q.type==='sjt').length,4);assert.equal(qs.filter(q=>q.type==='essay').length,2);
  for(const q of qs){assert.equal(q.role,role);assert.ok(q.q.length>100);if(q.type==='sjt'){assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.text)).size,4);assert.ok(new Set(q.options.map(o=>JSON.stringify(o.signals))).size>2);for(const o of q.options)for(const v of Object.values(o.signals))assert.ok(v>=0&&v<=4);}else{essays.push(q.q);assert.equal(q.criteria.length,4);assert.ok(q.criteria.every(c=>c.description.length>50));}}
  assert.equal(new Set(qs.filter(q=>q.type==='sjt').map(q=>q.options.findIndex(o=>Object.values(o.signals).every(v=>v===4)))).size,4);assert.ok(qs.every((q,i)=>q.q!==LEGACY_POST[role][i].q));const visible=JSON.stringify(publicQuestions('post:'+role));assert.ok(!visible.includes('signals')&&!visible.includes('criteria'));
 }assert.equal(new Set(essays).size,16);
});
test('legacy running sessions retain old prompts, validation, aggregation and grading while new sessions use advanced questions',async()=>{
 reset();process.env.ADMIN_PASSWORD='bank-qa';process.env.ADMIN_SECRET='bank-qa-secret';let cookie='',captured=[];const originalFetch=globalThis.fetch;
 const api=async(action,data,params={})=>{const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',headers:{host:'localhost',cookie},body:data},res={code:200,status(n){this.code=n;return this;},setHeader(k,v){if(k==='Set-Cookie')cookie=v.split(';')[0];},json(v){this.value=v;return this;}};await handler(req,res);return res;};
 try{
 await api('admin-login',{password:'bank-qa'});await write('settings/v3-operations.json',{postTestsLocked:false,materialsHeld:false});
 const inv=(await api('admin-invite',{candidateName:'Version fixture'})).value,role='cc-creative',stage='post:'+role;
 await mutate('assessments/v2/'+inv.token+'.json',r=>{r.stages.pre={status:'submitted',grading:{status:'complete'},result:{complete:true,capability:[],roleFits:[]}};r.materialSelection={roles:[role,'pw-curator'],releasedAt:Date.now()};r.postTestAccess={enabled:true};r.stages[stage]={status:'active',startedAt:Date.now(),expiresAt:Date.now()+540000,answers:{},revision:0,securityEvents:[],presentation:{questions:LEGACY_POST[role].map(q=>q.id),options:{}}};});
 const q=(await api('quiz',null,{token:inv.token,stage})).value;assert.deepEqual(q.questions.map(x=>x.q),LEGACY_POST[role].map(x=>x.q));
 const answers=Object.fromEntries(LEGACY_POST[role].map(q=>[q.id,q.type==='sjt'?0:'Jawaban sintetis untuk verifikasi versi bank.']));
 assert.equal((await api('save',{token:inv.token,stage,answers,revision:1})).code,200);assert.equal((await api('submit',{token:inv.token,stage,answers})).code,200);
 let saved=(await read('assessments/v2/'+inv.token+'.json')).value.stages[stage];assert.deepEqual(saved.result,aggregate(stage,answers,[],'legacy'));
 process.env.OPENAI_API_KEY='sk-qa-not-real';globalThis.fetch=async(u,opt)=>{const input=JSON.parse(JSON.parse(opt.body).input);captured=input;return new Response(JSON.stringify({status:'completed',model:'mock',output:[{content:[{type:'output_text',text:JSON.stringify({grades:input.map(q=>({id:q.id,criteria:q.criteria.map(c=>({cap:c.cap,score:0,evidence:'',fulfilled:[],missing:['Tidak ada bukti'],rationale:'Jawaban QA tidak memenuhi kriteria.',confidence:.9})),flags:[]}))})}]}]}));};
 assert.equal((await api('evaluate',{token:inv.token,stage})).code,200);assert.equal(captured[0].prompt,LEGACY_POST[role][4].q);
 const next=(await api('start',{token:inv.token,stage:'post:pw-curator'}));assert.equal(next.code,200);assert.deepEqual(new Set(next.value.questions.map(q=>q.q)),new Set(POST['pw-curator'].map(q=>q.q)));
 saved=(await read('assessments/v2/'+inv.token+'.json')).value;assert.equal(saved.stages['post:pw-curator'].questionBankVersion,POST_BANK_VERSION);assert.equal(saved.stages[stage].questionBankVersion,undefined);
 }finally{globalThis.fetch=originalFetch;}
});
