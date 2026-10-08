import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
import {ROLES,CAPS,WEIGHTS,questionsFor} from '../lib/assessment.js';import{aggregate,routing}from'../lib/scoring.js';
function render(record){const elements=new Map();const element=()=>({value:'',innerHTML:'',classList:{add(){},remove(){}}});const doc={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:()=>[]};const context=vm.createContext({document:doc,Date,URLSearchParams,fetch(){throw new Error('Unexpected network');}});const source=fs.readFileSync(new URL('../admin.js',import.meta.url),'utf8').replace(/auth\(\)\.catch\([^\n]+\);/,'');vm.runInContext(source,context);context.fixture=record;context.cfg={roles:ROLES,caps:CAPS,weights:WEIGHTS};vm.runInContext('config=cfg;current=fixture;renderAssessment(fixture.record)',context);return elements.get('#detailContent').innerHTML;}
test('admin renders a replacement baseline without original pre-test and keeps legacy scores identifiable',()=>{
 const qs=questionsFor('comparison'),answers=Object.fromEntries(qs.map(q=>[q.id,'Verifikasi, langkah spesifik dan bukti.'])),grades=qs.map(q=>({id:q.id,criteria:q.criteria.map(c=>({cap:c.cap,score:3,confidence:.9})),flags:[]})),result=aggregate('comparison',answers,grades);
 const record={token:'test',preferences:[],stages:{comparison:{status:'submitted',answers,grades,result,grading:{status:'complete'},scoreHistory:[{at:0,reason:'fixture',previousResult:{roleFits:result.roleFits.map(x=>({...x,score:40}))}}]}},notes:''};
 const html=render({record,primaryAssessment:{source:'comparison',label:'Pendalaman pembanding',result},routing:routing(result),materials:{selected:[],released:false},roleResults:[]});assert.match(html,/Dasar hasil: Pendalaman pembanding/);assert.match(html,/10 soal/);assert.match(html,/Skor lama/);assert.match(html,/jawaban kosong dihitung 0/);assert.match(html,/Kecukupan bukti/);assert.doesNotMatch(html,/Soal yang tidak dijawab bernilai 0/);
});

test('admin shows leadership score separately from the universal baseline',async()=>{const {aggregateLeadership,LEADERSHIP}=await import('../lib/leadership.js');const answers=Object.fromEntries(LEADERSHIP.map(q=>[q.id,'Langkah spesifik.'])),grades=LEADERSHIP.map(q=>({id:q.id,criteria:q.criteria.map(c=>({cap:c.cap,score:3,confidence:.9})),flags:[]}));const record={token:'test',preferences:[],stages:{leadership:{status:'submitted',answers,grades,result:aggregateLeadership(answers,grades),grading:{status:'complete'}}},notes:''};const html=render({record,primaryAssessment:{source:'pre',label:'Pre-test diagnostik'},materials:{selected:[],released:false},roleResults:[]});assert.match(html,/Assessment Leader PW/);assert.match(html,/Skor kepemimpinan: 75/);assert.match(html,/4 soal/);assert.match(html,/Terpisah dari skor delapan posisi/);});

test('admin filters combine team and stage completion without treating automatic partial submits as complete',()=>{
 const elements=new Map(),doc={querySelector:s=>{if(!elements.has(s))elements.set(s,{value:'',checked:false,innerHTML:'',textContent:''});return elements.get(s)},querySelectorAll:()=>[]};
 const context=vm.createContext({document:doc,Date,URLSearchParams,fetch(){throw new Error('Filter must not call network');}});
 const source=fs.readFileSync(new URL('../admin.js',import.meta.url),'utf8').replace(/auth\(\)\.catch\([^\n]+\);/,'');vm.runInContext(source,context);
 const fixtures=[{token:'full',candidateName:'Full',currentTeam:'Marketing',shortlist:[],preferences:['cc-creative'],profileStatus:'saved',stages:{pre:{status:'terminated',answeredCount:32,grading:'complete'},comparison:{status:'submitted',answeredCount:10,grading:'complete',comparable:true}}},{token:'partial',candidateName:'Partial',currentTeam:'Marketing',shortlist:[],preferences:[],stages:{pre:{status:'terminated',answeredCount:16,grading:'complete'},comparison:{status:'active'}}},{token:'pending',candidateName:'Pending',currentTeam:'Design',shortlist:[],preferences:[],leaderTrack:true,stages:{comparison:{status:'submitted',answeredCount:10,grading:'pending'}}},{token:'new',candidateName:'New',shortlist:[],preferences:[],stages:{}}];
 context.fixtures=fixtures;context.cfg={roles:ROLES};vm.runInContext('records=fixtures;config=cfg;renderFilterOptions()',context);
 const check=(filters,expected)=>{for(const id of ['filterTeam','filterPre','filterComparison','filterLeadership','filterProfile','filterTrack','filterRole','filterReview'])doc.querySelector('#'+id).value=filters[id]||'';assert.deepEqual(Array.from(vm.runInContext('records.filter(matchesAdminFilters).map(r=>r.token)',context)),expected);};
 check({filterTeam:'Marketing',filterComparison:'complete'},['full']);check({filterPre:'partial'},['partial']);check({filterPre:'complete'},['full']);check({filterComparison:'pending_ai',filterTrack:'leader'},['pending']);check({filterComparison:'not_started'},['new']);check({filterProfile:'saved',filterRole:'cc-creative'},['full']);check({filterTeam:'__none__'},['new']);check({filterComparison:'active'},['partial']);
 check({},fixtures.map(r=>r.token));vm.runInContext('renderList()',context);assert.match(doc.querySelector('#filterCount').textContent,/Menampilkan 4 sesi/);assert.deepEqual(fixtures[1].stages.pre,{status:'terminated',answeredCount:16,grading:'complete'});
});

test('admin score sorting and ranges preserve missing values and compare the same role',()=>{
 const elements=new Map(),doc={querySelector:s=>{if(!elements.has(s))elements.set(s,{value:'',checked:false,innerHTML:'',textContent:''});return elements.get(s)},querySelectorAll:()=>[]};const ctx=vm.createContext({document:doc,Date,URLSearchParams,fetch(){throw new Error('Unexpected mutation');}});vm.runInContext(fs.readFileSync(new URL('../admin.js',import.meta.url),'utf8').replace(/auth\(\)\.catch\([^\n]+\);/,''),ctx);
 const fixtures=[{token:'z',candidateName:'Zeta',scoreSummary:{final:[{roleKey:'cc-creative',score:90},{roleKey:'cc-publicist',score:70}],pre:[{roleKey:'cc-creative',score:80},{roleKey:'cc-publicist',score:95}]}},{token:'a',candidateName:'Alpha',scoreSummary:{final:[{roleKey:'cc-creative',score:0}],pre:[{roleKey:'cc-creative',score:10}]}},{token:'b',candidateName:'Beta',scoreSummary:{final:[],pre:[]}}];ctx.fixtures=fixtures;
 doc.querySelector('#sortBy').value='score_asc';assert.deepEqual(Array.from(vm.runInContext('sortedRecords(fixtures).map(r=>r.token)',ctx)),['a','z','b']);doc.querySelector('#sortBy').value='score_desc';assert.deepEqual(Array.from(vm.runInContext('sortedRecords(fixtures).map(r=>r.token)',ctx)),['z','a','b']);assert.equal(vm.runInContext('listScore(fixtures[0]).delta',ctx),10);
 doc.querySelector('#scoreMin').value='0';doc.querySelector('#scoreMax').value='0';assert.deepEqual(Array.from(vm.runInContext('fixtures.filter(matchesScoreFilters).map(r=>r.token)',ctx)),['a']);doc.querySelector('#scoreMin').value='90';doc.querySelector('#scoreMax').value='100';assert.deepEqual(Array.from(vm.runInContext('fixtures.filter(matchesScoreFilters).map(r=>r.token)',ctx)),['z']);doc.querySelector('#scoreMax').value='80';assert.equal(vm.runInContext('scoreRange().valid',ctx),false);
 doc.querySelector('#scoreMin').value='';doc.querySelector('#scoreMax').value='';doc.querySelector('#filterTrend').value='up';assert.deepEqual(Array.from(vm.runInContext('fixtures.filter(matchesScoreFilters).map(r=>r.token)',ctx)),['z']);doc.querySelector('#scoreRole').value='cc-publicist';assert.equal(vm.runInContext('listScore(fixtures[0]).delta',ctx),-25);doc.querySelector('#filterTrend').value='down';assert.deepEqual(Array.from(vm.runInContext('fixtures.filter(matchesScoreFilters).map(r=>r.token)',ctx)),['z']);assert.equal(fixtures[0].scoreSummary.final[0].score,90);
});

test('participant table sorts numeric scores, hides columns and keeps compact labels',()=>{
 const elements=new Map(),doc={querySelector:s=>{if(!elements.has(s))elements.set(s,{value:'',innerHTML:'',textContent:'',disabled:false});return elements.get(s)},querySelectorAll:()=>[]};
 const ctx=vm.createContext({document:doc,Date,URLSearchParams,Set});
 vm.runInContext(fs.readFileSync(new URL('../admin.js',import.meta.url),'utf8').replace(/auth\(\)\.catch\([^\n]+\);/,''),ctx);
 ctx.cfg={roles:{'cc-executor':{team:'Corporate Communications',role:'Executor'},'pw-executor':{team:'People & Workplace',role:'Executor'}}};
 vm.runInContext('config=cfg',ctx);
 const fixture=(name,score)=>({name,code:name,team:'PW',selected:['cc-executor'],preferences:[],recommended:[],selectedSource:'candidate',preAnswers:32,comparisonAnswers:10,readCount:1,scores:{final:{roleScores:{'cc-executor':score},capabilityScores:{},model:'gpt'}},leaderCapability:{}});
 ctx.data={columns:{roles:['cc-executor','pw-executor'],capabilities:[],leaderCapabilities:[]},records:[fixture('B',9),fixture('A',80)]};
 vm.runInContext('tableData=data',ctx);doc.querySelector('#tableScoreVersion').value='final';vm.runInContext('renderParticipantTable()',ctx);
 assert.match(doc.querySelector('#participantTable').innerHTML,/scope="colgroup"/);
 assert.match(doc.querySelector('#participantTable').innerHTML,/CC · Executor/);
 assert.doesNotMatch(doc.querySelector('#participantTable').innerHTML,/Corporate Communications/);
 vm.runInContext("tableSort={key:'role:cc-executor',direction:'desc'};renderParticipantTable()",ctx);
 assert.ok(doc.querySelector('#participantTable').innerHTML.indexOf('>A</span>')<doc.querySelector('#participantTable').innerHTML.indexOf('>B</span>'));
 vm.runInContext("tableHidden.add('selected');renderParticipantTable()",ctx);
 assert.doesNotMatch(doc.querySelector('#participantTable').innerHTML,/Diambil/);
 assert.equal(doc.querySelector('#tableUnhide').disabled,false);
 vm.runInContext('tableHidden.clear();renderParticipantTable()',ctx);
 assert.match(doc.querySelector('#participantTable').innerHTML,/Diambil/);
});

test('rubric repair renders multiple escaped quotes, score reasons and old/new history only for admin',()=>{
 const source=fs.readFileSync(new URL('../admin.js',import.meta.url),'utf8').replace(/auth\(\)\.catch\([^\n]+\);/,'');
 const context=vm.createContext({document:{querySelector(){},querySelectorAll(){return[];}},Date,URLSearchParams});vm.runInContext(source,context);context.cfg={caps:CAPS,roles:ROLES};vm.runInContext('config=cfg',context);
 const cap=Object.keys(CAPS)[0];context.c={cap,score:2,confidence:.8,evidence:'<script>one</script>',evidenceQuotes:['<script>one</script>','Second quote'],fulfilled:['Pemeriksaan'],missing:['Tenggat'],rationale:'Sebagian bukti.'};
 const html=vm.runInContext('renderCriterion(c)',context);assert.match(html,/Alasan skor/);assert.match(html,/Terpenuhi/);assert.match(html,/Tenggat/);assert.match(html,/Second quote/);assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);
 context.s={grades:[{id:'cmp01',criteria:[context.c]}],evidenceRevision:{id:'fixture',status:'ready',createdAt:1,changes:[{id:'cmp01',cap,before:3,after:2,rationale:'Sebagian bukti.'}],evaluated:{grades:[{id:'cmp01',criteria:[context.c]}]}},reviewHistory:[{method:'evidence_repair',at:1,reason:'Fix',previousGrades:[{id:'cmp01',criteria:[{cap,score:3,confidence:.7,evidence:'1.'}]}]}]};
 const panel=vm.runInContext("evidenceRepairPanel('comparison',s)",context);assert.match(panel,/Lama/);assert.match(panel,/Baru/);assert.match(panel,/Terapkan usulan/);assert.match(panel,/Nilai sebelum perbaikan/);assert.match(panel,/bukan penggunaan AI oleh peserta/);
});

test('admin detail navigation ignores stale responses and only reads participant data',async()=>{
 const elements=new Map();
 const element=()=>{const classes=new Set();return{value:'',scrollTop:0,innerHTML:'',textContent:'',classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},setAttribute(){},removeAttribute(){},scrollIntoView(){},focus(){}};};
 const document={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s);},querySelectorAll:()=>[]};
 const pending=[],calls=[],scroll=[];const window={scrollY:720,matchMedia:()=>({matches:true}),scrollTo:o=>scroll.push(o.top)};
 const ctx=vm.createContext({document,window,Date,URLSearchParams,fetch:(url,options)=>{calls.push({url,options});return new Promise(resolve=>pending.push(data=>resolve({ok:true,json:async()=>data})));}});
 vm.runInContext(fs.readFileSync(new URL('../admin.js',import.meta.url),'utf8').replace(/auth\(\)\.catch\([^\n]+\);/,''),ctx);
 vm.runInContext("records=[{token:'first',candidateName:'First'},{token:'second',candidateName:'Second'}];renderList=()=>{};renderDetail=()=>{document.querySelector('#detail').textContent=current.record.candidateName;};focusDetail=()=>{}",ctx);
 const first=vm.runInContext("open('first')",ctx),second=vm.runInContext("open('second')",ctx);
 pending[1]({record:{candidateName:'Second'}});await second;pending[0]({record:{candidateName:'First'}});await first;
 assert.equal(document.querySelector('#detail').textContent,'Second');
 vm.runInContext('backToList()',ctx);assert.equal(document.querySelector('#results').classList.contains('detail-open'),false);assert.equal(scroll.at(-1),720);
 const third=vm.runInContext("open('first')",ctx);vm.runInContext('backToList()',ctx);pending[2]({record:{candidateName:'First'}});await third;
 assert.equal(document.querySelector('#results').classList.contains('detail-open'),false);assert.equal(document.querySelector('#detail').textContent,'Second');
 assert.equal(calls.length,3);assert.ok(calls.every(c=>c.url.startsWith('/api?action=admin-submissions&id=')&&!c.options?.method));
});


test('final score table keeps exactly twelve columns, highlights finished participants and preserves missing and zero values',()=>{
 const elements=new Map(),document={querySelector:s=>{if(!elements.has(s))elements.set(s,{value:'',innerHTML:'',textContent:''});return elements.get(s)},querySelectorAll:()=>[]};
 const ctx=vm.createContext({document,Date,URLSearchParams});vm.runInContext(fs.readFileSync(new URL('../admin.js',import.meta.url),'utf8').replace(/auth\(\)\.catch\([^\n]+\);/,''),ctx);
 ctx.data={columns:Object.keys(ROLES).map(roleKey=>({roleKey,label:ROLES[roleKey].role})),generatedAt:1,records:[{name:'Zeta',team:'PW',scores:{'cc-executor':0},average:0,leader:true,postComplete:true},{name:'<Pending>',team:'CC',scores:{},average:null,leader:false,postComplete:false}]};
 vm.runInContext('finalTableData=data;renderFinalTable()',ctx);let html=document.querySelector('#finalScoreTable').innerHTML;assert.equal((html.match(/scope="col"/g)||[]).length,12);assert.match(html,/scope="row" class="name-column"/);assert.match(html,/class="post-complete"/);assert.match(html,/class="post-pending"/);assert.match(html,/&lt;Pending&gt;/);assert.match(html,/<td>0<\/td>/);assert.match(html,/<td>—<\/td>/);assert.equal((html.match(/<td>✓<\/td>/g)||[]).length,1);
 vm.runInContext("finalTableSort={key:'cc-executor',direction:'desc'};renderFinalTable()",ctx);html=document.querySelector('#finalScoreTable').innerHTML;assert.ok(html.indexOf('>Zeta</span>')<html.indexOf('>&lt;Pending&gt;</span>'));
 document.querySelector('#finalTableSearch').value='CC';vm.runInContext('renderFinalTable()',ctx);assert.doesNotMatch(document.querySelector('#finalScoreTable').innerHTML,/>Zeta<\/span>/);
 const page=fs.readFileSync(new URL('../admin.html',import.meta.url),'utf8');assert.match(page,/tbody th\.name-column\{position:sticky;left:0/);assert.match(page,/final-summary-table \.table-columns th\{top:0/);assert.match(page,/id="participantTable"/);
});
