import crypto from 'node:crypto';
import {read,write,mutate,Conflict} from './storage.js';
const fail=(status,message)=>Object.assign(new Error(message),{status});
const codePath=code=>'access/v2-codes/'+code+'.json';
export async function reserveCode(token){
 for(let i=0;i<30;i++){const code=String(crypto.randomInt(100000,1000000));if(code===process.env.ADMIN_PASSWORD)continue;try{await write(codePath(code),{token,createdAt:Date.now()},null,{create:true});return code;}catch(e){if(!(e instanceof Conflict))throw e;}}
 throw fail(503,'Kode belum bisa dibuat. Coba lagi.');
}
export async function assignCode(token){let code;await mutate('assessments/v2/'+token+'.json',async r=>{r.accessCode??=await reserveCode(token);code=r.accessCode;});return code;}
export async function resolveCode(value,req){
 const code=String(value||'').trim();
 if(!/^[1-9]\d{5}$/.test(code))throw fail(400,'Masukkan kode peserta 6 digit.');
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const bucket=Math.floor(Date.now()/600000);const id=crypto.createHmac('sha256',process.env.ADMIN_SECRET).update(ip+'|'+bucket).digest('hex');const ratePath='access/v2-attempts/'+id+'.json';
 const rate=(await read(ratePath))?.value;
 if((rate?.failed||0)>=20)throw fail(429,'Terlalu banyak kode yang keliru. Coba lagi dalam 10 menit.');
 const entry=(await read(codePath(code)))?.value;const r=entry?(await read('assessments/v2/'+entry.token+'.json'))?.value:null;
 if(!r||r.accessCode!==code){
  try{await write(ratePath,{failed:1,createdAt:Date.now()},null,{create:true});}catch(e){if(!(e instanceof Conflict))throw e;await mutate(ratePath,r=>{r.failed++;});}
  throw fail(404,'Kode peserta tidak ditemukan. Periksa lagi kodenya.');
 }
 if(Date.now()>r.expiresAt&&!r.stages.pre)throw fail(410,'Kode peserta kedaluwarsa. Hubungi admin.');
 return entry.token;
}
