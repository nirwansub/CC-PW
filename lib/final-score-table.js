import {ROLES} from './assessment.js';
import {tableParticipant} from './admin-table.js';
import {recommendationCandidate} from './position-recommendations.js';
export const finalScoreColumns=Object.keys(ROLES).map(roleKey=>({roleKey,label:(roleKey.startsWith('cc-')?'CC':'PW')+' · '+ROLES[roleKey].role}));
export function finalScoreRow(r){
 const participant=tableParticipant(r);if(!participant)return null;
 const results=Object.fromEntries(finalScoreColumns.map(({roleKey})=>[roleKey,recommendationCandidate(r,roleKey)]));
 const scores=Object.fromEntries(finalScoreColumns.map(({roleKey})=>[roleKey,results[roleKey]?.final??null]));
 const postScores=Object.fromEntries(finalScoreColumns.map(({roleKey})=>[roleKey,results[roleKey]?.post??null]));
 const postMeasured=Object.values(postScores).filter(Number.isFinite);
 const postAverage=postMeasured.length?postMeasured.reduce((a,b)=>a+b,0)/postMeasured.length:null;
 const measured=Object.values(scores).filter(Number.isFinite);
 return {photo:participant.photo,name:participant.name,team:participant.team,scores,postScores,postAverage,average:measured.length?measured.reduce((a,b)=>a+b,0)/measured.length:null,leader:participant.leader,postComplete:participant.selected.every(role=>['submitted','terminated'].includes(r.stages?.['post:'+role]?.status))};
}
