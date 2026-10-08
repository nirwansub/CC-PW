import {employeePhotos} from './employee-photo-directory.js';
const words=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z0-9]+/g)||[];
const nameKey=s=>words(s).join('');
const teamKey=s=>{const k=words(s).filter(x=>!['team','tim'].includes(x)).join('');return k==='sp'?'auditperforma':k;};
const aliases={'gillbramsyakhawahyujati':'gilbramsyakhawahyujati','muhammadnajizamzami':'mnajizamzami','octavianiuh':'octavianiuswatunhasanah','hilqim':'hilqimafifwijaya','felina':'felinasilvi','achmad':'achmadnur','alviandra':'alviandrahikmahtiarwijaya','armeta':'armetaekaputriwibowo','dhuta':'dimasdhutaavitisna','nurizka':'nurizkafitriansyah','winanda':'winandafajarprabaningrum'};
function abbreviation(a,b){if(Math.min(a.length,b.length)<2)return false;return a.slice(0,Math.min(a.length,b.length)).every((x,i)=>x.startsWith(b[i])||b[i].startsWith(x));}
export function matchParticipantPhoto(name,team='',directory=employeePhotos){
 const key=aliases[nameKey(name)]||nameKey(name),exact=directory.filter(e=>nameKey(e.name)===key);
 const select=list=>{const sameTeam=list.filter(e=>teamKey(e.team)===teamKey(team));return sameTeam.length===1?sameTeam[0]:list.length===1?list[0]:null;};
 let match=select(exact);
 if(!exact.length){const a=words(name);match=select(directory.filter(e=>abbreviation(a,words(e.name))));if(!match&&a.length===1&&a[0].length>=4&&teamKey(team)){const sameTeam=directory.filter(e=>teamKey(e.team)===teamKey(team)&&words(e.name)[0]===a[0]);if(sameTeam.length===1)match=sameTeam[0];}}
 if(!match||!/^https:\/\/acc\.nsansena\.com\/public\/employee\//.test(match.url))return null;
 return {url:match.url,name:match.name,team:match.team};
}
const cache=new Map();
export const participantPhoto=r=>{const name=r.candidateName||r.name,team=r.currentTeam||r.team,key=String(name)+'\0'+String(team);if(!cache.has(key))cache.set(key,matchParticipantPhoto(name,team));return cache.get(key);};
