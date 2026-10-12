import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
test('Leader PW is separate from eight position cards and new-potential filter excludes original applicants without changing ranking',()=>{
 const elements=new Map(),document={querySelector:s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false,setAttribute(){},addEventListener(){}});return elements.get(s)}};
 const ctx=vm.createContext({document,window:{participantPhotoMarkup:()=>''},Set});vm.runInContext(fs.readFileSync(new URL('../admin-rekomendasi.js',import.meta.url),'utf8').replace(/\nload\(\);\s*$/,''),ctx);
 ctx.fixture={token:'fixture',name:'<New candidate>',code:'123',team:'A',status:'ready',category:'potential',selected:false,manual:null,originalApplicant:false,pwAverage:55,pwCount:1,pwScores:{},leadershipScore:null,directCaps:[],analysis:null,subscores:[],profile:{}};
 document.querySelector('#leaderFilter').value='new';vm.runInContext("positions=Array.from({length:8},(_,i)=>({roleKey:'role'+i,label:'Role '+i,candidates:[]}));leaders=[fixture,{...fixture,token:'original',name:'Original',originalApplicant:true}];activeRole='leader-pw';render()",ctx);
 assert.equal((document.querySelector('#positionCards').innerHTML.match(/data-role=/g)||[]).length,8);assert.match(document.querySelector('#leaderCardSlot').innerHTML,/Leader PW/);assert.match(document.querySelector('#leaderRows').innerHTML,/&lt;New candidate&gt;/);assert.doesNotMatch(document.querySelector('#leaderRows').innerHTML,/Original/);assert.equal(document.querySelector('#ranking').hidden,true);assert.equal(document.querySelector('#leaderPanel').hidden,false);
 document.querySelector('#leaderFilter').value='original';vm.runInContext('renderLeaders()',ctx);assert.match(document.querySelector('#leaderRows').innerHTML,/Original/);assert.doesNotMatch(document.querySelector('#leaderRows').innerHTML,/&lt;New candidate&gt;/);
});

test('position ranking labels assumed scores and leaves post-test blank',()=>{
 const elements=new Map(),document={querySelector:s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false,setAttribute(){},addEventListener(){}});return elements.get(s)}};
 const ctx=vm.createContext({document,window:{participantPhotoMarkup:()=>''},Set});vm.runInContext(fs.readFileSync(new URL('../admin-rekomendasi.js',import.meta.url),'utf8').replace(/\nload\(\);\s*$/,''),ctx);
 vm.runInContext("positions=[{roleKey:'pw-executor',label:'PW E',candidates:[{token:'pending',name:'Pending',rank:1,code:'123',team:'A',pre:60,comparison:80,post:null,final:60,provisional:true,assumedPostScore:50,selected:true,manual:null,answered:0,total:6}]}];activeRole='pw-executor';render()",ctx);
 const html=document.querySelector('#rankingRows').innerHTML;assert.match(html,/Nilai sementara · asumsi post-test 50/);assert.match(html,/<td class="number">—<\/td>/);assert.match(html,/60<br><span class="small">sementara/);assert.doesNotMatch(html,/0\/6 soal/);assert.match(document.querySelector('#positionCards').innerHTML,/0 hasil dinilai · 1 sementara/);
});
