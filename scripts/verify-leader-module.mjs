// Deployment verification uses a disposable record, never participant evidence.
import assert from 'node:assert/strict';
import handler from '../api/index.js';
import {read,write,mutate} from '../lib/storage.js';
import {aggregate} from '../lib/scoring.js';
import {questionsFor} from '../lib/assessment.js';
import {LEADERSHIP_VERSION} from '../lib/leadership.js';
const marker='settings/leader-module-verification.json';
export async function verifyLeaderModule(){
 if(process.env.VERCEL_ENV!=='production')return;
 if((await read(marker))?.value?.version===LEADERSHIP_VERSION&&(await read(marker))?.value?.state==='complete')return;
 let fixture,cookie='';const proof={};
 async function api(action,data,params={},expected=200){const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',headers:{host:'cc-pw.vercel.app',...(cookie?{cookie}:{})},body:data};const res={code:200,headers:{},status(c){this.code=c;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.value=v;return this;},send(v){this.value=v;return this;}};await handler(req,res);assert.equal(res.code,expected,'Leader boundary: '+action);if(action==='admin-login')cookie=res.headers['Set-Cookie'].split(';')[0];return res.value;}
 try{
 await api('admin-login',{password:process.env.ADMIN_PASSWORD});fixture=await api('admin-invite',{candidateName:'QA leader module (disposable)',currentTeam:'QA'});const token=fixture.token;
 await api('start',{token,stage:'leadership',consent:true},{},403);await api('admin-leader-track',{token,enabled:true});await api('start',{token,stage:'leadership',consent:true},{},409);
 // Install a verified common-baseline fixture to isolate the real leader AI request.
 const common=questionsFor('comparison'),commonAnswers=Object.fromEntries(common.map(q=>[q.id,'Langkah dan alasan: '+q.criteria.map(c=>c.description).join(' ')]));
 const commonGrades=common.map(q=>({id:q.id,criteria:q.criteria.map(c=>({cap:c.cap,score:3,evidence:commonAnswers[q.id],confidence:.9})),flags:[]}));
 await mutate('assessments/v2/'+token+'.json',r=>{r.identity={name:fixture.candidateName,contact:'qa@example.invalid'};r.preferences=['pw-curator'];r.requiresComparison=true;r.stages.comparison={status:'submitted',answers:commonAnswers,grades:commonGrades,result:aggregate('comparison',commonAnswers,commonGrades),grading:{status:'complete',method:'qa_fixture'},expiresAt:null,securityEvents:[]};});
 const before=(await api('admin-submissions',null,{id:token})).record.stages.comparison;
 await api('candidate-materials',{token,roles:['pw-curator']},{},409);await api('material-pdf',null,{code:fixture.accessCode},403);
 const started=await api('start',{token,stage:'leadership',consent:true});assert.equal(started.questions.length,4);assert.equal(started.expiresAt,null);assert.ok(!JSON.stringify(started).includes('criteria'));proof.gatedFourUntimedCases=true;
 const qs=questionsFor('leadership'),full=Object.fromEntries(qs.map(q=>[q.id,'Langkah dan alasan: '+q.criteria.map(c=>c.description).join(' ')])),first={ldr01:full.ldr01};
 await api('security-warning',{token,stage:'leadership',answers:first,revision:1,eventId:'qa-leader-warning',type:'tab_or_app_switch'});await mutate('assessments/v2/'+token+'.json',r=>{r.stages.leadership.securityEvents[0].deadlineAt=Date.now()-1;});
 let state=await api('invite',null,{token});assert.equal(state.stages.leadership.status,'submitted');assert.equal(state.leadershipReady,false);await api('leadership-resume',{token});const quiz=await api('quiz',null,{token,stage:'leadership'});assert.deepEqual(quiz.lockedAnswers,['ldr01']);await api('save',{token,stage:'leadership',answers:{ldr01:'Rewrite'},revision:2},{},409);proof.securityResumeKeepsEvidence=true;
 await api('submit',{token,stage:'leadership',answers:full});state=await api('invite',null,{token});assert.equal(state.leadershipReady,true);assert.equal(state.stages.leadership.grading,'complete');assert.equal(state.roleSelection.choices.length,8);for(const field of ['leadershipScore','observedScore','grades','capability','criteria'])assert.ok(!JSON.stringify(state).includes('"'+field+'"'));proof.realAIAndPrivateScore=true;
 const admin=(await api('admin-submissions',null,{id:token}));assert.deepEqual(admin.record.stages.comparison,before);assert.equal(admin.primaryAssessment.source,'comparison');const result=admin.record.stages.leadership.result;assert.ok(Number.isFinite(result.leadershipScore)&&result.leadershipScore>=0&&result.leadershipScore<=100);for(const g of admin.record.stages.leadership.grades)for(const c of g.criteria)if(c.score>0)assert.ok(full[g.id].includes(c.evidence));proof.baselineUnchanged=true;
 const download=await api('candidate-materials',{token,roles:['pw-curator']});assert.ok(download.qr.includes('<svg'));const pdf=await api('material-pdf',null,{code:fixture.accessCode});assert.equal(pdf.subarray(0,4).toString(),'%PDF');proof.materialPDFAndQR=true;
 await api('admin-delete-candidate',{token,expectedName:fixture.candidateName});fixture=null;proof.disposableHistoryRemoved=true;
 await write(marker,{state:'complete',version:LEADERSHIP_VERSION,verifiedAt:Date.now(),proof});console.log('LEADER_MODULE_VERIFIED',JSON.stringify(proof));
 }catch(e){await write(marker,{state:'failed',version:LEADERSHIP_VERSION,failedAt:Date.now(),proof});throw e;}
 finally{if(fixture)await api('admin-delete-candidate',{token:fixture.token,expectedName:fixture.candidateName});}
}
