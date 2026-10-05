import test from 'node:test';import assert from 'node:assert/strict';
import {recalibrateComparison,eligibleForCalibration,CALIBRATION_BATCH} from '../lib/recalibration.js';
import {questionsFor} from '../lib/assessment.js';import {read,write,mutate} from '../lib/storage.js';import {reset} from './memory-blob.js';import {DEFAULT_GRADING_MODEL} from '../lib/grading.js';import handler from '../api/index.js';
const token='complete_calibration_fixture_123',rp='assessments/v2/'+token+'.json',jp='calibrations/'+CALIBRATION_BATCH+'/'+token+'.json';
const answers=Object.fromEntries(questionsFor('comparison').map(q=>[q.id,'1. Periksa bukti pekerjaan.\n2. Catat dan evaluasi hasil.']));
const fixture=()=>({token,accessCode:'123456',candidateName:'Private',profile:{english:'private'},materialSelection:{roles:['cc-creative'],releasedAt:1},postTestAccess:{enabled:false},stages:{pre:{answers:{a:'old'},result:{score:20}},comparison:{status:'submitted',answers,grades:[],grading:{status:'complete',model:'old'},result:{score:80},reviewRequired:true,securityEvents:[]}}});
const cfg={key:'sk-test',model:DEFAULT_GRADING_MODEL};
const mock=async(u,o)=>{const b=JSON.parse(o.body),input=JSON.parse(b.input);assert.deepEqual(b.reasoning,{effort:'medium'});assert.equal(b.model,DEFAULT_GRADING_MODEL);assert.ok(!b.input.includes('Private'));return new Response(JSON.stringify({status:'completed',model:DEFAULT_GRADING_MODEL,output:[{content:[{type:'output_text',text:JSON.stringify({grades:Object.fromEntries(input.map(q=>[q.id,{criteria:Object.fromEntries(q.criteria.map(c=>[c.cap,{score:2,evidenceIndices:[0],fulfilled:['Memeriksa'],missing:['Detail'],rationale:'Sebagian terbukti.',confidence:.8}])),flags:[]}]))})}]}]}));};
test('calibration persists chunks, survives failure, archives old grade once and changes only comparison scoring',async()=>{
 reset();const original=fixture();await write(rp,original);assert.equal(eligibleForCalibration(original.stages.comparison),true);assert.equal(eligibleForCalibration({...original.stages.comparison,answers:{}}),false);
 await assert.rejects(recalibrateComparison(token,'apply',cfg),/belum lengkap/);
 let a=await recalibrateComparison(token,'step',cfg,{fetcher:mock});assert.equal(a.completed,2);assert.deepEqual((await read(rp)).value,original);
 await assert.rejects(recalibrateComparison(token,'step',cfg,{fetcher:async()=>new Response(JSON.stringify({error:{code:'rate_limit_exceeded'}}),{status:429})}));assert.equal((await read(jp)).value.grades.length,2);assert.deepEqual((await read(rp)).value,original);
 for(let i=0;i<4;i++)a=await recalibrateComparison(token,'step',cfg,{fetcher:mock});assert.equal(a.status,'ready');assert.equal(a.completed,10);
 assert.equal((await recalibrateComparison(token,'apply',cfg)).status,'applied');const after=(await read(rp)).value;
 for(const k of ['accessCode','candidateName','profile','materialSelection','postTestAccess'])assert.deepEqual(after[k],original[k]);assert.deepEqual(after.stages.pre,original.stages.pre);assert.deepEqual(after.stages.comparison.answers,original.stages.comparison.answers);assert.equal(after.stages.comparison.reviewRequired,true);
 const h=after.stages.comparison.reviewHistory[0];assert.deepEqual(h.previousGrading,original.stages.comparison.grading);assert.deepEqual(h.previousResult,original.stages.comparison.result);assert.equal(after.stages.comparison.result.complete,true);
 assert.equal((await recalibrateComparison(token,'apply',cfg)).alreadyApplied,true);assert.equal((await read(rp)).value.stages.comparison.reviewHistory.length,1);
});
test('stale input and mismatched model cannot replace official scores; incomplete participants skipped',async()=>{
 reset();await write(rp,fixture());await assert.rejects(recalibrateComparison(token,'step',{...cfg,model:'gpt-4o-mini'}),/Model aktif/);
 for(let i=0;i<5;i++)await recalibrateComparison(token,'step',cfg,{fetcher:mock});await mutate(rp,r=>{r.stages.comparison.answers.cmp01='Changed answer';});await assert.rejects(recalibrateComparison(token,'apply',cfg),/berubah/);assert.equal((await read(rp)).value.stages.comparison.grading.model,'old');
 await mutate(rp,r=>{delete r.stages.comparison.answers.cmp10;});await assert.rejects(recalibrateComparison(token,'step',cfg),/Lewati/);
});
test('bulk calibration endpoint rejects unauthenticated access',async()=>{const res={code:200,setHeader(){},status(x){this.code=x;return this;},json(v){this.value=v;return this;}};await handler({url:'/api?action=admin-recalibrate-comparison',method:'POST',headers:{host:'localhost'},body:{token,phase:'step'}},res);assert.equal(res.code,401);});
