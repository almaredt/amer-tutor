// Teacher and parent portal — intentionally small and dependency-free.
const root = $('root');
const box = (title, content) => '<section class="box"><h2>'+esc(title)+'</h2>'+content+'</section>';
const err = (e) => '<p class="error">'+esc(e.message)+'</p>';
async function boot(){
  let me;try{me=await api('/api/me');}catch(e){if(e.status===401){renderLogin(root,(r)=>['teacher','parent'].includes(r.role)?boot():location.assign(r.role==='admin'?'/admin':'/'));return;}root.innerHTML=err(e);return;}
  if(!['teacher','parent'].includes(me.role)){location.href=me.role==='admin'?'/admin':'/';return;}
  root.innerHTML='<header><div><div class="brand">AMER TUTOR / '+esc(me.role.toUpperCase())+'</div><h1>'+esc(me.name)+'</h1><p class="muted">Learn. Practice. Improve.</p></div><button id="signout">Log out</button></header><div id="content"></div>';
  $('signout').onclick=logout;
  if(me.role==='teacher')await teacher();else await parent();
}
async function teacher(){
  const c=$('content');try{
    const data=await api('/api/teacher/me'),p=data.profile||{};
    c.innerHTML=box('My teaching profile','<p class="muted">Profiles are published after admin approval.</p><p>'+ (p.approved?'Approved':'Pending approval')+'</p><form id="profile">'+
      '<label>Bio<textarea name="bio" maxlength="2000">'+esc(p.bio||'')+'</textarea></label>'+
      ['subjects','grades','curricula','languages'].map(k=>'<label>'+esc(k)+' (comma separated)<input name="'+k+'" value="'+esc((p[k]||[]).join(', '))+'"></label>').join('')+
      '<div class="cards"><label>45 minutes · AED<input type="number" min="0" max="100000" name="rate_45_aed" value="'+esc(p.rate_45_aed??'')+'"></label><label>60 minutes · AED<input type="number" min="0" max="100000" name="rate_60_aed" value="'+esc(p.rate_60_aed??'')+'"></label></div><button class="primary">Save profile</button><p id="profileMsg"></p></form>')+
      box('My students',data.students.length?'<div class="cards">'+data.students.map(s=>'<article class="box"><b>'+esc(s.display_name)+'</b><p class="small">'+esc(s.programme||'')+' · Grade '+esc(s.grade||'—')+'</p><button data-progress="'+s.id+'">View progress</button><button data-compose="'+s.id+'">Send lesson / task</button><button data-chat="'+s.id+'">Messages</button><div id="detail-'+s.id+'"></div></article>').join('')+'</div>':'<p class="muted">Admin has not assigned students yet.</p>');
    $('profile').onsubmit=async(e)=>{e.preventDefault();const f=new FormData(e.target);const body={bio:f.get('bio'),rate_45_aed:f.get('rate_45_aed')||null,rate_60_aed:f.get('rate_60_aed')||null};for(const k of ['subjects','grades','curricula','languages'])body[k]=String(f.get(k)||'').split(',').map(x=>x.trim()).filter(Boolean);try{await api('/api/teacher/profile',body,'PUT');$('profileMsg').textContent='Saved. Awaiting admin approval.';}catch(ex){$('profileMsg').textContent=ex.message;}};
    c.querySelectorAll('[data-progress]').forEach(b=>b.onclick=async()=>{const id=b.dataset.progress,el=$('detail-'+id);try{const d=await api('/api/teacher/students/'+id+'/progress');el.textContent=d.correct+' correct / '+d.answered+' answered · '+d.completed+' completed sessions';}catch(ex){el.textContent=ex.message;}});
    c.querySelectorAll('[data-compose]').forEach(b=>b.onclick=()=>{const id=b.dataset.compose,el=$('detail-'+id);el.innerHTML='<form><label>Type<select name="kind"><option>lesson</option><option>assignment</option><option>exam</option></select></label><label>Title<input name="title" maxlength="160" required></label><label>Content<textarea name="body" maxlength="20000" required></textarea></label><label>Due date<input type="date" name="due_at"></label><button class="primary">Send to student</button><p class="small" id="sent-'+id+'"></p></form>';el.querySelector('form').onsubmit=async(e)=>{e.preventDefault();const f=new FormData(e.target);try{await api('/api/teacher/materials',{student_id:Number(id),kind:f.get('kind'),title:f.get('title'),body:f.get('body'),due_at:f.get('due_at')});$('sent-'+id).textContent='Sent successfully.';}catch(ex){$('sent-'+id).textContent=ex.message;}};});
    c.querySelectorAll('[data-chat]').forEach(b=>b.onclick=()=>conversation(b.dataset.chat,meIdFromPage(),$('detail-'+b.dataset.chat)));
  }catch(e){c.innerHTML=err(e);}
}
let activeMeId;
function meIdFromPage(){return activeMeId;}
async function conversation(sid,tid,el){
  try{const messages=await api('/api/messages/'+sid+'/'+tid);el.innerHTML='<div>'+messages.map(m=>'<p class="small"><b>'+esc(m.sender_id===tid?'Teacher':'Student')+':</b> '+esc(m.body)+'</p>').join('')+'</div><form><textarea required maxlength="2000" placeholder="Write a message"></textarea><button>Send</button></form>';el.querySelector('form').onsubmit=async(e)=>{e.preventDefault();try{await api('/api/messages/'+sid+'/'+tid,{body:el.querySelector('textarea').value});await conversation(sid,tid,el);}catch(ex){el.append(document.createTextNode(ex.message));}};}catch(e){el.textContent=e.message;}
}
async function parent(){
 const c=$('content');try{
 const [children,teachers]=await Promise.all([api('/api/parent/children'),api('/api/teachers')]);
 c.innerHTML=box('My children',children.length?children.map(s=>'<div class="box"><b>'+esc(s.display_name)+'</b><p>Grade '+esc(s.grade||'—')+'</p><button data-child="'+s.id+'">View progress</button><div id="child-'+s.id+'"></div></div>').join(''):'<p class="muted">Admin has not linked a child to your account yet.</p>')+
 box('Find a teacher',teachers.length?'<div class="cards">'+teachers.map(t=>'<article class="box"><h2>'+esc(t.display_name)+'</h2><p>'+esc(t.bio)+'</p>'+t.subjects.map(x=>'<span class="pill">'+esc(x)+'</span>').join('')+'<p class="small">Grades: '+esc(t.grades.join(', '))+' · '+esc(t.curricula.join(', '))+'</p><b>AED '+esc(t.rate_45_aed??'—')+' / 45 min · AED '+esc(t.rate_60_aed??'—')+' / 60 min</b><p class="muted small">Booking and payment are not yet available.</p></article>').join('')+'</div>':'<p class="muted">No approved teachers yet.</p>');
 c.querySelectorAll('[data-child]').forEach(b=>b.onclick=async()=>{const id=b.dataset.child,el=$('child-'+id);try{const d=await api('/api/parent/children/'+id+'/progress');el.textContent=d.correct+' correct / '+d.answered+' answered · '+d.completed+' completed sessions';}catch(e){el.textContent=e.message;}});
 }catch(e){c.innerHTML=err(e);}
}
(async()=>{try{const me=await api('/api/me');activeMeId=me.id;}catch(e){}await boot();})();
