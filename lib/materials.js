import {readFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import QRCode from 'qrcode';
import {ROLES} from './assessment.js';
import {routing} from './scoring.js';
export function suggestedMaterials(r){
 if(!r.stages.pre?.result?.complete)return[];
 return [...new Set([...r.preferences,...routing(r.stages.pre.result,r.preferences).shortlist.map(x=>x.roleKey)])].filter(k=>ROLES[k]);
}
export function selectedMaterials(r){return r.materialSelection?.releasedAt?r.materialSelection.roles||[]:[];}
export function materialPlan(r){return{suggested:suggestedMaterials(r),selected:r.materialSelection?.roles??suggestedMaterials(r),released:!!r.materialSelection?.releasedAt};}
export async function materialDownload(r,origin){
 const url=origin+'/api?'+new URLSearchParams({action:'material-pdf',code:r.accessCode});
 return{url,qr:await QRCode.toString(url,{type:'svg',errorCorrectionLevel:'M',margin:2,width:220})};
}
export async function materialPDF(roles){
 const document=await PDFDocument.create();
 for(const name of ['common',...roles]){if(name!=='common'&&!ROLES[name])throw new Error('Posisi tidak valid');const source=await PDFDocument.load(await readFile(new URL('../materials/'+name+'.pdf',import.meta.url)));for(const page of await document.copyPages(source,source.getPageIndices()))document.addPage(page);}
 document.setTitle('Ansena - Materi Pendalaman CC-PW');document.setAuthor('Ansena');return Buffer.from(await document.save());
}
