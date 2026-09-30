import crypto from "crypto";
import {get,list,put} from "@vercel/blob";
import {ROLES,QUESTIONS,TRAIT_LABELS,CAPABILITY_TRAITS,ROLE_TRAIT_WEIGHTS} from "./data.js";

const json=(res,status,data)=>res.status(status).json(data);
const body=req=>typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{});
const uid=(n=18)=>crypto.randomBytes(n).toString("base64url");
const sign=v=>crypto.createHmac("sha256",process.env.ADMIN_SECRET||process.env.ADMIN_PASSWORD||"change-me").update(v).digest("hex");
const cookies=req=>Object.fromEntries(String(req.headers.cookie||"").split(";").map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf("=");return[decodeURIComponent(x.slice(0,i)),decodeURIComponent(x.slice(i+1))]}));
const isAdmin=req=>{const c=cookies(req).ansena_admin;if(!c)return false;const [v,s]=c.split(".");return v==="ok"&&s===sign("ok")};
const requireAdmin=(req,res)=>{if(!isAdmin(req)){json(res,401,{error:"Unauthorized"});return false}return true};
const putJson=(path,obj)=>put(path,JSON.stringify(obj),{access:"private",contentType:"application/json",allowOverwrite:true,addRandomSuffix:false});
async function getJson(path){
  const r=await get(path,{access:"private",useCache:false});
  if(!r||r.statusCode!==200)return null;
  return JSON.parse(await new Response(r.stream).text());
}
async function listJson(prefix){
  const {blobs=[]}=await list({prefix,limit:1000});
  const out=[]; for(const b of blobs){const v=await getJson(b.pathname);if(v)out.push(v)}
  return out;
}
const ipHash=req=>crypto.createHash("sha256").update(String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"").split(",")[0].trim()).digest("hex");
const query=(req,key)=>new URL(req.url,"https://local").searchParams.get(key)||"";
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

function finalize(session,answers={},extra={}){
  const qs=QUESTIONS[session.roleKey]||[]; let correct=0; const tags={}; const answerRows=[];
  for(const q of qs){
    const selected=Number(answers[q.id]); const ok=selected===q.a; if(ok)correct++;
    for(const t of q.t){tags[t]??={correct:0,total:0};tags[t].total++;if(ok)tags[t].correct++}
    answerRows.push({id:q.id,selected:Number.isFinite(selected)?selected:null,correct:ok});
  }
  const score=Math.round(correct/Math.max(qs.length,1)*100);
  const capability=Object.entries(tags).map(([k,v])=>({key:k,label:TRAIT_LABELS[k]||k,score:Math.round(v.correct/v.total*100),correct:v.correct,total:v.total})).sort((a,b)=>b.score-a.score);
  const band=score>=88?"Strong fit":score>=75?"Fit":score>=60?"Bisa dikembangkan":"Belum cocok";
  const r=ROLES[session.roleKey];
  return {submissionId:session.sessionId,sessionId:session.sessionId,inviteToken:session.inviteToken,candidateName:session.candidateName,identity:session.identity,roleKey:session.roleKey,team:r.team,role:r.role,startedAt:session.startedAt,finishedAt:Date.now(),durationSeconds:Math.max(0,Math.round((Date.now()-session.startedAt)/1000)),score,correct,total:qs.length,band,capability,answers:answerRows,securityEvents:session.securityEvents||[],terminated:Boolean(extra.terminated),terminationReason:extra.terminationReason||null};
}

async function handleInvite(req,res){
  const token=query(req,"token"); if(!token)return json(res,400,{error:"Token kosong"});
  const inv=await getJson("invites/"+token+".json"); if(!inv)return json(res,404,{error:"Undangan tidak ditemukan"});
  if(Date.now()>inv.expiresAt)return json(res,410,{error:"Undangan kedaluwarsa"});
  const r=ROLES[inv.roleKey]; return json(res,200,{candidateName:inv.candidateName,roleKey:inv.roleKey,team:r.team,role:r.role,duration:inv.duration,status:inv.status});
}
async function handleStart(req,res){
  const {token,identity={}}=body(req); const inv=await getJson("invites/"+token+".json");
  if(!inv)return json(res,404,{error:"Undangan tidak ditemukan"});
  if(Date.now()>inv.expiresAt)return json(res,410,{error:"Undangan kedaluwarsa"});
  if(inv.status!=="ready")return json(res,409,{error:"Undangan sudah digunakan / tes sudah dimulai"});
  const role=ROLES[inv.roleKey]; if(!role)return json(res,400,{error:"Role invalid"});
  const sessionId=uid(20),now=Date.now();
  const session={sessionId,inviteToken:token,roleKey:inv.roleKey,candidateName:inv.candidateName||String(identity.name||"").trim(),identity:{name:String(identity.name||inv.candidateName||"").trim(),contact:String(identity.contact||"").trim(),currentRole:String(identity.currentRole||"").trim()},duration:inv.duration,startedAt:now,expiresAt:now+inv.duration*60000,status:"active",securityEvents:[],ipHash:ipHash(req),userAgent:String(req.headers["user-agent"]||"")};
  inv.status="started";inv.sessionId=sessionId;inv.startedAt=now;
  await Promise.all([putJson("sessions/"+sessionId+".json",session),putJson("invites/"+token+".json",inv)]);
  return json(res,200,{sessionId,roleKey:inv.roleKey,team:role.team,role:role.role,duration:inv.duration,startedAt:now,expiresAt:session.expiresAt,candidateName:session.candidateName});
}
async function handleQuiz(req,res){
  const sessionId=query(req,"session"),s=await getJson("sessions/"+sessionId+".json");
  if(!s||s.status!=="active")return json(res,403,{error:"Session tidak aktif"});
  if(Date.now()>s.expiresAt)return json(res,410,{error:"Waktu tes habis"});
  const questions=shuffle(QUESTIONS[s.roleKey]||[]).map(q=>({id:q.id,q:q.q,options:shuffle(q.o.map((text,id)=>({id,text})))}));
  const r=ROLES[s.roleKey]; return json(res,200,{roleKey:s.roleKey,team:r.team,role:r.role,questions,expiresAt:s.expiresAt});
}
async function closeSession(req,res,terminated){
  const {sessionId,answers={},type}=body(req),s=await getJson("sessions/"+sessionId+".json");
  if(!s)return json(res,404,{error:"Session tidak ditemukan"});
  if(s.status!=="active")return json(res,200,{ok:true,already:true});
  if(terminated)s.securityEvents.push({type:type||"security_violation",at:Date.now()});
  const timedOut=Date.now()>s.expiresAt;
  const result=finalize(s,answers,{terminated:terminated||timedOut,terminationReason:terminated?(type||"security_violation"):(timedOut?"time_expired":null)});
  s.status=result.terminated?"terminated":"completed";s.finishedAt=result.finishedAt;
  const inv=await getJson("invites/"+s.inviteToken+".json"); if(inv){inv.status="completed";inv.completedAt=result.finishedAt}
  await Promise.all([putJson("sessions/"+sessionId+".json",s),putJson("submissions/"+sessionId+".json",result),inv?putJson("invites/"+s.inviteToken+".json",inv):Promise.resolve()]);
  return json(res,200,{ok:true});
}
async function handleAdminLogin(req,res){
  const {password}=body(req);
  if(!process.env.ADMIN_PASSWORD)return json(res,500,{error:"ADMIN_PASSWORD belum diset"});
  if(String(password)!==String(process.env.ADMIN_PASSWORD))return json(res,401,{error:"Password salah"});
  res.setHeader("Set-Cookie","ansena_admin=ok."+sign("ok")+"; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800");
  return json(res,200,{ok:true});
}
async function handleAdminInvite(req,res){
  if(!requireAdmin(req,res))return;
  const {candidateName,roleKey,duration,expiresHours}=body(req);
  if(!String(candidateName||"").trim())return json(res,400,{error:"Nama kandidat wajib"});
  if(!ROLES[roleKey])return json(res,400,{error:"Role invalid"});
  const token=uid(18),now=Date.now();
  const invite={token,candidateName:String(candidateName).trim(),roleKey,duration:Math.max(5,Math.min(90,Number(duration)||ROLES[roleKey].duration)),createdAt:now,expiresAt:now+Math.max(1,Math.min(720,Number(expiresHours)||168))*3600000,status:"ready"};
  await putJson("invites/"+token+".json",invite); return json(res,200,{invite});
}
async function handleAdminSubmissions(req,res){
  if(!requireAdmin(req,res))return;
  const id=query(req,"id");
  if(id){const submission=await getJson("submissions/"+id+".json");if(!submission)return json(res,404,{error:"Tidak ditemukan"});const review=await getJson("reviews/"+id+".json");return json(res,200,{submission,review})}
  const all=await listJson("submissions/");all.sort((a,b)=>b.finishedAt-a.finishedAt);
  return json(res,200,{submissions:all.map(x=>({submissionId:x.submissionId,candidateName:x.candidateName,identity:x.identity,team:x.team,role:x.role,roleKey:x.roleKey,score:x.score,band:x.band,finishedAt:x.finishedAt,terminated:x.terminated,terminationReason:x.terminationReason,securityEvents:x.securityEvents}))});
}
async function handleAdminReview(req,res){
  if(!requireAdmin(req,res))return;
  const {submissionId,ratings={},notes=""}=body(req);if(!submissionId)return json(res,400,{error:"submissionId kosong"});
  const review={submissionId,ratings,notes:String(notes),updatedAt:Date.now()};await putJson("reviews/"+submissionId+".json",review);return json(res,200,{ok:true,review});
}

export default async function handler(req,res){
  try{
    const action=query(req,"action");
    if(action==="invite"&&req.method==="GET")return handleInvite(req,res);
    if(action==="start"&&req.method==="POST")return handleStart(req,res);
    if(action==="quiz"&&req.method==="GET")return handleQuiz(req,res);
    if(action==="submit"&&req.method==="POST")return closeSession(req,res,false);
    if(action==="violation"&&req.method==="POST")return closeSession(req,res,true);
    if(action==="admin-me")return json(res,200,{authenticated:isAdmin(req)});
    if(action==="admin-login"&&req.method==="POST")return handleAdminLogin(req,res);
    if(action==="admin-logout"&&req.method==="POST"){res.setHeader("Set-Cookie","ansena_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");return json(res,200,{ok:true})}
    if(action==="admin-config"){if(!requireAdmin(req,res))return;return json(res,200,{roles:ROLES,traits:CAPABILITY_TRAITS,weights:ROLE_TRAIT_WEIGHTS})}
    if(action==="admin-invite"&&req.method==="POST")return handleAdminInvite(req,res);
    if(action==="admin-submissions")return handleAdminSubmissions(req,res);
    if(action==="admin-review"&&req.method==="POST")return handleAdminReview(req,res);
    return json(res,404,{error:"Unknown action"});
  }catch(e){console.error(e);return json(res,500,{error:"Server error",detail:process.env.NODE_ENV==="development"?String(e?.message||e):undefined})}
}
