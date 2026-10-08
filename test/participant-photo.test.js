import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {matchParticipantPhoto} from '../lib/participant-photo.js';
const dir=[{name:'Bayu Agus Saputro',team:'Team Marketing',url:'https://acc.nsansena.com/public/employee/bayu.jpg'},{name:'Bayu Rizqi Sukma',team:'Team Audit Performa',url:'https://acc.nsansena.com/public/employee/bayu2.jpg'},{name:'Jessica Dinar Narani',team:'Team Marketing',url:'https://acc.nsansena.com/public/employee/jessica.jpg'}];
test('photo matching uses exact or unambiguous abbreviated names, team breaks ties and unknown names stay missing',()=>{
 assert.equal(matchParticipantPhoto('  BAYU AGUS SAPUTRO ','Marketing',dir).name,'Bayu Agus Saputro');
 assert.equal(matchParticipantPhoto('Jessica Dinar N','Marketing',dir).name,'Jessica Dinar Narani');
 assert.equal(matchParticipantPhoto('Bayu','',dir),null);assert.equal(matchParticipantPhoto('Bayu','SP',dir).name,'Bayu Rizqi Sukma');assert.equal(matchParticipantPhoto('Jessica Dinar X','Marketing',dir),null);
 const duplicate=[{...dir[0],name:'Identical'},{...dir[1],name:'Identical'}];assert.equal(matchParticipantPhoto('Identical','Audit Performa',duplicate).url,dir[1].url);assert.equal(matchParticipantPhoto('Identical','',duplicate),null);
 assert.equal(matchParticipantPhoto('Jessica Dinar Narani','',[{...dir[2],url:'javascript:alert(1)'}]),null);
});
test('portrait markup escapes identities, rejects unsafe sources and failed images reveal initials',()=>{
 let listener;const window={},document={addEventListener:(event,fn)=>{assert.equal(event,'error');listener=fn;}};vm.runInNewContext(fs.readFileSync(new URL('../participant-photo.js',import.meta.url),'utf8'),{window,document});
 const html=window.participantPhotoMarkup(dir[0],'<Bayu> Agus','large');assert.match(html,/avatar-large/);assert.match(html,/&lt;Bayu&gt;/);assert.match(html,/referrerpolicy="no-referrer"/);assert.doesNotMatch(html,/<Bayu>/);
 assert.doesNotMatch(window.participantPhotoMarkup({url:'javascript:alert(1)'},'Unknown'),/<img/);let removed=false;listener({target:{matches:()=>true,remove:()=>removed=true}});assert.equal(removed,true);
});
test('recommendation portraits render between rank and participant name and empty-state spans eight columns',()=>{
 const elements=new Map(),document={querySelector:s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',hidden:false,addEventListener(){}});return elements.get(s)}};
 const ctx=vm.createContext({document,window:{participantPhotoMarkup:()=>'<img class="fixture-portrait">'},Set});
 vm.runInContext(fs.readFileSync(new URL('../admin-rekomendasi.js',import.meta.url),'utf8').replace(/\nload\(\);\s*$/,''),ctx);
 ctx.fixture={roleKey:'cc-executor',label:'CC Executor',candidates:[{name:'Example',rank:1,selected:true,manual:null,pre:50,comparison:60,post:70,final:62.5,answered:6,total:6}]};
 vm.runInContext("positions=[fixture];activeRole='cc-executor';render()",ctx);
 const html=document.querySelector('#rankingRows').innerHTML;assert.match(html,/<td>1<\/td><td class="photo-column"><img class="fixture-portrait"><\/td><td class="name">/);
 vm.runInContext('positions[0].candidates=[];render()',ctx);assert.match(document.querySelector('#rankingRows').innerHTML,/colspan="8"/);
});
