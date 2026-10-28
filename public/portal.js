// Teacher and parent portal — intentionally small and dependency-free.
const root = $('root');
const box = (title, content) => '<section class="box"><h2>'+esc(title)+'</h2>'+content+'</section>';
const err = (e) => '<p class="error">'+esc(e.message)+'</p>';
async function boot(){
  let me;try{me=await api('/api/me');}catch(e){if(e.status===401){renderLogin(root,(r)=>['teacher','parent'].includes(r.role)?boot():location.assign(r.role==='admin'?'/admin' :'/study'));return;}root.innerHTML=err(e);return;}
  activeMeId=me.id;
  if(!['teacher','parent'].includes(me.role)){location.href=me.role==='admin'?'/admin' :'/study';return;}
  root.innerHTML='<header><div><div class="brand">AMER TUTOR / '+esc(me.role.toUpperCase())+'</div><h1>'+esc(me.name)+'</h1><p class="muted">Learn. Practice. Improve.</p></div><button id="signout">Log out</button></header><div id="content"></div>';
  $('signout').onclick=logout;
  if(me.role==='teacher')await teacher();else await parent();
}
async function teacher(){
  const c=$('content');try{
    const [data,bookings,wallet,availability]=await Promise.all([api('/api/teacher/me'),api('/api/teacher/bookings'),api('/api/points/me'),api('/api/teacher/availability')]),p=data.profile||{};
    c.innerHTML=box('My teaching profile','<p class="muted">Profiles are published after admin approval.</p><p>'+ (p.approved?'Approved':'Pending approval')+'</p><form id="profile">'+
      '<label>Bio<textarea name="bio" maxlength="2000">'+esc(p.bio||'')+'</textarea></label>'+
      ['subjects','grades','curricula','languages'].map(k=>'<label>'+esc(k)+' (comma separated)<input name="'+k+'" value="'+esc((p[k]||[]).join(', '))+'"></label>').join('')+
      '<div class="cards"><label>45 minutes · points<input type="number" min="0" max="100000" name="rate_45_aed" value="'+esc(p.rate_45_aed??'')+'"></label><label>60 minutes · points<input type="number" min="0" max="100000" name="rate_60_aed" value="'+esc(p.rate_60_aed??'')+'"></label></div><button class="primary">Save profile</button><p id="profileMsg"></p></form>')+
      box('My students',data.students.length?'<div class="cards">'+data.students.map(s=>'<article class="box"><b>'+esc(s.display_name)+'</b><p class="small">'+esc(s.programme||'')+' · Grade '+esc(s.grade||'—')+'</p><button data-progress="'+s.id+'">View progress</button><button data-compose="'+s.id+'">Send lesson / task</button><button data-chat="'+s.id+'">Messages</button><div id="detail-'+s.id+'"></div></article>').join('')+'</div>':'<p class="muted">Admin has not assigned students yet.</p>');
    c.insertAdjacentHTML('beforeend',box('Weekly teaching calendar','<div id="availabilityCalendar"></div>'));
    AvailabilityCalendar.mount($('availabilityCalendar'),availability,slots=>api('/api/teacher/availability',{slots},'PUT'));
    const agenda=[...bookings].sort((a,b)=>['requested','confirmed','completed','cancelled'].indexOf(a.status)-['requested','confirmed','completed','cancelled'].indexOf(b.status)||a.start_at.localeCompare(b.start_at));
    c.insertAdjacentHTML('beforeend',box('Lesson bookings','<p class="muted">Review requests, confirm upcoming lessons, and complete paid lessons after they finish.</p><div class="lesson-agenda">'+(agenda.length?agenda.map(b=>'<article class="lesson-agenda-card"><div class="lesson-date"><strong>'+esc(b.start_at.slice(8,10))+'</strong><span>'+esc(b.start_at.slice(5,7))+'/'+esc(b.start_at.slice(0,4))+'</span></div><div class="lesson-details"><span class="lesson-status">'+esc(b.status.toUpperCase())+' · '+esc(b.payment_status.toUpperCase())+'</span><h3>Lesson #'+b.id+' · '+esc(b.start_at.slice(11,16))+'</h3><p>'+b.minutes+' minutes · '+b.amount_aed+' points</p></div><div class="lesson-actions">'+(b.status==='requested'?'<button data-confirm="'+b.id+'" class="primary">Confirm request</button>':'')+(b.status==='confirmed'&&b.payment_status==='paid'?'<button data-complete="'+b.id+'" class="primary">Mark complete</button>':'')+'</div></article>').join(''):'<p class="muted">No lesson requests yet. Set your availability to receive bookings.</p>')+'</div>')+box('My points','<div class="wallet-overview"><span>AVAILABLE POINTS</span><strong>'+wallet.balance+'</strong><small>Demo points — no real payments</small></div><h3>Recent point activity</h3>'+(wallet.history.length?wallet.history.map(e=>'<div class="wallet-activity"><span>'+esc(e.kind.replace(/_/g,' '))+'</span><strong>'+e.points+' points</strong></div>').join(''):'<p class="muted">No point transfers yet.</p>')));
    c.querySelectorAll('[data-confirm]').forEach(b=>b.onclick=async()=>{try{await api('/api/teacher/bookings/'+b.dataset.confirm+'/confirm',{});await teacher();}catch(e){alert(e.message);}});
    c.querySelectorAll('[data-complete]').forEach(b=>b.onclick=async()=>{try{await api('/api/teacher/bookings/'+b.dataset.complete+'/complete',{});await teacher();}catch(e){alert(e.message);}});
    $('profile').onsubmit=async(e)=>{e.preventDefault();const f=new FormData(e.target);const body={bio:f.get('bio'),rate_45_aed:f.get('rate_45_aed')||null,rate_60_aed:f.get('rate_60_aed')||null};for(const k of ['subjects','grades','curricula','languages'])body[k]=String(f.get(k)||'').split(',').map(x=>x.trim()).filter(Boolean);try{await api('/api/teacher/profile',body,'PUT');$('profileMsg').textContent='Saved. Awaiting admin approval.';}catch(ex){$('profileMsg').textContent=ex.message;}};
    c.querySelectorAll('[data-progress]').forEach(b=>b.onclick=async()=>{const id=b.dataset.progress,el=$('detail-'+id);el.innerHTML='<p class="muted">Loading learning insights…</p>';try{const d=await api('/api/teacher/students/'+id+'/insights');ProgressInsights.render(el,d,b.closest('.box').querySelector('b').textContent);}catch(ex){el.textContent=ex.message;}});
    c.querySelectorAll('[data-compose]').forEach(b=>b.onclick=()=>{const id=b.dataset.compose,el=$('detail-'+id);el.innerHTML='<form><label>Type<select name="kind"><option>lesson</option><option>assignment</option><option>exam</option></select></label><label>Title<input name="title" maxlength="160" required></label><label>Content<textarea name="body" maxlength="20000" required></textarea></label><label>Due date<input type="date" name="due_at"></label><button class="primary">Send to student</button><p class="small" id="sent-'+id+'"></p></form>';el.querySelector('form').onsubmit=async(e)=>{e.preventDefault();const f=new FormData(e.target);try{await api('/api/teacher/materials',{student_id:Number(id),kind:f.get('kind'),title:f.get('title'),body:f.get('body'),due_at:f.get('due_at')});$('sent-'+id).textContent='Sent successfully.';}catch(ex){$('sent-'+id).textContent=ex.message;}};});
    c.querySelectorAll('[data-chat]').forEach(b=>b.onclick=()=>conversation(b.dataset.chat,meIdFromPage(),$('detail-'+b.dataset.chat)));
    PortalWorkspace.enhance('teacher',{students:data.students.length,bookings,points:wallet.balance});
  }catch(e){c.innerHTML=err(e);}
}
let activeMeId;
function meIdFromPage(){return activeMeId;}
async function conversation(sid,tid,el){
  try{const messages=await api('/api/messages/'+sid+'/'+tid);el.innerHTML='<div>'+messages.map(m=>'<p class="small"><b>'+esc(m.sender_id===tid?'Teacher':'Student')+':</b> '+esc(m.body)+'</p>').join('')+'</div><form><textarea required maxlength="2000" placeholder="Write a message"></textarea><button>Send</button></form>';el.querySelector('form').onsubmit=async(e)=>{e.preventDefault();try{await api('/api/messages/'+sid+'/'+tid,{body:el.querySelector('textarea').value});await conversation(sid,tid,el);}catch(ex){el.append(document.createTextNode(ex.message));}};}catch(e){el.textContent=e.message;}
}
async function parent(){
 const c=$('content');try{
 const [children,teachers,bookings,wallet,refunds]=await Promise.all([api('/api/parent/children'),api('/api/teachers'),api('/api/parent/bookings'),api('/api/points/me'),api('/api/parent/refunds')]);
 c.innerHTML=box('My points','<h2>'+wallet.balance+' points</h2><p class="muted">Demo points only. Ask Admin to add points to your account.</p>')+box('My children',children.length?children.map(s=>'<div class="box"><b>'+esc(s.display_name)+'</b><p>Grade '+esc(s.grade||'—')+'</p><button data-child="'+s.id+'">View progress</button><div id="child-'+s.id+'"></div></div>').join(''):'<p class="muted">Admin has not linked a child to your account yet.</p>')+
 box('Find your tutor','<div id="tutorMarketplace"></div>');
 c.innerHTML+=box('Lesson requests','<p class="muted">Your upcoming requests and lesson history. Points transfer only after a tutor confirms.</p><div class="lesson-agenda">'+(bookings.length?bookings.map(b=>'<article class="lesson-agenda-card"><div class="lesson-date"><strong>'+esc(b.start_at.slice(8,10))+'</strong><span>'+esc(b.start_at.slice(5,7))+'/'+esc(b.start_at.slice(0,4))+'</span></div><div class="lesson-details"><span class="lesson-status">'+esc(b.status.toUpperCase())+' · '+esc(b.payment_status.toUpperCase())+'</span><h3>Lesson with tutor #'+b.teacher_id+'</h3><p>'+esc(b.start_at.slice(11,16))+' Dubai · '+b.minutes+' min · '+b.amount_aed+' points</p></div><div class="lesson-actions">'+(b.status==='confirmed'&&b.payment_status==='unpaid'?'<button class="primary" data-pay="'+b.id+'">Transfer points</button>':'')+(b.payment_status==='unpaid'&&['requested','confirmed'].includes(b.status)?'<button data-cancel="'+b.id+'">Cancel</button>':'')+(b.payment_status==='paid'&&b.status==='confirmed'&&!refunds.some(r=>r.booking_id===b.id)?'<button data-refund="'+b.id+'">Request refund</button>':'')+'</div></article>').join(''):'<p class="muted">No lessons booked yet. Find a tutor to get started.</p>')+'</div>');
 c.innerHTML+=box('Point refund requests',refunds.map(r=>'<p>Booking #'+r.booking_id+' · '+esc(r.status)+'</p>').join(''));
 TutorMarketplace.mount($('tutorMarketplace'),teachers,async(t,profileEl)=>{
   c.querySelectorAll('.book-picker').forEach(x=>x.remove());
   const el=document.createElement('section');el.className='box book-picker';
   profileEl.after(el);
   await ParentCalendar.mount(el,t.id,children,body=>api('/api/parent/bookings',body));
   const price=document.createElement('p');price.className='book-price';
   price.textContent='Lesson rates: '+(t.rate_45_aed??'—')+' points / 45 min · '+(t.rate_60_aed??'—')+' points / 60 min';
   el.querySelector('.book-head').after(price);
   el.scrollIntoView({behavior:'smooth',block:'start'});
 });
 c.querySelectorAll('[data-cancel]').forEach(btn=>btn.onclick=async()=>{if(!confirm('Cancel this unpaid booking?'))return;try{await api('/api/parent/bookings/'+btn.dataset.cancel+'/cancel',{});await parent();}catch(e){alert(e.message);}});
 c.querySelectorAll('[data-refund]').forEach(b=>b.onclick=async()=>{const reason=window.prompt('Reason for refund (minimum 5 characters):');if(reason===null)return;try{await api('/api/parent/bookings/'+b.dataset.refund+'/refund',{reason});await parent();}catch(e){alert(e.message);}});
 c.querySelectorAll('[data-pay]').forEach(btn=>btn.onclick=async()=>{if(!confirm('Transfer points to Admin for this lesson?'))return;btn.disabled=true;try{await api('/api/parent/bookings/'+btn.dataset.pay+'/points',{});await parent();}catch(e){btn.disabled=false;alert(e.message);}});
 c.querySelectorAll('[data-book]').forEach(btn=>btn.onclick=async()=>{const id=Number(btn.dataset.book);c.querySelectorAll('.book-picker').forEach(x=>x.remove());const el=document.createElement('section');el.className='box book-picker';btn.closest('article').after(el);await ParentCalendar.mount(el,id,children,body=>api('/api/parent/bookings',body));const t=teachers.find(x=>x.id===id);if(t){const p=document.createElement('p');p.className='book-price';p.textContent='Lesson price: '+(t.rate_45_aed??'—')+' points / 45 min · '+(t.rate_60_aed??'—')+' points / 60 min';el.querySelector('.book-head').after(p);}});
 c.querySelectorAll('[data-child]').forEach(b=>b.onclick=async()=>{const id=b.dataset.child,el=$('child-'+id);el.innerHTML='<p class="muted">Loading learning insights…</p>';try{const d=await api('/api/parent/children/'+id+'/insights');ProgressInsights.render(el,d,b.closest('.box').querySelector('b').textContent);}catch(e){el.textContent=e.message;}});
 PortalWorkspace.enhance('parent',{children:children.length,teachers:teachers.length,bookings,points:wallet.balance});

 }catch(e){c.innerHTML=err(e);}
}
(async()=>{try{const me=await api('/api/me');activeMeId=me.id;}catch(e){}await boot();})();
