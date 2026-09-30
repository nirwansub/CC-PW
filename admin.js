const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const api=async(action,opt={})=>{
  const r=await fetch("/api/index?action="+action,opt);
  let j={};try{j=await r.json()}catch{}
  if(!r.ok)throw new Error(j.error||"Error");
  return j;
};
let config=null,subs=[],selected=null,review=null;

async function auth(){
  const m=await api("admin-me");
  if(!m.authenticated){
    $("#login").innerHTML="<section class='card' style='max-width:460px;margin:auto'><h2>Admin Login</h2><div class='field'><label>PASSWORD</label><input id='pw' type='password' autocomplete='current-password'></div><button class='btn blue' id='loginBtn'>Masuk</button><div id='loginMsg'></div></section>";
    $("#loginBtn").onclick=login; return;
  }
  $("#login").classList.add("hidden"); $("#admin").classList.remove("hidden");
  config=await api("admin-config"); fillRoles(); wireTabs(); await loadSubs();
}
async function login(){
  try{
    await api("admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("#pw").value})});
    location.reload();
  }catch(e){$("#loginMsg").innerHTML="<p class='danger'>"+esc(e.message)+"</p>"}
}
function wireTabs(){
  document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    $("#tab-results").classList.toggle("hidden",b.dataset.tab!=="results");
    $("#tab-invite").classList.toggle("hidden",b.dataset.tab!=="invite");
  });
  $("#search").oninput=renderList; $("#createInvite").onclick=createInvite;
}
function fillRoles(){
  $("#invRole").innerHTML=Object.entries(config.roles).map(([k,v])=>"<option value='"+k+"'>"+esc(v.team)+" · "+esc(v.role)+"</option>").join("");
  $("#invRole").onchange=()=>$("#invDuration").value=config.roles[$("#invRole").value].duration;
  $("#invRole").onchange();
}
async function createInvite(){
  try{
    const r=await api("admin-invite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      candidateName:$("#invName").value.trim(),roleKey:$("#invRole").value,duration:Number($("#invDuration").value),expiresHours:Number($("#invExpiry").value)
    })});
    const link=location.origin+"/?invite="+encodeURIComponent(r.invite.token);
    $("#inviteResult").innerHTML="<div class='spacer'></div><div class='codebox' id='newLink'>"+esc(link)+"</div><div class='spacer' style='height:8px'></div><button class='btn' id='copyLink'>Copy Link</button>";
    $("#copyLink").onclick=async()=>{await navigator.clipboard.writeText(link);$("#copyLink").textContent="Copied"};
  }catch(e){$("#inviteResult").innerHTML="<p class='danger'>"+esc(e.message)+"</p>"}
}
async function loadSubs(){
  const r=await api("admin-submissions"); subs=r.submissions||[]; renderList();
}
function renderList(){
  const q=($("#search")?.value||"").toLowerCase();
  const arr=subs.filter(s=>(s.candidateName+" "+s.team+" "+s.role).toLowerCase().includes(q));
  $("#submissionList").innerHTML=arr.length?arr.map(s=>{
    const cls=s.terminated?"red":s.score>=75?"green":"amber";
    return "<div class='listitem "+(selected===s.submissionId?"active":"")+"' data-id='"+s.submissionId+"'><b>"+esc(s.candidateName||"Tanpa nama")+"</b><div class='small muted'>"+esc(s.team)+" · "+esc(s.role)+"</div><div class='row' style='justify-content:space-between;margin-top:7px'><span class='pill "+cls+"'>"+(s.terminated?"TERMINATED":s.score+"%")+"</span><span class='small muted'>"+new Date(s.finishedAt).toLocaleDateString("id-ID")+"</span></div></div>";
  }).join(""):"<div class='small muted'>Belum ada hasil.</div>";
  document.querySelectorAll(".listitem").forEach(x=>x.onclick=()=>openDetail(x.dataset.id));
}
async function openDetail(id){
  selected=id;renderList();
  const r=await api("admin-submissions&id="+encodeURIComponent(id));
  review=r.review||{ratings:{},notes:""};renderDetail(r.submission);
}
function roleFits(ratings){
  const val={yes:2,mid:1,no:0};
  return Object.entries(config.weights).map(([roleKey,weights])=>{
    let got=0,max=0,answered=0;
    for(const [trait,w] of Object.entries(weights)){max+=w*2;if(ratings[trait]){got+=(val[ratings[trait]]||0)*w;answered+=w}}
    return {roleKey,label:config.roles[roleKey].team+" · "+config.roles[roleKey].role,score:max?Math.round(got/max*100):0,coverage:Math.round(answered/Object.values(weights).reduce((a,b)=>a+b,0)*100)};
  }).sort((a,b)=>b.score-a.score);
}
function renderDetail(s){
  const caps=(s.capability||[]).map(c=>"<div class='fit-card'><span class='small muted'>"+esc(c.label)+"</span><strong>"+c.score+"%</strong><div class='bar'><span style='width:"+c.score+"%'></span></div></div>").join("");
  const sec=(s.securityEvents||[]).map(x=>"<li>"+esc(x.type)+" · "+new Date(x.at).toLocaleString("id-ID")+"</li>").join("")||"<li>Tidak ada security event.</li>";
  const ratings=review.ratings||{};
  const traits=config.traits.map(t=>{
    const v=ratings[t]||"";
    return "<tr><td>"+esc(t)+"</td><td><div class='seg'>"+
      ["yes","mid","no"].map(k=>"<button data-trait='"+esc(t)+"' data-val='"+k+"' class='"+(v===k?"on":"")+"'>"+({yes:"Ya",mid:"Sedang",no:"Tidak"}[k])+"</button>").join("")+
      "</div></td></tr>";
  }).join("");
  const fits=roleFits(ratings).map(f=>"<div class='fit-card'><span class='small muted'>"+esc(f.label)+"</span><strong>"+f.score+"%</strong><div class='bar'><span style='width:"+f.score+"%'></span></div><div class='small muted' style='margin-top:5px'>Checklist coverage "+f.coverage+"%</div></div>").join("");
  $("#detail").innerHTML="<div class='card'><div class='row' style='justify-content:space-between;align-items:flex-start'><div><span class='tag'>"+esc(s.team)+" · "+esc(s.role)+"</span><h2 style='margin:10px 0 4px'>"+esc(s.candidateName)+"</h2><div class='muted'>"+esc(s.identity?.contact||"")+(s.identity?.currentRole?" · "+esc(s.identity.currentRole):"")+"</div></div><div style='text-align:right'><div class='kpi'>"+s.score+"%</div><span class='pill "+(s.terminated?"red":s.score>=75?"green":"amber")+"'>"+esc(s.terminated?"TERMINATED":s.band)+"</span></div></div>"+
    "<div class='hr'></div><div class='grid4'><div><div class='small muted'>BENAR</div><b>"+s.correct+"/"+s.total+"</b></div><div><div class='small muted'>DURASI</div><b>"+Math.round(s.durationSeconds/60)+" mnt</b></div><div><div class='small muted'>MULAI</div><b>"+new Date(s.startedAt).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})+"</b></div><div><div class='small muted'>SELESAI</div><b>"+new Date(s.finishedAt).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})+"</b></div></div>"+
    (s.terminated?"<div class='spacer'></div><div class='warning'><b>Termination:</b> "+esc(s.terminationReason||"security violation")+"</div>":"")+
    "<div class='hr'></div><h3>Automatic capability breakdown</h3><div class='grid3'>"+caps+"</div><div class='hr'></div><h3>Security log</h3><ul class='security-list'>"+sec+"</ul></div>"+
    "<div class='spacer'></div><div class='card'><h2>Capability Checklist</h2><p class='muted'>Isi berdasarkan observasi/interview. Ya = kuat, Sedang = perlu validasi/pengembangan, Tidak = lemah.</p><div class='grid'><div><table class='trait-table'><thead><tr><th>TRAIT</th><th>RATING</th></tr></thead><tbody>"+traits+"</tbody></table></div><div><h3>Role-fit dari checklist</h3><div id='fits' class='grid'>"+fits+"</div><div class='field' style='margin-top:20px'><label>CATATAN ADMIN</label><textarea id='notes'>"+esc(review.notes||"")+"</textarea></div><button class='btn blue' id='saveReview'>Simpan Checklist</button><div id='saveMsg'></div></div></div></div>";
  document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{
    review.ratings[b.dataset.trait]=b.dataset.val;
    document.querySelectorAll(".seg button[data-trait='"+CSS.escape(b.dataset.trait)+"']").forEach(x=>x.classList.toggle("on",x.dataset.val===b.dataset.val));
    $("#fits").innerHTML=roleFits(review.ratings).map(f=>"<div class='fit-card'><span class='small muted'>"+esc(f.label)+"</span><strong>"+f.score+"%</strong><div class='bar'><span style='width:"+f.score+"%'></span></div><div class='small muted' style='margin-top:5px'>Checklist coverage "+f.coverage+"%</div></div>").join("");
  });
  $("#saveReview").onclick=saveReview;
}
async function saveReview(){
  try{
    review.notes=$("#notes").value;
    await api("admin-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({submissionId:selected,ratings:review.ratings,notes:review.notes})});
    $("#saveMsg").innerHTML="<p class='success'>Tersimpan.</p>";
  }catch(e){$("#saveMsg").innerHTML="<p class='danger'>"+esc(e.message)+"</p>"}
}
auth().catch(e=>{$("#login").innerHTML="<div class='warning'>"+esc(e.message)+"</div>"});
