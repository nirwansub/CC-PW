import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePostSchedule,participantPostInfo} from '../lib/post-schedule.js';
const r={candidateName:'QA',token:'private-token',materialSelection:{releasedAt:1,roles:['cc-executor','pw-executor']},stages:{}};
const startAt=Date.parse('2026-10-08T08:00:00+07:00');
const input={location:'Ruang tes',slots:[{roleKey:'cc-executor',cohort:'Kloter 1',computer:3,cohortStartAt:startAt,startAt},{roleKey:'pw-executor',cohort:'Kloter 1',computer:3,cohortStartAt:startAt,startAt:startAt+900000}]};
test('post schedule publishes chosen modules with thirteen-minute tests and two-minute turnovers',()=>{
 const schedule=validatePostSchedule(r,input),info=participantPostInfo({...r,postSchedule:schedule});
 assert.equal(info.schedule.published,true);assert.equal(info.schedule.slots[0].endAt-startAt,780000);assert.equal(info.schedule.slots[1].startMinute,15);assert.equal(info.schedule.slots[1].endMinute,28);assert.equal(info.schedule.slots[0].computer,3);
 assert.equal(JSON.stringify(info).includes('private-token'),false);
 assert.equal(participantPostInfo(r).schedule.published,false);
 assert.equal(participantPostInfo({...r,postSchedule:schedule,materialSelection:{releasedAt:1,roles:['cc-executor']}}).schedule.published,false);
});
test('schedule rejects missing, repeated, unexpected and overlapping modules',()=>{
 assert.throws(()=>validatePostSchedule(r,{slots:input.slots.slice(0,1)}));
 assert.throws(()=>validatePostSchedule(r,{slots:[input.slots[0],input.slots[0]]}));
 assert.throws(()=>validatePostSchedule(r,{slots:[input.slots[0],{...input.slots[1],roleKey:'pw-curator'}]}));
 assert.throws(()=>validatePostSchedule(r,{slots:[input.slots[0],{...input.slots[1],startAt}]}));
});

test('temporary schedule remains explicitly marked for participants',()=>{
 const schedule=validatePostSchedule(r,{...input,temporary:true});
 assert.equal(participantPostInfo({...r,postSchedule:schedule}).schedule.temporary,true);
 assert.throws(()=>validatePostSchedule(r,{...input,temporary:'yes'}));
});

test('three or more modules retain nine-minute timing',()=>{const a={...r,materialSelection:{releasedAt:1,roles:['cc-executor','pw-executor','pw-curator']}};const slots=a.materialSelection.roles.map((roleKey,i)=>({...input.slots[0],roleKey,startAt:startAt+i*600000}));const info=participantPostInfo({...a,postSchedule:validatePostSchedule(a,{slots})});assert.equal(info.testMinutes,9);assert.equal(info.turnoverMinutes,1);assert.equal(info.schedule.slots[2].endMinute,29);});
