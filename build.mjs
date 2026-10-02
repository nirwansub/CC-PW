import {runInvitationBatch} from './scripts/invite-new-batch.mjs';
await runInvitationBatch();
import {runProductionRevision} from './scripts/revise-scoring.mjs';
await runProductionRevision();
import {activateCandidateFlow} from './scripts/activate-candidate-flow.mjs';
await activateCandidateFlow();
import {verifyLeaderModule} from './scripts/verify-leader-module.mjs';
await verifyLeaderModule();
// Retire the one-time import encryption key after the authorized batch is verified.
import {read,mutate} from './lib/storage.js';
if(process.env.VERCEL_ENV==='production'){const transfer=(await read('settings/invitation-transfer-20261002.json'))?.value;if(transfer?.complete&&transfer.privateKey)await mutate('settings/invitation-transfer-20261002.json',t=>{delete t.privateKey;delete t.publicKey;t.retiredAt=Date.now();});}
if(process.env.VERCEL_ENV==='production'){const p='settings/leader-invitation-transfer-20261002.json',t=(await read(p))?.value;if(t?.complete&&t.privateKey)await mutate(p,x=>{delete x.privateKey;delete x.publicKey;x.retiredAt=Date.now();});}
import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('public',{recursive:true,force:true});await mkdir('public');
for(const f of ['index.html','admin.html','materi.html','materi.js','candidate.js','admin.js','styles.css'])await copyFile(f,'public/'+f);
