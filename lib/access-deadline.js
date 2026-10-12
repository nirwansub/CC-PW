// The user reopened the stages after pre-test for internal assessments on 12 October 2026.
// No scheduled cutoff is active. Completed attempts and normal stage prerequisites remain intact.
export const PRE_POST_DEADLINE_AT=null;
export const PRE_POST_CLOSED_MESSAGE='Akses tahap setelah pre-test sedang ditutup. Hubungi penyelenggara untuk informasi selanjutnya.';
export function prePostClosed(now=Date.now()){return PRE_POST_DEADLINE_AT!==null&&now>=PRE_POST_DEADLINE_AT;}
export function blockedAfterDeadline(action,stage,now=Date.now()){
 if(!prePostClosed(now))return false;
 if(['profile','comparison-resume','leadership-resume','candidate-materials','material-pdf','materials','materials-read'].includes(action))return true;
 return ['comparison','leadership'].includes(stage)&&['start','quiz','save','submit','violation','evaluate','security-warning','security-resume','security-timeout'].includes(action);
}
