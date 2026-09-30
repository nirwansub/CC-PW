const $=s=>document.querySelector(s);
const api=async(action,opt={})=>{
  const r=await fetch("/api/index?action="+action,opt);
  let j={}; try{j=await r.json()}catch{}
  if(!r.ok) throw new Error(j.error||"Terjadi kesalahan");
  return j;
};
let invite=null,sessionId=null,quiz=null,answers={},active=false,finished=false,armAt=0,timerHandle=null;

function tokenFrom(v){
  v=String(v||"").trim();
  const m=v.match(/[?&]invite=([^&]+)/);
  return m?decodeURIComponent(m[1]):v;
}
function msg(el,text,cls="danger"){el.innerHTML="<p class='"+cls+"'>"+String(text).replace(/[<>&]/g,m=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[m]))+"</p>"}
async function loadInvite(token){
  invite=await api("invite&token="+encodeURIComponent(token));
  $("#landing").classList.add("hidden");
  $("#gate").classList.remove("hidden");
  $("#gateName").textContent=invite.candidateName||"Candidate";
  $("#gateRole").textContent=invite.team+" · "+invite.role;
  $("#gateMeta").textContent="Durasi "+invite.duration+" menit · Status undangan: "+invite.status;
  $("#identityName").value=invite.candidateName||"";
}
$("#openInvite").onclick=()=>loadInvite(tokenFrom($("#inviteInput").value)).catch(e=>msg($("#landingMsg"),e.message));
const direct=new URLSearchParams(location.search).get("invite"); if(direct) loadInvite(direct).catch(e=>msg($("#landingMsg"),e.message));

function lockPage(){
  document.body.classList.add("no-select");
  ["copy","cut","paste","contextmenu","selectstart","dragstart"].forEach(ev=>document.addEventListener(ev,e=>{if(active)e.preventDefault()}));
  document.addEventListener("keydown",e=>{
    if(!active)return;
    const k=e.key.toLowerCase(), mod=e.ctrlKey||e.metaKey;
    if(e.key==="F12"||e.key==="PrintScreen"||(mod&&["c","v","x","a","p","s","u","r"].includes(k))){e.preventDefault();e.stopPropagation()}
  },true);
}
lockPage();

async function enterFullscreen(){
  if(!document.fullscreenElement){
    if(!document.documentElement.requestFullscreen) throw new Error("Browser ini tidak mendukung fullscreen wajib. Gunakan Chrome/Edge desktop.");
    await document.documentElement.requestFullscreen();
  }
}
$("#startBtn").onclick=async()=>{
  try{
    if(!invite) throw new Error("Undangan belum dimuat.");
    if(!$("#identityName").value.trim()) throw new Error("Nama lengkap wajib diisi.");
    await enterFullscreen();
    const r=await api("start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      token:tokenFrom(direct||$("#inviteInput").value),
      identity:{name:$("#identityName").value.trim(),contact:$("#identityContact").value.trim(),currentRole:$("#identityCurrentRole").value.trim()}
    })});
    sessionId=r.sessionId;
    sessionStorage.setItem("ansena_session",sessionId);
    quiz=await api("quiz&session="+encodeURIComponent(sessionId));
    active=true; armAt=Date.now()+1500;
    $("#gate").classList.add("hidden"); $("#exam").classList.remove("hidden");
    $("#examRole").textContent=quiz.team+" · "+quiz.role;
    $("#examCandidate").textContent=r.candidateName||$("#identityName").value.trim();
    renderQuiz(); startTimer(quiz.expiresAt);
  }catch(e){
    try{if(document.fullscreenElement)await document.exitFullscreen()}catch{}
    msg($("#gateMsg"),e.message);
  }
};

function renderQuiz(){
  $("#questions").innerHTML=quiz.questions.map((q,i)=>{
    const opts=q.options.map(o=>"<label class='option'><input type='radio' name='"+q.id+"' value='"+o.id+"'>"+(String.fromCharCode(65+q.options.indexOf(o)))+". "+esc(o.text)+"</label>").join("");
    return "<section class='card question'><div class='small muted'>QUESTION "+(i+1)+" / "+quiz.questions.length+"</div><h3>"+esc(q.q)+"</h3>"+opts+"</section>";
  }).join("");
  document.querySelectorAll("#questions input").forEach(inp=>inp.onchange=()=>{
    answers[inp.name]=Number(inp.value); updateProgress();
  });
  updateProgress();
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function updateProgress(){
  const n=Object.keys(answers).length,total=quiz?.questions.length||1;
  $("#progress").style.width=Math.round(n/total*100)+"%";
  $("#answered").textContent=n+" dari "+total+" dijawab";
}
function startTimer(expiresAt){
  const tick=()=>{
    const ms=Math.max(0,expiresAt-Date.now());
    const sec=Math.ceil(ms/1000),m=Math.floor(sec/60),s=sec%60;
    $("#timer").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    if(ms<=0){clearInterval(timerHandle);submit(true,"time_expired")}
  };
  tick(); timerHandle=setInterval(tick,500);
}
$("#submitBtn").onclick=()=>submit(false,null);

async function submit(terminated,reason){
  if(finished||!sessionId)return;
  finished=true; active=false; clearInterval(timerHandle);
  try{
    const endpoint=terminated?"violation":"submit";
    await api(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId,answers,type:reason||undefined})});
  }catch{}
  try{if(document.fullscreenElement)await document.exitFullscreen()}catch{}
  $("#exam").classList.add("hidden"); $("#finished").classList.remove("hidden");
  $("#finishTitle").textContent=terminated?"Assessment diakhiri":"Assessment selesai";
  $("#finishText").textContent=terminated?"Sistem mendeteksi pelanggaran mode tes ("+(reason||"security")+"). Jawaban sampai titik ini telah tersimpan.":"Jawaban sudah tersimpan. Hasil akan dilihat oleh admin.";
  sessionStorage.removeItem("ansena_session");
}
function shouldTerminate(){return active&&!finished&&Date.now()>=armAt}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&shouldTerminate())submit(true,"tab_or_app_switch")});
window.addEventListener("blur",()=>{if(shouldTerminate())setTimeout(()=>{if(shouldTerminate()&&!document.hasFocus())submit(true,"window_focus_lost")},180)});
document.addEventListener("fullscreenchange",()=>{if(shouldTerminate()&&!document.fullscreenElement)submit(true,"fullscreen_exit")});
window.addEventListener("pagehide",()=>{
  if(!shouldTerminate()||!sessionId)return;
  const data=JSON.stringify({sessionId,answers,type:"page_exit"});
  navigator.sendBeacon("/api/index?action=violation",new Blob([data],{type:"application/json"}));
});
