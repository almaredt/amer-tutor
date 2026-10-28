(async function(){
 const el=document.getElementById('tutorMarketplace');
 try{
  const response=await fetch('/api/public/teachers',{credentials:'omit'});
  if(!response.ok)throw Error('Unable to load tutor directory.');
  const teachers=await response.json();
  TutorMarketplace.mount(el,teachers,(t)=>{
   const next='/login?next='+encodeURIComponent('/portal');
   window.location.assign(next);
  });
  const id=new URLSearchParams(location.search).get('teacher');
  if(id){const button=el.querySelector('[data-profile="'+Number(id)+'"]');if(button)button.click();}
 }catch(e){el.textContent=e.message;}
})();
