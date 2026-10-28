(async function(){
 const el=document.getElementById('tutorMarketplace');
 try{
  const response=await fetch('/api/public/teachers',{credentials:'omit'});
  if(!response.ok)throw Error('Unable to load tutor directory.');
  const teachers=await response.json();
  TutorMarketplace.mount(el,teachers,async(t)=>{
   let box=document.getElementById('publicAvailability');
   if(!box){box=document.createElement('section');box.id='publicAvailability';box.className='public-availability';el.querySelector('#marketDetail').append(box);}
   box.innerHTML='<h3>Weekly teaching hours · Dubai time</h3><p>Loading availability…</p>';
   try{
    const response=await fetch('/api/public/teachers/'+t.id+'/availability',{credentials:'omit'});
    if(!response.ok)throw Error('Availability unavailable');
    const slots=await response.json(),days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    box.innerHTML='<h3>Weekly teaching hours · Dubai time</h3><p>These are regular teaching hours, not a guarantee of open booking slots. Live booking availability is checked after login.</p><div class="public-hours">'+days.map((day,n)=>'<div><strong>'+day+'</strong><span>'+(slots.filter(s=>s.weekday===n).map(s=>s.start_time+' – '+s.end_time).join(' / ')||'Not available')+'</span></div>').join('')+'</div><a class="public-book-cta" href="/login">Sign in to request a lesson ↗</a>';
   }catch(e){box.innerHTML='<p>Teaching hours could not be loaded.</p><a class="public-book-cta" href="/login">Sign in to book ↗</a>';}
   box.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  const id=new URLSearchParams(location.search).get('teacher');
  if(id){const button=el.querySelector('[data-profile="'+Number(id)+'"]');if(button)button.click();}
 }catch(e){el.textContent=e.message;}
})();
