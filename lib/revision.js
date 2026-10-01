import {aggregate,SCORING_VERSION} from './scoring.js';
import {suggestedMaterials} from './materials.js';
const invalid=message=>Object.assign(new Error(message),{status:409});
export function recalculateRecord(r){
 const s=r.stages.pre;
 if(!s||!['submitted','terminated'].includes(s.status)||s.grading?.status!=='complete')throw invalid('Selesaikan penilaian pre-test sebelum menghitung ulang');
 if(s.result?.scoringVersion===SCORING_VERSION&&r.requiresComparison)return;
 const result=aggregate('pre',s.answers,s.grades||[]);if(!result.complete)throw invalid('Rubrik esai belum lengkap');
 s.scoreHistory??=[];s.scoreHistory.push({at:Date.now(),reason:'authorized_scoring_revision',previousResult:structuredClone(s.result),previousGrading:structuredClone(s.grading),previousGrades:structuredClone(s.grades||[])});
 s.result=result;s.recalculatedAt=Date.now();r.requiresComparison=true;r.scoringRevision=SCORING_VERSION;
 if(r.materialSelection){r.materialSelectionHistory??=[];r.materialSelectionHistory.push({at:Date.now(),reason:'scoring_revision',previous:structuredClone(r.materialSelection)});}
 r.materialSelection={roles:suggestedMaterials(r),releasedAt:null,source:'system_diagnostic',requiresReview:true};
}
