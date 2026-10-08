import {ROLES} from './assessment.js';
import {tableParticipant} from './admin-table.js';
import {recommendationCandidate} from './position-recommendations.js';
export const finalScoreColumns=Object.keys(ROLES).map(roleKey=>({roleKey,label:(roleKey.startsWith('cc-')?'CC':'PW')+' · '+ROLES[roleKey].role}));
export function finalScoreRow(r){
 const participant=tableParticipant(r);if(!participant)return null;
 const scores=Object.fromEntries(finalScoreColumns.map(({roleKey})=>[roleKey,recommendationCandidate(r,roleKey)?.final??null]));
 const measured=Object.values(scores).filter(Number.isFinite);
 return {name:participant.name,team:participant.team,scores,average:measured.length?measured.reduce((a,b)=>a+b,0)/measured.length:null,leader:participant.leader,postComplete:participant.selected.every(role=>['submitted','terminated'].includes(r.stages?.['post:'+role]?.status))};
}
