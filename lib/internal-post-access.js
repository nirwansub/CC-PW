import {comparisonReady} from './candidate-flow.js';
import {suggestedMaterials,selectedMaterials} from './materials.js';
import {leadershipReady} from './leadership.js';
export function internalPostEligible(r,ops){return ops.autoPostTestAfterComparison===true&&Number.isFinite(ops.autoPostTestFrom)&&r.createdAt>=ops.autoPostTestFrom&&!ops.materialsHeld&&!ops.postTestsLocked&&comparisonReady(r);}
export function needsInternalPost(r,ops){return internalPostEligible(r,ops)&&(!r.postTestAccess?.enabled||!selectedMaterials(r).length||r.leaderTrack?.enabled&&!leadershipReady(r)&&!r.postTestException?.leadershipPending);}
export function prepareInternalPost(r,ops,now=Date.now()){
 if(!needsInternalPost(r,ops))return false;
 if(!selectedMaterials(r).length){const roles=suggestedMaterials(r);if(!roles.length)return false;r.materialSelection={roles,releasedAt:now,source:'internal_auto',baselineSource:'comparison',flowVersion:'internal-auto-post-20261012'};}
 if(r.leaderTrack?.enabled&&!leadershipReady(r))r.postTestException={...r.postTestException,leadershipPending:true,reason:'internal_auto_post_after_comparison',authorizedAt:now};
 r.postTestAccess={...r.postTestAccess,enabled:true,source:'internal_auto_after_comparison',updatedAt:now};return true;
}
