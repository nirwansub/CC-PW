import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('public',{recursive:true,force:true});await mkdir('public');
for(const f of ['index.html','admin.html','materi.html','materi.js','candidate.js','admin.js','styles.css'])await copyFile(f,'public/'+f);
