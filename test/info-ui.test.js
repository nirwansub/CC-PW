import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('info shows total time and separate ordered module cards with a temporary label',()=>{
 const result={};const context={document:{querySelector:s=>s==='#infoResult'?result:{addEventListener(){}}}};
 vm.createContext(context);vm.runInContext(readFileSync(new URL('../info.js',import.meta.url),'utf8'),context);
 const start=Date.parse('2026-10-08T10:40:00+07:00');
 context.renderInfo({candidateName:'QA',modules:Array.from({length:5},()=>({label:'CC · Creative'})),testMinutes:9,turnoverMinutes:1,schedule:{published:true,temporary:true,slots:[0,1].map(i=>({cohort:'Kloter 1',label:i?'CC · Executor':'CC · Creative',computer:35,startAt:start+i*600000,endAt:start+i*600000+540000,turnoverEndAt:start+(i+1)*600000,cohortStartAt:start,startMinute:i*10,endMinute:i*10+9}))}});
 assert.match(result.innerHTML,/50 menit total \(45 menit tes \+ 5 menit pergantian\)/);
 assert.match(result.innerHTML,/Jadwal sementara untuk trial/);
 assert.equal((result.innerHTML.match(/class="schedule-slot"/g)||[]).length,2);
 assert.match(result.innerHTML,/10[.:]40 WIB/);assert.match(result.innerHTML,/10[.:]50 WIB/);
 assert.match(result.innerHTML,/Modul 2 – CC · Executor/);assert.match(result.innerHTML,/Komputer 35/);
});
