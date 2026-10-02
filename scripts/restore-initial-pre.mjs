import assert from 'node:assert/strict';
import handler from '../api/index.js';
import {read,write,mutate,remove} from '../lib/storage.js';
import {reserveCode} from '../lib/access.js';
import crypto from 'node:crypto';
const marker='settings/initial-pre-restored-20261002.json';
export async function restoreInitialPre(){
 if(process.env.VERCEL_ENV!=='production'||(await read(marker))?.value?.state==='complete')return;
 await mutate('settings/v3-operations.json',o=>{o.initialPreRequired=true;});
 const token=crypto.randomBytes(24).toString('base64url'),code=await reserveCode(token),p='assessments/v2/'+token+'.json';
 const api=async(action,data,params={})=>{const req={url:'/api?'+new URLSearchParams({action,...params}),method:data?'POST':'GET',body:data,headers:{host:'cc-pw.vercel.app'}},res={code:200,status(n){this.code=n;return this;},json(v){this.value=v;return this;},setHeader(){}};await handler(req,res);return res;};
 try{
 await write(p,{token,accessCode:code,candidateName:'QA initial pre restore',expiresAt:Date.now()+86400000,preferences:[],stages:{},profileStatus:'not_set',materialRead:{},adminVisibility:{hidden:true}},null,{create:true});
 assert.equal((await api('invite',null,{token})).value.initialPreRequired,true);
 assert.equal((await api('start',{token,stage:'comparison',consent:true})).code,409);
 const pre=await api('start',{token,stage:'pre',identity:{name:'QA initial pre restore',contact:'qa@example.invalid'},preferences:['pw-curator']});
 assert.equal(pre.code,200);assert.equal(pre.value.questions.length,32);assert.equal(pre.value.expiresAt-pre.value.serverNow<=900000,true);
 await mutate(p,r=>{r.stages.pre.status='terminated';r.stages.pre.terminationReason='time_expired';});
 const common=await api('start',{token,stage:'comparison',consent:true});assert.equal(common.code,200);assert.equal(common.value.questions.length,10);assert.equal(common.value.expiresAt,null);
 assert.equal((await api('invite',null,{token})).value.initialPreRequired,false);
 assert.equal((await read('settings/v3-operations.json')).value.postTestsLocked,true);
 }finally{await remove(p);await remove('access/v2-codes/'+code+'.json');}
 await write(marker,{state:'complete',completedAt:Date.now(),proof:{initial32:true,thenUntimed10:true,partialPreContinues:true,postLocked:true,fixtureCleaned:true}});
 console.log('INITIAL_PRE_RESTORED_VERIFIED');
}
