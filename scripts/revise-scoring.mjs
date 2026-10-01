// One-time production migration under the deployment's existing private credentials.
// No public maintenance route, credentials, candidate names or contacts in build output.
import assert from 'node:assert/strict';
import {read,write,mutate,listValues} from '../lib/storage.js';
import {recalculateRecord} from '../lib/revision.js';
import {SCORING_VERSION} from '../lib/scoring.js';
import handler from '../api/index.js';
const marker='settings/scoring-v3-deployment-migration.json';
async function liveVerification(){
 let cookie='',fixture=null;const proof={};
 async function api(action,data,params={},expected=200){
  const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',headers:{host:'cc-pw.vercel.app',...(cookie?{cookie}:{})},body:data};
  const res={code:200,headers:{},status(c){this.code=c;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;},send(v){this.value=v;return this;}};
  await handler(req,res);if(res.code!==expected)throw new Error('Verification boundary '+action+' returned '+res.code);
  if(action==='admin-login')cookie=res.headers['Set-Cookie'].split(';')[0];return res.value;
 }
 try{
  await api('admin-login',{password:process.env.ADMIN_PASSWORD});const cfg=await api('admin-config');
  assert.equal(cfg.operations.materialsHeld,true);assert.equal(cfg.operations.comparisonEnabled,true);
  fixture=await api('admin-invite',{candidateName:'QA scoring-v3 deployment verification (disposable)',currentTeam:'QA'});
  const token=fixture.token;
  const start=await api('start',{token,stage:'comparison',consent:true,identity:{name:fixture.candidateName,contact:'qa@example.invalid'},preferences:['cc-strategist']});
  assert.equal(start.expiresAt,null);assert.equal(start.questions.length,10);assert.deepEqual(start.questions.map(q=>q.id),cfg.comparisonBank.map(q=>q.id));assert.ok(!JSON.stringify(start.questions).includes('criteria'));
  const quiz=await api('quiz',null,{token,stage:'comparison'});assert.deepEqual(quiz.questions,start.questions);
  const answers=Object.fromEntries(cfg.comparisonBank.map((q,i)=>[q.id,i<2?'Iya.':'Langkah dan alasan saya: '+q.criteria.map(c=>c.description).join(' ')]));
  await api('save',{token,stage:'comparison',answers,revision:1});await api('submit',{token,stage:'comparison',answers});await api('evaluate',{token,stage:'comparison'});
  let d=await api('admin-submissions',null,{id:token});const s=d.record.stages.comparison;assert.equal(d.primaryAssessment.source,'comparison');assert.equal(s.result.comparable,true);assert.equal(s.result.answeredCount,10);assert.deepEqual(s.answers,answers);
  const weak=s.grades.filter(g=>['cmp01','cmp02'].includes(g.id)).flatMap(g=>g.criteria.map(c=>c.score));
  const strong=s.grades.filter(g=>!['cmp01','cmp02'].includes(g.id)).flatMap(g=>g.criteria.map(c=>c.score));
  assert.ok(Math.max(...weak)<=2);assert.ok(strong.reduce((a,b)=>a+b,0)/strong.length>weak.reduce((a,b)=>a+b,0)/weak.length);
  for(const g of s.grades)for(const c of g.criteria)if(c.score>0)assert.ok(answers[g.id].includes(c.evidence));
  await api('profile',{token,profile:{english:'Non-scoring profile',hobbies:'Non-scoring'}});d=await api('admin-submissions',null,{id:token});assert.deepEqual(d.record.stages.comparison.result,s.result);
  await api('admin-materials',{token,roles:['cc-strategist']});await api('material-pdf',null,{code:fixture.accessCode},423);await api('start',{token,stage:'post:cc-strategist'}, {},423);
  Object.assign(proof,{commonUntimedForm:true,actualAI:true,exactQuotes:true,weakVsStrongSanityCheck:true,profileExcluded:true,replacementWithoutOldPre:true,materialAndPostHold:true});
 }finally{
  if(fixture){await api('admin-delete-candidate',{token:fixture.token,expectedName:fixture.candidateName});await api('invite',null,{token:fixture.token},404);proof.fixtureCleaned=true;}
 }
 return proof;
}
export async function runProductionRevision(){
 if(process.env.VERCEL_ENV!=='production')return;
 for(const name of ['BLOB_READ_WRITE_TOKEN','ADMIN_SECRET','ADMIN_PASSWORD'])if(!process.env[name])throw new Error('Production revision prerequisite missing: '+name);
 const previous=(await read(marker))?.value;if(previous?.state==='complete'&&previous.scoringVersion===SCORING_VERSION){console.log('SCORING_REVISION_ALREADY_COMPLETE',JSON.stringify({verified:previous.verified,scoringVersion:previous.scoringVersion}));return;}
 const ops=(await read('settings/v3-operations.json'))?.value||{};
 await write('settings/v3-operations.json',{...ops,materialsHeld:true,comparisonEnabled:false,updatedAt:Date.now()});
 await write(marker,{state:'running',scoringVersion:SCORING_VERSION,startedAt:Date.now()});
 const records=await listValues('assessments/v2/');const targets=records.filter(r=>['submitted','terminated'].includes(r.stages?.pre?.status));
 let next=0,verified=0;const errors=[];
 async function worker(){while(next<targets.length){const before=targets[next++];try{
  if(before.stages.pre.grading?.status!=='complete')throw new Error('Pending essay grading');
  let captured;await mutate('assessments/v2/'+before.token+'.json',r=>{captured=structuredClone(r);recalculateRecord(r);});
  const after=(await read('assessments/v2/'+before.token+'.json')).value;
  assert.deepEqual(after.stages.pre.answers,captured.stages.pre.answers);assert.deepEqual(after.stages.pre.grades,captured.stages.pre.grades);
  for(const key of ['profile','profileStatus','identity','preferences','accessCode','postTestAccess','notes'])assert.deepEqual(after[key],captured[key]);
  assert.equal(after.stages.pre.result.scoringVersion,SCORING_VERSION);assert.equal(after.stages.pre.result.complete,true);assert.ok(after.stages.pre.scoreHistory.length>=1);assert.equal(after.requiresComparison,true);assert.equal(after.materialSelection.releasedAt,null);
  if(captured.stages.pre.result.scoringVersion!==SCORING_VERSION)assert.deepEqual(after.stages.pre.scoreHistory.at(-1).previousResult,captured.stages.pre.result);
  verified++;if(verified%10===0)console.log('SCORING_REVISION_PROGRESS',verified+'/'+targets.length);
 }catch{errors.push(before.token);}}}
 await Promise.all([worker(),worker()]);
 if(errors.length){await write(marker,{state:'needs_review',scoringVersion:SCORING_VERSION,verified,total:targets.length,failedTokens:errors,updatedAt:Date.now()});throw new Error('Scoring revision requires review for '+errors.length+' records; material hold remains active');}
 await write('settings/v3-operations.json',{...ops,materialsHeld:true,comparisonEnabled:true,updatedAt:Date.now()});
 const proof=await liveVerification();
 
 const summary={state:'complete',scoringVersion:SCORING_VERSION,total:targets.length,verified,zeroAnswerSessions:targets.filter(r=>!Object.keys(r.stages.pre.answers).length).length,materialsHeld:true,comparisonEnabled:true,proof,completedAt:Date.now()};
 await write(marker,summary);console.log('SCORING_REVISION_COMPLETE',JSON.stringify(summary));
}
