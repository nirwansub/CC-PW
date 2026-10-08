(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 window.participantPhotoMarkup=function(photo,name,size='small'){
  const initial=String(name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
  const valid=photo?.url&&/^https:\/\/acc\.nsansena\.com\/public\/employee\//.test(photo.url);
  return '<span class="participant-avatar avatar-'+(size==='large'?'large':'small')+'" role="img" aria-label="'+esc('Foto '+name)+'"><span class="avatar-initials" aria-hidden="true">'+esc(initial)+'</span>'+(valid?'<img src="'+esc(photo.url)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">':'')+'</span>';
 };
 document.addEventListener('error',e=>{if(e.target.matches?.('.participant-avatar img'))e.target.remove();},true);
})();
