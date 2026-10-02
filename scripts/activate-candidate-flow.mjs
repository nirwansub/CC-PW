// One-time activation and disposable QA using the deployment's existing credentials.
import assert from 'node:assert/strict';
import handler from '../api/index.js';
import {read,write,mutate} from '../lib/storage.js';
import {CANDIDATE_FLOW_VERSION} from '../lib/candidate-flow.js';
const marker='settings/self-service-flow-verification.json';
export async function activateCandidateFlow(){
 if(process.env.VERCEL_ENV!=='production')return;
 const previousMarker=(await read(marker))?.value;if(previousMarker?.state==='complete'&&previousMarker.version===CANDIDATE_FLOW_VERSION)return;
 const ops=(await read('settings/v3-operations.json'))?.value||{};let fixture,cookie='';const proof={};
 async function api(action,data,params={},expected=200){const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',headers:{host:'cc-pw.vercel.app',...(cookie?{cookie}:{})},body:data};const res={code:200,headers:{},status(c){this.code=c;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;},send(v){this.value=v;return this;}};await handler(req,res);assert.equal(res.code,expected,'Candidate flow boundary: '+action);if(action==='admin-login')cookie=res.headers['Set-Cookie'].split(';')[0];return res.value;}
 try{
  await write('settings/v3-operations.json',{...ops,materialsHeld:false,comparisonEnabled:true,selfServeMaterials:true,updatedAt:Date.now()});
  await api('admin-login',{password:process.env.ADMIN_PASSWORD});const cfg=await api('admin-config');
  fixture=await api('admin-invite',{candidateName:'QA candidate material flow (disposable)',currentTeam:'QA'});const token=fixture.token;
  await api('material-pdf',null,{code:fixture.accessCode},403);await api('candidate-materials',{token,roles:['cc-strategist']},{},409);
  const started=await api('start',{token,stage:'comparison',consent:true,identity:{name:fixture.candidateName,contact:'qa@example.invalid'},preferences:['cc-strategist']});assert.equal(started.questions.length,10);assert.equal(started.expiresAt,null);
  const first={cmp01:'Iya.'};await api('security-warning',{token,stage:'comparison',answers:first,revision:1,eventId:'qa-warning',type:'tab_or_app_switch'});
  // Advance only this disposable fixture's deadline to verify settlement without a blocking wait.
  await mutate('assessments/v2/'+token+'.json',r=>{r.stages.comparison.securityEvents[0].deadlineAt=Date.now()-1;});
  let state=await api('invite',null,{token});assert.equal(state.stages.comparison.status,'submitted');assert.equal(state.roleSelection,null);
  await api('comparison-resume',{token});const quiz=await api('quiz',null,{token,stage:'comparison'});assert.deepEqual(quiz.lockedAnswers,['cmp01']);assert.deepEqual(quiz.answers,first);
  await api('save',{token,stage:'comparison',answers:{cmp01:'Rewritten'},revision:2},{},409);
  const answers=Object.fromEntries(cfg.comparisonBank.map((q,i)=>[q.id,i===0?'Iya.':'Langkah dan alasan saya: '+q.criteria.map(c=>c.description).join(' ')]));
  await api('submit',{token,stage:'comparison',answers});state=await api('invite',null,{token});assert.equal(state.stages.comparison.grading,'complete');assert.equal(state.stages.comparison.comparable,true);assert.equal(state.roleSelection.choices.length,8);assert.equal(state.roleSelection.choices.filter(x=>x.recommended).length,2);assert.ok(state.roleSelection.choices.find(x=>x.roleKey==='cc-strategist').selected);assert.equal(state.download,null);
  for(const field of ['grades','criteria','capability','evidence','finalScore'])assert.ok(!JSON.stringify(state).includes('"'+field+'"'));
  const admin=await api('admin-submissions',null,{id:token});assert.equal(admin.primaryAssessment.source,'comparison');assert.equal(admin.record.stages.comparison.resumeHistory.length,1);assert.equal(admin.record.stages.comparison.answers.cmp01,'Iya.');
  for(const g of admin.record.stages.comparison.grades)for(const c of g.criteria)if(c.score>0)assert.ok(answers[g.id].includes(c.evidence));
  await api('candidate-materials',{token,roles:[]},{},400);const download=await api('candidate-materials',{token,roles:['cc-strategist','pw-workplace']});assert.match(download.qr,/<svg/);assert.ok(download.url.includes('code='+fixture.accessCode));const pdf=await api('material-pdf',null,{code:fixture.accessCode});assert.equal(pdf.subarray(0,4).toString(),'%PDF');
  state=await api('invite',null,{token});assert.deepEqual(state.materialRoles.map(r=>r.roleKey),['cc-strategist','pw-workplace']);assert.equal(state.postTestEnabled,false);await api('materials-read',{token,role:'cc-strategist'});await api('start',{token,stage:'post:cc-strategist'},{},409);
  Object.assign(proof,{completeComparisonGate:true,automaticActualAI:true,roleScoresOnly:true,defaultPreferencesAndTopTwo:true,candidateSelection:true,selectedPDFAndQR:true,manualPostAccess:true,interruptedAnswersPreserved:true});
 }catch(e){await write('settings/v3-operations.json',ops);throw new Error('Candidate flow verification failed: '+e.message);}
 finally{if(fixture){await api('admin-delete-candidate',{token:fixture.token,expectedName:fixture.candidateName});await api('invite',null,{token:fixture.token},404);proof.fixtureCleaned=true;}}
 await write(marker,{state:'complete',version:CANDIDATE_FLOW_VERSION,proof,completedAt:Date.now()});console.log('CANDIDATE_FLOW_VERIFIED',JSON.stringify({version:CANDIDATE_FLOW_VERSION,checks:Object.keys(proof).length}));
}
