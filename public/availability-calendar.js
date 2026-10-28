/* Interactive weekly availability: click or drag half-hour cells, then save.
   All times are Dubai-local. Works with existing teacher availability API. */
(function(){
const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const start=8*60,end=22*60,step=30;
const time=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
const index=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
function mount(host,initial,onSave){
 const chosen=new Set();
 (initial||[]).forEach(s=>{for(let n=Math.max(start,index(s.start_time));n<Math.min(end,index(s.end_time));n+=step)chosen.add(s.weekday+'-'+n);});
 host.innerHTML='<div class="availability-head"><div><h3>Set your teaching hours</h3><p>Dubai time (GMT+4) · Select or drag across the time blocks. Blue means available.</p></div><div class="availability-actions"><button type="button" data-action="weekdays">Weekdays 4–8 PM</button><button type="button" data-action="clear">Clear all</button></div></div><div class="availability-scroll"><div class="availability-grid" role="group" aria-label="Weekly teaching availability"><div class="av-corner">TIME</div>'+days.map((d,i)=>'<div class="av-day">'+d.slice(0,3)+'</div>').join('')+Array.from({length:(end-start)/step},(_,row)=>'<div class="av-time">'+time(start+row*step)+'</div>'+days.map((d,col)=>'<button type="button" class="av-cell" data-day="'+col+'" data-minute="'+(start+row*step)+'" aria-label="'+d+' '+time(start+row*step)+' to '+time(start+(row+1)*step)+'" aria-pressed="false"></button>').join('')).join('')+'</div></div><p class="av-summary" aria-live="polite"></p><button type="button" class="primary av-save">Save availability</button><p class="av-feedback" role="status"></p>';
 const cells=[...host.querySelectorAll('.av-cell')],summary=host.querySelector('.av-summary'),feedback=host.querySelector('.av-feedback');
 const key=c=>c.dataset.day+'-'+c.dataset.minute;
 const draw=()=>{cells.forEach(c=>{const active=chosen.has(key(c));c.classList.toggle('selected',active);c.setAttribute('aria-pressed',String(active));});const count=chosen.size;summary.textContent=count?Math.floor(count/2)+(count%2?'½':'')+' hours available per week':'No hours selected';};
 let dragging=false,paint=true;
 cells.forEach(c=>{
  c.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;paint=!chosen.has(key(c));if(paint)chosen.add(key(c));else chosen.delete(key(c));draw();});
  c.addEventListener('pointerenter',()=>{if(!dragging)return;if(paint)chosen.add(key(c));else chosen.delete(key(c));draw();});
  c.addEventListener('click',e=>{if(e.detail===0){if(chosen.has(key(c)))chosen.delete(key(c));else chosen.add(key(c));draw();}});
 });
 window.addEventListener('pointerup',()=>{dragging=false;},{signal:(()=>{const ac=new AbortController();host._avCleanup=()=>ac.abort();return ac.signal;})()});
 host.querySelector('[data-action="clear"]').onclick=()=>{chosen.clear();draw();};
 host.querySelector('[data-action="weekdays"]').onclick=()=>{for(let d=1;d<=5;d++)for(let n=16*60;n<20*60;n+=step)chosen.add(d+'-'+n);draw();};
 host.querySelector('.av-save').onclick=async()=>{
  const slots=[];
  for(let d=0;d<7;d++){let begin=null;for(let n=start;n<=end;n+=step){const active=n<end&&chosen.has(d+'-'+n);if(active&&begin===null)begin=n;if(!active&&begin!==null){slots.push({weekday:d,start_time:time(begin),end_time:time(n)});begin=null;}}}
  const btn=host.querySelector('.av-save');btn.disabled=true;feedback.textContent='Saving…';
  try{await onSave(slots);feedback.textContent='Saved! Your weekly schedule is updated.';}catch(e){feedback.textContent=e.message;}finally{btn.disabled=false;}
 };
 draw();
}
window.AvailabilityCalendar={mount};
})();
