import crypto from 'node:crypto';import{readFile}from'node:fs/promises';
import{read,write,mutate,Conflict}from'../lib/storage.js';import{reserveCode}from'../lib/access.js';import{VERSION,DURATION}from'../lib/assessment.js';
export const LEADER_TRANSFER='settings/leader-invitation-transfer-20261002.json';
export function seal(publicKey,value){const key=crypto.randomBytes(32),iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return {wrappedKey:crypto.publicEncrypt({key:publicKey,oaepHash:'sha256'},key).toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')};}
export function unseal(privateKey,value){const key=crypto.privateDecrypt({key:privateKey,oaepHash:'sha256'},Buffer.from(value.wrappedKey,'base64')),decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(value.iv,'base64'));decipher.setAuthTag(Buffer.from(value.tag,'base64'));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(value.data,'base64')),decipher.final()]).toString('utf8'));}
export async function runLeaderBatch(){
 if(process.env.VERCEL_ENV!=='production')return;
 let transfer=(await read(LEADER_TRANSFER))?.value;
 if(!transfer){const keys=crypto.generateKeyPairSync('rsa',{modulusLength:3072,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});await write(LEADER_TRANSFER,{...keys,createdAt:Date.now()},null,{create:true});transfer=(await read(LEADER_TRANSFER)).value;}
 if(transfer.complete)return;
 let sealed;try{sealed=JSON.parse(await readFile(new URL('./leader-batch.encrypted.json',import.meta.url),'utf8'));}catch(e){if(e.code==='ENOENT')return;throw e;}
 const input=unseal(transfer.privateKey,sealed);if(input.id!=='leaders-20261002-6'||input.rows.length!==6||!input.replyPublicKey||input.rows.filter(r=>r.existingCode).length!==1)throw new Error('Manifest mismatch');
 const output=[];
 for(const row of input.rows){if(!row.name||row.name.length>150||!row.team||row.team.length>200||!/^[A-Za-z0-9_-]{32,64}$/.test(row.token))throw new Error('Invalid row');let token=row.token;
 if(row.existingCode){const mapping=(await read('access/v2-codes/'+row.existingCode+'.json'))?.value;if(!mapping)throw new Error('Existing code missing');token=mapping.token;}
 else{const ip='settings/leader-invitation-import-20261002/'+token+'.json';if(!(await read(ip)))await write(ip,{token},null,{create:true});await mutate(ip,async i=>{i.accessCode??=await reserveCode(token);});const intent=(await read(ip)).value,p='assessments/v2/'+token+'.json';if(!(await read(p))){const now=Date.now();await write(p,{token,accessCode:intent.accessCode,version:VERSION,candidateName:row.name,currentTeam:row.team,createdAt:now,expiresAt:now+168*3600000,duration:DURATION.pre,preferences:[],stages:{},profileStatus:'not_set',materialRead:{},notes:'',invitationBatch:input.id},null,{create:true});}}
 const p='assessments/v2/'+token+'.json',before=(await read(p)).value;if(before.candidateName!==row.name||before.currentTeam!==row.team||(row.existingCode&&before.accessCode!==row.existingCode))throw new Error('Identity mismatch');
 const preserve=structuredClone(before);delete preserve.leaderTrack;
 await mutate(p,r=>{if(r.candidateName!==row.name||r.currentTeam!==row.team)throw new Error('Identity changed');r.leaderTrack={enabled:true,updatedAt:Date.now()};});
 const actual=(await read(p)).value,mapping=(await read('access/v2-codes/'+actual.accessCode+'.json')).value,after=structuredClone(actual);delete after.leaderTrack;if(JSON.stringify(preserve)!==JSON.stringify(after)||mapping.token!==token||!actual.leaderTrack.enabled)throw new Error('Verification failed');
 output.push({name:row.name,team:row.team,code:actual.accessCode,existing:!!row.existingCode,leaderTrack:true});}
 if(new Set(output.map(r=>r.code)).size!==6)throw new Error('Duplicate code');await mutate(LEADER_TRANSFER,t=>{t.encryptedResult=seal(input.replyPublicKey,{id:input.id,verified:6,rows:output});t.complete=true;t.completedAt=Date.now();});console.log('LEADER_IMPORT_COMPLETE',JSON.stringify({verified:6,new:5,reused:1}));}
