/* Clear, task-focused navigation without changing any underlying workflows. */
(function(){
function enhance(role,info){
 const host=document.getElementById('content');if(!host)return;
 const sections=[...host.children].filter(x=>x.tagName==='SECTION');
 const title=role==='teacher'?'Teaching workspace':'Parent dashboard';
 const nav=document.createElement('nav');nav.className='workspace-nav';nav.setAttribute('aria-label',title);
 const intro=document.createElement('section');intro.className='workspace-intro';
 if(role==='teacher'){
  const upcoming=info.bookings.filter(b=>['requested','confirmed'].includes(b.status)).length;
  const pending=info.bookings.filter(b=>b.status==='requested').length;
  intro.innerHTML='<div><span class="workspace-eyebrow">TEACHER / OVERVIEW</span><h2>Make every lesson count<span>.</span></h2><p>Manage requests, your weekly calendar, learners and points in one place.</p></div><div class="workspace-metrics"><div><small>ACTIVE STUDENTS</small><strong>'+info.students+'</strong></div><div><small>UPCOMING / OPEN</small><strong>'+upcoming+'</strong></div><div><small>TO CONFIRM</small><strong>'+pending+'</strong></div><div><small>POINT BALANCE</small><strong>'+info.points+'</strong></div></div>';
 }else{
  const upcoming=info.bookings.filter(b=>['requested','confirmed'].includes(b.status)).length;
  intro.innerHTML='<div><span class="workspace-eyebrow">PARENT / OVERVIEW</span><h2>Learning, made clearer<span>.</span></h2><p>Find a great tutor, follow each child’s progress, and manage upcoming lessons.</p></div><div class="workspace-metrics"><div><small>MY CHILDREN</small><strong>'+info.children+'</strong></div><div><small>OPEN LESSONS</small><strong>'+upcoming+'</strong></div><div><small>APPROVED TUTORS</small><strong>'+info.teachers+'</strong></div><div><small>POINT BALANCE</small><strong>'+info.points+'</strong></div></div>';
 }
 const labels=sections.map(s=>s.querySelector('h2')?.textContent.trim()||'Section');
 const icons=role==='teacher'?['♙','▤','▦','◷','◈']:['◈','♙','⌕','▦','↩'];
 nav.innerHTML=labels.map((label,i)=>'<button type="button" data-tab="'+i+'" class="'+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'"><span aria-hidden="true">'+(icons[i]||'◈')+'</span> '+label+'</button>').join('');
 host.prepend(nav);host.prepend(intro);
 function show(i){sections.forEach((s,n)=>{s.hidden=n!==i;s.classList.toggle('workspace-current',n===i);});nav.querySelectorAll('button').forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-pressed',String(n===i));});}
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>show(Number(b.dataset.tab)));
 show(role==='parent'?Math.max(0,labels.findIndex(x=>/Find your tutor/i.test(x))):Math.max(0,labels.findIndex(x=>/My teaching profile/i.test(x))));
}
window.PortalWorkspace={enhance};
})();
