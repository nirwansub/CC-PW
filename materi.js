const form=document.querySelector('#material-form');
const codeInput=document.querySelector('#participant-code');
const button=document.querySelector('#download-button');
const status=document.querySelector('#material-status');
const link=document.querySelector('#material-download');
let pdfUrl=null;
function clearDownload(){
  link.classList.add('hidden');link.removeAttribute('href');
  if(pdfUrl){URL.revokeObjectURL(pdfUrl);pdfUrl=null;}
}
codeInput.addEventListener('input',()=>{clearDownload();status.textContent='';});
form.addEventListener('submit',async event=>{
  event.preventDefault();clearDownload();
  const code=codeInput.value.trim();
  if(!/^[0-9]{6}$/.test(code)){status.textContent='Masukkan kode peserta 6 digit.';codeInput.focus();return;}
  button.disabled=true;codeInput.disabled=true;status.className='muted';status.textContent='Menyiapkan PDF materi…';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),60000);
  try{
    const response=await fetch('/api?action=material-pdf&code='+encodeURIComponent(code),{cache:'no-store',signal:controller.signal});
    if(!response.ok){
      const data=await response.json().catch(()=>({}));
      throw new Error(data.error||'Materi belum tersedia. Periksa kode atau hubungi penyelenggara.');
    }
    if(!response.headers.get('content-type')?.includes('application/pdf'))throw new Error('PDF belum dapat diunduh. Silakan coba lagi.');
    const pdf=await response.blob();pdfUrl=URL.createObjectURL(pdf);
    link.href=pdfUrl;link.download='Ansena-Materi-'+code+'.pdf';link.classList.remove('hidden');
    status.className='success';status.textContent='Materi siap. Tekan tombol di bawah untuk mengunduh PDF.';
    link.focus();
  }catch(error){status.className='danger';status.textContent=error.name==='AbortError'?'Koneksi terlalu lama. Silakan coba lagi.':error.message;}
  finally{clearTimeout(timeout);button.disabled=false;codeInput.disabled=false;}
});
