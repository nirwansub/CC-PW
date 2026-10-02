// Authorized one-time import: only encrypted payloads enter the public repository.
import crypto from 'node:crypto';import{readFile}from'node:fs/promises';
import{read,write,mutate,Conflict}from'../lib/storage.js';import{reserveCode}from'../lib/access.js';import{VERSION,DURATION}from'../lib/assessment.js';
export const INVITATION_TRANSFER='settings/invitation-transfer-20261002-1139.json';
export function seal(publicKey,value){const key=crypto.randomBytes(32),iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return {wrappedKey:crypto.publicEncrypt({key:publicKey,oaepHash:'sha256'},key).toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')};}
export function unseal(privateKey,value){const key=crypto.privateDecrypt({key:privateKey,oaepHash:'sha256'},Buffer.from(value.wrappedKey,'base64')),decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(value.iv,'base64'));decipher.setAuthTag(Buffer.from(value.tag,'base64'));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(value.data,'base64')),decipher.final()]).toString('utf8'));}
export async function runInvitationBatch(){
 if(process.env.VERCEL_ENV!=='production')return;
 let transfer=(await read(INVITATION_TRANSFER))?.value;
 if(!transfer){const keys=crypto.generateKeyPairSync('rsa',{modulusLength:3072,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});await write(INVITATION_TRANSFER,{...keys,createdAt:Date.now()},null,{create:true});transfer=(await read(INVITATION_TRANSFER)).value;}
 if(transfer.complete)return;
 let sealed;try{sealed=JSON.parse(await readFile(new URL('./new-invitations.encrypted.json',import.meta.url),'utf8'));}catch(e){if(e.code==='ENOENT')return;throw e;}
 const input=unseal(transfer.privateKey,sealed);if(input.id!=='invites-20261002-19-1139'||input.rows.length!==19||!input.replyPublicKey)throw new Error('Import manifest mismatch');
 if(new Set(input.rows.map(r=>r.token)).size!==19||input.rows.some(r=>!r.name||r.name.length>150||!r.team||r.team.length>200||!/^[A-Za-z0-9_-]{32,64}$/.test(r.token)))throw new Error('Import rows invalid');
 const output=[];for(const row of input.rows){const intentPath='settings/invitation-import-20261002-1139/'+row.token+'.json';if(!(await read(intentPath))){try{await write(intentPath,{token:row.token},null,{create:true});}catch(e){if(!(e instanceof Conflict))throw e;}}
 await mutate(intentPath,async intent=>{intent.accessCode??=await reserveCode(row.token);});const intent=(await read(intentPath)).value,p='assessments/v2/'+row.token+'.json';if(!(await read(p))){const now=Date.now();try{await write(p,{token:row.token,accessCode:intent.accessCode,version:VERSION,candidateName:row.name,currentTeam:row.team,createdAt:now,expiresAt:now+168*3600000,duration:DURATION.pre,preferences:[],stages:{},profileStatus:'not_set',materialRead:{},notes:'',invitationBatch:input.id},null,{create:true});}catch(e){if(!(e instanceof Conflict))throw e;}}
 const actual=(await read(p)).value,code=(await read('access/v2-codes/'+actual.accessCode+'.json')).value;if(actual.candidateName!==row.name||actual.currentTeam!==row.team||actual.accessCode!==intent.accessCode||code.token!==row.token)throw new Error('Import identity verification failed');output.push({name:row.name,team:row.team,code:actual.accessCode});}
 if(new Set(output.map(r=>r.code)).size!==19)throw new Error('Import duplicate codes');await mutate(INVITATION_TRANSFER,t=>{t.encryptedResult=seal(input.replyPublicKey,{id:input.id,verified:19,rows:output});t.complete=true;t.completedAt=Date.now();});console.log('INVITATION_IMPORT_COMPLETE',JSON.stringify({verified:19}));
}
