/* Shared self-service profile photo editor — student, teacher and parent.
 * Client resizes to 320px JPEG before sending; server still verifies type/size. */
(function(){
 'use strict';
 function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function mount(container,me,opts={}){
  if(!container)return;
  const src=me.avatar_url?'/api/me/avatar?v='+Date.now():null;
  container.innerHTML='<section class="account-photo-widget"><div class="account-photo-preview" aria-label="Your profile photo">'+(src?'<img src="'+safe(src)+'" alt="Your current profile photo">':'<span>'+safe((me.name||'?').slice(0,1).toUpperCase())+'</span>')+'</div><div class="account-photo-controls"><strong>My profile photo</strong><p>Upload a picture of yourself. JPEG, PNG or WebP. Your image will be resized before saving.</p><label class="account-photo-button">Choose photo<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose profile photo"></label><button type="button" class="account-photo-remove" '+(!src?'disabled':'')+'>Remove photo</button><p class="account-photo-status" role="status" aria-live="polite"></p></div></section>';
  const preview=container.querySelector('.account-photo-preview'),input=container.querySelector('input'),remove=container.querySelector('.account-photo-remove'),status=container.querySelector('.account-photo-status');
  function show(url){preview.innerHTML=url?'<img alt="Your profile photo">':'<span>'+safe((me.name||'?').slice(0,1).toUpperCase())+'</span>';if(url)preview.querySelector('img').src=url;remove.disabled=!url;}
  function imageData(file){
   return new Promise((resolve,reject)=>{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))return reject(Error('Use a JPEG, PNG or WebP file.'));
    if(file.size>8*1024*1024)return reject(Error('Choose an image smaller than 8 MB.'));
    const url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
     URL.revokeObjectURL(url);
     const scale=Math.min(1,320/Math.max(img.naturalWidth,img.naturalHeight));
     const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(img.naturalWidth*scale));cv.height=Math.max(1,Math.round(img.naturalHeight*scale));
     const ctx=cv.getContext('2d');
     if(!ctx)return reject(Error('Image processing is unavailable.'));
     ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(img,0,0,cv.width,cv.height);
     const data=cv.toDataURL('image/jpeg',.78);
     if(data.length>360000)return reject(Error('Resized photo is too large.'));
     resolve(data);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Could not open that image.'));};
    img.src=url;
   });
  }
  input.onchange=async()=>{
   const file=input.files?.[0];if(!file)return;
   input.disabled=true;remove.disabled=true;status.textContent='Processing photo…';
   try{
    const data=await imageData(file);
    status.textContent='Saving photo…';
    const res=await fetch('/api/me/avatar',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Requested-With':'fetch'},body:JSON.stringify({data})});
    const body=await res.json();if(!res.ok)throw Error(body.error||'Upload failed.');
    me.avatar_url=body.avatar_url;
    show('/api/me/avatar?v='+Date.now());status.textContent='Photo saved successfully.';
    opts.onChange?.(me.avatar_url);
   }catch(e){status.textContent=e.message;}finally{input.value='';input.disabled=false;remove.disabled=!me.avatar_url;}
  };
  remove.onclick=async()=>{
   if(!confirm('Remove your profile photo?'))return;
   remove.disabled=true;status.textContent='Removing photo…';
   try{
    const res=await fetch('/api/me/avatar',{method:'DELETE',credentials:'same-origin',headers:{'X-Requested-With':'fetch'}});
    const body=await res.json();if(!res.ok)throw Error(body.error||'Remove failed.');
    me.avatar_url=null;show(null);status.textContent='Photo removed.';opts.onChange?.(null);
   }catch(e){status.textContent=e.message;remove.disabled=false;}
  };
 }
 window.AccountPhoto={mount};
})();