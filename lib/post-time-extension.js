export function extendActivePost(r,{incidentId,snapshotAt,extraMs},now=Date.now()){
 const results=[];
 for(const [stage,s] of Object.entries(r.stages||{})){
  if(!stage.startsWith('post:')||!Number.isFinite(s.startedAt)||s.startedAt>snapshotAt||!Number.isFinite(s.expiresAt)||s.expiresAt<=snapshotAt)continue;
  if(s.timeExtensions?.some(x=>x.incidentId===incidentId)){results.push({stage,status:'already_applied',expiresAt:s.expiresAt});continue;}
  if(s.status!=='active'||s.expiresAt+extraMs<=now)continue;
  const previousExpiresAt=s.expiresAt;s.expiresAt+=extraMs;s.timeExtensions??=[];s.timeExtensions.push({incidentId,snapshotAt,extraMs,at:now,previousExpiresAt,expiresAt:s.expiresAt});results.push({stage,status:'extended',previousExpiresAt,expiresAt:s.expiresAt});
 }
 return results;
}
