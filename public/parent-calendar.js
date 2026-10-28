// Accessible two-week booking picker. Dates/times are Asia/Dubai.
(function(){
 const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 async function mount(el,teacherId,studentOptions,onBook,initial){
  let duration=initial?.minutes===60?60:45,selectedDay=null,selectedTime=null,calendar=null;
  el.innerHTML='<div class="book-head"><div><h3>Choose your lesson time</h3><p>Only available appointments are shown · Dubai (GMT+4)</p></div><button type="button" class="book-close" aria-label="Close booking calendar">✕</button></div><div class="book-duration" role="group" aria-label="Lesson duration"><button type="button" data-duration="45" class="selected">45 minutes</button><button type="button" data-duration="60">60 minutes</button></div><div class="book-week-label">NEXT 14 DAYS</div><div class="book-days" role="group" aria-label="Select a date"></div><h4 class="book-times-title">Available start times</h4><div class="book-times" role="group" aria-label="Select a time"></div><form class="book-checkout"><label>Student<select name="student_id" required>'+studentOptions.map(x=>'<option value="'+Number(x.id)+'">'+String(x.display_name).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>').join('')+'</select></label><div class="book-selection" aria-live="polite">Select a date and time to continue.</div><button class="primary book-submit" disabled>Request this lesson →</button><p class="book-feedback" role="status"></p></form>';
  el.querySelector('.book-close').onclick=()=>el.remove();
  const dayHost=el.querySelector('.book-days'),timeHost=el.querySelector('.book-times'),summary=el.querySelector('.book-selection'),submit=el.querySelector('.book-submit'),feedback=el.querySelector('.book-feedback');
  const display=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM');};
  function draw(){
   dayHost.innerHTML=calendar.days.map((d,i)=>'<button type="button" class="book-day'+(selectedDay===i?' selected':'')+'" data-day="'+i+'" '+(!d.times.length?'disabled':'')+'><span>'+days[d.weekday]+'</span><strong>'+Number(d.date.slice(8))+'</strong><small>'+d.date.slice(5,7)+'</small></button>').join('');
   const times=selectedDay===null?[]:calendar.days[selectedDay].times;
   timeHost.innerHTML=times.length?times.map(t=>'<button type="button" class="book-time'+(selectedTime===t?' selected':'')+'" data-time="'+t+'">'+display(t.slice(11))+'</button>').join(''):'<p class="book-empty">'+(selectedDay===null?'Choose a date above to see available hours.':'No appointments left on this day.')+'</p>';
   submit.disabled=!selectedTime;
   summary.textContent=selectedTime?'Your selection: '+selectedTime.slice(0,10)+' at '+display(selectedTime.slice(11))+' · '+duration+' minutes':'Select a date and time to continue.';
   dayHost.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selectedDay=Number(b.dataset.day);selectedTime=null;draw();});
   timeHost.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{selectedTime=b.dataset.time;draw();});
  }
  async function load(){
   feedback.textContent='Loading available times…';submit.disabled=true;
   try{calendar=await api('/api/teachers/'+teacherId+'/calendar?duration='+duration);selectedDay=calendar.days.findIndex(d=>d.times.includes(initial?.start_at));if(selectedDay>=0){selectedTime=initial.start_at;initial=null;}else{selectedDay=calendar.days.findIndex(d=>d.times.length>0);selectedTime=null;}if(selectedDay<0)selectedDay=null;feedback.textContent='';draw();}
   catch(e){feedback.textContent=e.message;dayHost.innerHTML='';timeHost.innerHTML='';}
  }
  el.querySelectorAll('[data-duration]').forEach(b=>b.onclick=()=>{duration=Number(b.dataset.duration);el.querySelectorAll('[data-duration]').forEach(x=>x.classList.toggle('selected',x===b));load();});
  el.querySelector('form').onsubmit=async e=>{e.preventDefault();if(!selectedTime)return;submit.disabled=true;feedback.textContent='Sending request…';try{const f=new FormData(e.target);const result=await onBook({teacher_id:teacherId,student_id:Number(f.get('student_id')),minutes:duration,start_at:selectedTime});await load();feedback.textContent='✓ Request sent! '+result.amount_aed+' points · Await teacher confirmation.';}catch(ex){feedback.textContent=ex.message;submit.disabled=false;await load();}};
  el.querySelectorAll('[data-duration]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.duration)===duration));
  await load();
 }
 window.ParentCalendar={mount};
})();
