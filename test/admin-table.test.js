import test from 'node:test';
import assert from 'node:assert/strict';
import {tableParticipant} from '../lib/admin-table.js';

const result=n=>({complete:true,comparable:true,roleFits:[{roleKey:'cc-executor',score:n},{roleKey:'pw-executor',score:n-2}],capability:[{key:'execution',score:n}]});
test('participant table uses released participant selections and saved grading versions',()=>{
 const r={token:'fixture',candidateName:'Peserta',currentTeam:'PW',accessCode:'123456',preferences:['cc-executor'],materialSelection:{roles:['cc-executor','pw-executor'],releasedAt:200,source:'candidate'},materialRead:{'cc-executor':true},stages:{
  pre:{grading:{status:'complete',model:'new-pre'},result:result(70),answers:{pre01:1},scoreHistory:[{at:10,previousGrading:{status:'complete',model:'old-pre'},previousResult:result(40)}]},
  comparison:{status:'submitted',grading:{status:'complete',model:'new-model',calibrationBatch:'humanis-20261005',gradedAt:300},result:result(85),answers:{cmp01:'text'},reviewHistory:[{at:250,method:'model_calibration',previousResult:result(60),previousGrading:{status:'complete',model:'old-model'}}]}
 }};
 const x=tableParticipant(r);assert.deepEqual(x.selected,['cc-executor','pw-executor']);assert.equal(x.scores.final.roleScores['cc-executor'],85);assert.equal(x.scores.beforeCalibration.roleScores['cc-executor'],60);assert.equal(x.scores.comparisonFirst.model,'old-model');assert.equal(x.scores.preFirst.roleScores['cc-executor'],40);assert.equal(x.scores.preCurrent.model,'new-pre');assert.equal(x.calibrationAt,300);assert.equal(x.readCount,1);
 assert.equal(tableParticipant({...r,materialSelection:{roles:['cc-executor'],releasedAt:null}}),null);
 assert.equal(tableParticipant({...r,stages:{...r.stages,comparison:{...r.stages.comparison,grading:{status:'pending'}}}}),null);
});
