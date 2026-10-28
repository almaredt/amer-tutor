/* Public tutor discovery: profiles and real free times without login.
   Booking remains protected behind the authenticated parent portal. */
(async function(){
 const el=document.getElementById('tutorMarketplace');
 try{
  const response=await fetch('/api/public/teachers',{credentials:'omit'});
  if(!response.ok)throw Error('Unable to load tutor directory.');
  const teachers=await response.json();
  let calendarToken=0;
  TutorMarketplace.mount(el,teachers,async(t)=>{
   const token=++calendarToken;
   let box=document.getElementById('publicAvailability');
   if(!box){box=document.createElement('section');box.id='publicAvailability';box.className='public-availability';el.querySelector('#marketDetail').append(box);}
   box.innerHTML='<div class="public-calendar-head"><h3>Select a date and time</h3><small>DUBAI / GMT+4</small></div><div class="public-duration"><button type="button" data-duration="45" class="selected">45 minutes</button><button type="button" data-duration="60">60 minutes</button></div><div class="public-cal-days"></div><h4>Available start times</h4><div class="public-cal-times"></div><p class="public-calendar-note">Availability updates live. Sign in only when you are ready to request this lesson.</p><a class="public-book-cta" href="/login">Select an available time ↗</a>';
   let duration=45,selectedDate=null,selectedSlot=null;
   const days=box.querySelector('.public-cal-days'),times=box.querySelector('.public-cal-times'),cta=box.querySelector('.public-book-cta');
   const fmt=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM');};
   async function load(){
    const current=++calendarToken;
    days.textContent='Loading availability…';times.textContent='';selectedSlot=null;
    try{
     const res=await fetch('/api/public/teachers/'+t.id+'/calendar?duration='+duration,{credentials:'omit',cache:'no-store'});
     if(!res.ok)throw Error('Availability unavailable');
     const data=await res.json();
     if(current!==calendarToken||!box.isConnected)return;
     const weekday=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
     const all=data.days;
     selectedDate=all.find(x=>x.times.length)?.date||null;
     function draw(){
      days.innerHTML=all.map(d=>'<button type="button" data-date="'+d.date+'" class="'+(selectedDate===d.date?'selected':'')+'" '+(!d.times.length?'disabled':'')+'><span>'+weekday[d.weekday]+'</span><strong>'+Number(d.date.slice(8))+'</strong><small>'+d.date.slice(5,7)+'</small></button>').join('');
      const options=all.find(x=>x.date===selectedDate)?.times||[];
      times.innerHTML=options.length?options.map(slot=>'<button type="button" data-slot="'+slot+'" class="'+(selectedSlot===slot?'selected':'')+'">'+fmt(slot.slice(11))+'</button>').join(''):'<p class="public-no-slots">No free slots for this day.</p>';
      cta.textContent=selectedSlot?'Continue with '+fmt(selectedSlot.slice(11))+' ↗':'Select an available time ↗';
      cta.setAttribute('aria-disabled',String(!selectedSlot));
      days.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selectedDate=b.dataset.date;selectedSlot=null;draw();});
      times.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{selectedSlot=b.dataset.slot;draw();});
     }
     draw();
    }catch(e){if(current===calendarToken)days.textContent=e.message;}
   }
   box.querySelectorAll('[data-duration]').forEach(b=>b.onclick=()=>{duration=Number(b.dataset.duration);box.querySelectorAll('[data-duration]').forEach(x=>x.classList.toggle('selected',x===b));load();});
   cta.addEventListener('click',e=>{
    if(!selectedSlot){e.preventDefault();return;}
    try{sessionStorage.setItem('amer-pending-booking',JSON.stringify({teacher_id:t.id,start_at:selectedSlot,minutes:duration}));}catch{}
    cta.href='/login?next='+encodeURIComponent('/portal?teacher='+t.id);
   });
   await load();
   if(token===calendarToken||box.isConnected)box.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  const id=new URLSearchParams(location.search).get('teacher');
  if(id){const button=el.querySelector('[data-profile="'+Number(id)+'"]');if(button)button.click();}
  // The reference layout shows a usable calendar alongside the selected profile immediately.
  el.querySelector('#marketBook')?.click();
 }catch(e){el.textContent=e.message;}
})();
