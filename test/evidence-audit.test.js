import test from 'node:test';import assert from 'node:assert/strict';
import {evidenceQuotes,meaningfulEvidence,validateGrades,normalizeGrades,GRADING_VERSION} from '../lib/grading.js';
import {inspectEvidence,auditInventory,fingerprint,applyEvidenceRevision,gradeChanges,auditSemantics} from '../lib/evidence-audit.js';
import {questionsFor} from '../lib/assessment.js';import {aggregate} from '../lib/scoring.js';
import handler from '../api/index.js';import {reset} from './memory-blob.js';import {write,read,mutate} from '../lib/storage.js';
const stage='comparison',q=questionsFor(stage)[0],answer='1. Verifikasi data dan tentukan penanggung jawab.\n2. Catat hasil pemeriksaan serta tindak lanjut.';
const answers={[q.id]:answer};
const detailed=()=>[{id:q.id,criteria:q.criteria.map(c=>({cap:c.cap,score:2,evidence:evidenceQuotes(answer)[0],evidenceQuotes:evidenceQuotes(answer),confidence:.8,fulfilled:['Pemeriksaan data'],missing:['Batas waktu belum disebut'],rationale:'Ada pemeriksaan data, tetapi jadwal belum ditetapkan.'})),flags:[]}];
const fixture=()=>{const grades=[{id:q.id,criteria:q.criteria.map(c=>({cap:c.cap,score:3,evidence:'1.',confidence:.7})),flags:[]}];return{status:'submitted',answers:structuredClone(answers),grades,result:aggregate(stage,answers,grades),grading:{status:'complete',model:'test'},reviewRequired:true,securityEvents:[{kind:'warning',type:'tab_hidden'}]};};
test('numbered bullets, wrapped markers, decimals, abbreviations and long paragraphs retain exact meaningful evidence',()=>{
 for(const a of [answer,'1.\nPeriksa data\n2.\nCatat hasil','1) Pemeriksaan\r\n2) Dokumentasi','a. Pemeriksaan\nb. Dokumentasi','I. Pemeriksaan\nII. Dokumentasi','Biaya Rp. 2.500, jadwal 1.5 jam. '+ 'Tindak lanjut. '.repeat(60)]){const quotes=evidenceQuotes(a);assert.ok(quotes.length);for(const v of quotes){assert.ok(a.includes(v));assert.ok(meaningfulEvidence(v));assert.notEqual(v,'1.');}}
 for(const a of ['1.','2)','•','I.','...','123'])assert.deepEqual(evidenceQuotes(a),[]);
 assert.deepEqual(evidenceQuotes(answer),answer.split('\n'));
});
test('validator rejects marker-only evidence, invented quotes, missing explanations and contradictory score details',()=>{
 const g=detailed();validateGrades([q],{grades:g},answers,{requireDetails:true});
 for(const patch of [{evidence:'1.',evidenceQuotes:['1.']},{evidence:'Invented evidence',evidenceQuotes:['Invented evidence']},{rationale:''},{score:4},{fulfilled:[]}]){const copy=structuredClone(g);Object.assign(copy[0].criteria[0],patch);assert.throws(()=>validateGrades([q],{grades:copy},answers,{requireDetails:true}));}
 const keyed={grades:{[q.id]:{criteria:Object.fromEntries(q.criteria.map(c=>[c.cap,{score:2,evidenceIndices:[0,1],confidence:.8,fulfilled:['Data'],missing:['Waktu'],rationale:'Sebagian.'}])),flags:[]}}};
 assert.deepEqual(normalizeGrades(keyed,answers).grades[0].criteria[0].evidenceQuotes,evidenceQuotes(answer));
 keyed.grades[q.id].criteria[q.criteria[0].cap].evidenceIndices=[0,0];assert.throws(()=>normalizeGrades(keyed,answers));
});
test('inventory includes hidden participants, detects structural defects and never assumes clean format proves relevance',()=>{
 const s=fixture(),clean={...fixture(),grades:detailed()};const items=auditInventory([{token:'fixture',candidateName:'Fixture',adminVisibility:{hidden:true},stages:{comparison:s,pre:clean}}]);assert.equal(items.length,2);assert.ok(items[0].issues.some(x=>x.reason==='numbering_or_empty_evidence'));assert.ok(items.every(x=>x.semanticCheckRequired));
 assert.equal(inspectEvidence(stage,{...s,grades:detailed()}).affected,false);
});
test('semantic audit examines relevance without modifying old scores or accepting missing results',async()=>{
 const s={...fixture(),grades:detailed()},before=structuredClone(s);let sent;
 const fetcher=async(u,o)=>{sent=JSON.parse(o.body);return new Response(JSON.stringify({status:'completed',model:'fixture',output:[{content:[{type:'output_text',text:JSON.stringify({reviews:{[q.id]:Object.fromEntries(q.criteria.map(c=>[c.cap,{evidenceStatus:'irrelevant',scoreStatus:'appropriate',reason:'Kutipan belum mendukung unsur rubrik yang dinilai.'}]))}})}]}]}));};
 const audit=await auditSemantics(stage,s,'sk-fixture','fixture',fetcher);assert.equal(audit.needsReview,true);assert.deepEqual(s,before);assert.ok(!sent.input.includes('candidateName'));assert.equal(sent.store,false);
 await assert.rejects(()=>auditSemantics(stage,s,'sk-fixture','fixture',async()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:'{"reviews":{}}'}]}]}))));
});
function proposal(s){const grades=detailed();return{id:'proposal',status:'ready',sourceFingerprint:fingerprint(s),evaluated:{grades,reviewRequired:false,gradingVersion:GRADING_VERSION,model:'test'},changes:gradeChanges(s.grades,grades)};}
test('applying a proposal archives old grades exactly, preserves answers/security and is idempotent; stale proposals are rejected',()=>{
 const s=fixture(),old=structuredClone(s);s.evidenceRevision=proposal(s);applyEvidenceRevision(s,stage,'proposal','Perbaikan kutipan');assert.deepEqual(s.reviewHistory[0].previousGrades,old.grades);assert.deepEqual(s.reviewHistory[0].previousResult,old.result);assert.deepEqual(s.answers,old.answers);assert.deepEqual(s.securityEvents,old.securityEvents);assert.equal(s.reviewRequired,true);assert.equal(s.grades[0].criteria[0].score,2);assert.equal(applyEvidenceRevision(s,stage,'proposal','ulang').alreadyApplied,true);assert.equal(s.reviewHistory.length,1);
 const changed=fixture();changed.evidenceRevision=proposal(changed);changed.answers[q.id]+=' Perubahan.';assert.throws(()=>applyEvidenceRevision(changed,stage,'proposal','stale'),/berubah/);
});
let cookie='';async function api(action,data,params={},authenticated=true){const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',body:data,headers:{host:'localhost',...(authenticated?{cookie}:{})}},res={code:200,headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;}};await handler(req,res);return res;}
test('admin repair survives model failure, stages reviewable proposals, protects identity/access and rejects unauthorized calls',async()=>{
 reset();process.env.ADMIN_PASSWORD='repair-fixture';process.env.ADMIN_SECRET='repair-fixture-secret';process.env.OPENAI_API_KEY='sk-test';const realFetch=globalThis.fetch;
 try{
 const login=await api('admin-login',{password:process.env.ADMIN_PASSWORD});cookie=login.headers['Set-Cookie'].split(';')[0];
 const token='fixture_repair_token_123456789',path='assessments/v2/'+token+'.json',s=fixture();
 const record={token,candidateName:'Synthetic fixture',accessCode:'123456',profile:{interests:'Private profile never sent'},preferences:['cc-creative'],materialSelection:{roles:['cc-creative'],releasedAt:1},postTestAccess:{enabled:false},stages:{comparison:s}};
 await write(path,record);await write('settings/v3-operations.json',{postTestsLocked:true});
 assert.equal((await api('admin-evidence-audit',null,{},false)).code,401);assert.equal((await api('admin-evidence-regrade',{token,stage},{},false)).code,401);
 globalThis.fetch=async()=>new Response(JSON.stringify({error:'fixture failure'}),{status:503});assert.notEqual((await api('admin-evidence-regrade',{token,stage})).code,200);
 let stored=(await read(path)).value;assert.deepEqual(stored.stages.comparison.grades,s.grades);assert.deepEqual(stored.stages.comparison.grading,s.grading);assert.equal(stored.stages.comparison.evidenceJob,undefined);
 globalThis.fetch=async(u,o)=>{const input=JSON.parse(JSON.parse(o.body).input);assert.equal(input[0].answer,answer);assert.ok(!JSON.stringify(input).includes('Private profile'));return new Response(JSON.stringify({status:'completed',model:'test',output:[{content:[{type:'output_text',text:JSON.stringify({grades:detailed()})}]}]}));};
 const preview=await api('admin-evidence-regrade',{token,stage});assert.equal(preview.code,200,JSON.stringify(preview.value));const id=preview.value.result.id;
 stored=(await read(path)).value;assert.deepEqual(stored.stages.comparison.grades,s.grades);assert.equal((await api('admin-evidence-regrade',{token,stage})).value.cached,true);
 assert.equal((await api('admin-evidence-apply',{token,stage,proposalId:id,reason:''})).code,400);
 assert.equal((await api('admin-evidence-apply',{token,stage,proposalId:id,reason:'Approved repair fixture'})).code,200);
 assert.equal((await api('admin-evidence-apply',{token,stage,proposalId:id,reason:'Repeat'})).value.alreadyApplied,true);
 stored=(await read(path)).value;for(const key of ['candidateName','accessCode','profile','preferences','materialSelection','postTestAccess'])assert.deepEqual(stored[key],record[key]);assert.deepEqual(stored.stages.comparison.answers,s.answers);assert.equal(stored.stages.comparison.reviewHistory.length,1);
 assert.equal((await api('admin-evidence-regrade',{token,stage:'post:cc-creative'})).code,409);
 }finally{globalThis.fetch=realFetch;delete process.env.OPENAI_API_KEY;}
});
