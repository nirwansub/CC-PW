import {runLeaderBatch} from './scripts/invite-leaders.mjs';
await runLeaderBatch();
import {runProductionRevision} from './scripts/revise-scoring.mjs';
await runProductionRevision();
import {activateCandidateFlow} from './scripts/activate-candidate-flow.mjs';
await activateCandidateFlow();
// Retire the one-time import encryption key after the authorized batch is verified.
import {read,mutate} from './lib/storage.js';
if(process.env.VERCEL_ENV==='production'){const transfer=(await read('settings/invitation-transfer-20261002.json'))?.value;if(transfer?.complete&&transfer.privateKey)await mutate('settings/invitation-transfer-20261002.json',t=>{delete t.privateKey;delete t.publicKey;t.retiredAt=Date.now();});}
import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('public',{recursive:true,force:true});await mkdir('public');
for(const f of ['index.html','admin.html','materi.html','materi.js','candidate.js','admin.js','styles.css'])await copyFile(f,'public/'+f);
