import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.js';
import {read,write} from '../lib/storage.js';
import {reset} from './memory-blob.js';
import {questionsFor} from '../lib/assessment.js';
import {structuredResponse,DEFAULT_GRADING_MODEL} from '../lib/grading.js';
let cookie='';
async function req(action,data,auth=true){const res={code:200,headers:{},status(c){this.code=c;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;}};await handler({url:'/api?action='+action,method:data?'POST':'GET',headers:{host:'localhost',...(auth?{cookie}:{})},body:data},res);return res;}
test('model configuration keeps encrypted key, exposes effective medium effort, rejects environment mismatch',async()=>{
 reset();process.env.ADMIN_PASSWORD='fixture';process.env.ADMIN_SECRET='fixture-secret';delete process.env.OPENAI_API_KEY;delete process.env.ASSESSMENT_AI_MODEL;
 const login=await req('admin-login',{password:'fixture'});cookie=login.headers['Set-Cookie'].split(';')[0];
 assert.equal((await req('admin-ai',{model:DEFAULT_GRADING_MODEL})).code,400);
 await req('admin-ai',{apiKey:'sk-fixture-secret',model:'gpt-4o-mini'});
 const old=(await read('settings/v2-ai.json')).value;
 assert.equal((await req('admin-ai',{apiKey:'',model:DEFAULT_GRADING_MODEL})).code,200);
 const after=(await read('settings/v2-ai.json')).value;assert.equal(after.encryptedKey,old.encryptedKey);
 const config=(await req('admin-config')).value;assert.equal(config.ai.model,DEFAULT_GRADING_MODEL);assert.deepEqual(config.ai.reasoning,{effort:'medium'});assert.ok(!JSON.stringify(config).includes('sk-fixture-secret'));
 process.env.ASSESSMENT_AI_MODEL='gpt-4o-mini';assert.equal((await req('admin-ai',{model:DEFAULT_GRADING_MODEL})).code,409);delete process.env.ASSESSMENT_AI_MODEL;
});
test('calibration is blind, authenticated, uses medium, and never mutates participant even on failure',async()=>{
 const token='calibration_fixture_token_123456',p='assessments/v2/'+token+'.json',q=questionsFor('comparison')[0];
 const record={token,candidateName:'Private name',profile:{english:'Private profile'},stages:{comparison:{status:'submitted',answers:{[q.id]:'1. Periksa fakta.\n2. Catat tindak lanjut.'},grades:[],grading:{status:'complete'},securityEvents:[]}}};await write(p,record);
 const fetchBefore=globalThis.fetch;
 try{
  assert.equal((await req('admin-calibrate',{token,stage:'comparison',questionIds:[q.id]},false)).code,401);
  assert.equal((await req('admin-calibrate',{token,stage:'comparison',questionIds:['bad']})).code,400);
  globalThis.fetch=async(url,options)=>{const b=JSON.parse(options.body),input=JSON.parse(b.input);assert.equal(b.model,DEFAULT_GRADING_MODEL);assert.deepEqual(b.reasoning,{effort:'medium'});assert.equal(b.store,false);assert.ok(!b.input.includes('Private'));assert.match(b.instructions,/sinonim/);assert.match(b.instructions,/Jangan menebak penggunaan AI/);return new Response(JSON.stringify({status:'completed',model:DEFAULT_GRADING_MODEL,output:[{content:[{type:'output_text',text:JSON.stringify({grades:{[q.id]:{criteria:Object.fromEntries(q.criteria.map(c=>[c.cap,{score:2,evidenceIndices:[0,1],fulfilled:['Periksa fakta'],missing:['Rincian'],rationale:'Sebagian langkah terbukti.',confidence:.8}])),flags:[]}}})}]}]}));};
  const r=await req('admin-calibrate',{token,stage:'comparison',questionIds:[q.id]});assert.equal(r.code,200,JSON.stringify(r.value));assert.equal(r.value.dryRun,true);assert.equal(r.value.evaluated.grades[0].criteria[0].evidence,'1. Periksa fakta.');assert.deepEqual((await read(p)).value,record);
  globalThis.fetch=async()=>new Response(JSON.stringify({error:{code:'rate_limit_exceeded'}}),{status:429});assert.notEqual((await req('admin-calibrate',{token,stage:'comparison',questionIds:[q.id]})).code,200);assert.deepEqual((await read(p)).value,record);
 }finally{globalThis.fetch=fetchBefore;}
});
test('legacy models do not receive reasoning parameter; incomplete output is not accepted',async()=>{
 await assert.rejects(structuredResponse('sk-test','gpt-4o-mini','instructions',[],{},'assessment_grades',async(u,o)=>{assert.equal(JSON.parse(o.body).reasoning,undefined);return new Response(JSON.stringify({status:'incomplete',output:[]}));}),/belum lengkap/);
});
