/* Amer Tutor / professional admin operations console.
   Enhances the existing API-backed forms without replacing their handlers. */
(function(){
const labels={overview:['▦','Overview'],students:['♙','Students'],people:['♧','Teachers & parents'],bookings:['▤','Bookings'],points:['◇','Points & settlements'],refunds:['↩','Refund requests'],schools:['⌂','Schools'],settings:['⚙','Platform settings']};
const safe=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let active='overview',loading=false,version=0,queued=false;
function node(tag,cls){const n=document.createElement(tag);if(cls)n.className=cls;return n;}
function tab(name){
 active=name;
 document.querySelectorAll('.admin-screen').forEach(s=>s.hidden=s.dataset.screen!==name);
 document.querySelectorAll('.admin-nav button[data-screen]').forEach(b=>{const yes=b.dataset.screen===name;b.classList.toggle('active',yes);b.setAttribute('aria-current',yes?'page':'false');});
 const title=document.getElementById('adminScreenTitle');if(title)title.textContent=labels[name][1];
 try{sessionStorage.setItem('amer-admin-tab',name);}catch{}
 document.querySelector('.admin-main')?.scrollTo({top:0,behavior:'smooth'});
}
function ensureShell(){
 const view=document.getElementById('view');if(!view)return null;
 let shell=document.getElementById('adminShell');
 if(!shell){
  shell=node('div','admin-shell');shell.id='adminShell';
  const side=node('aside','admin-sidebar');
  side.innerHTML='<a class="admin-brand" href="/"><span>▦</span><strong>AMER<br>TUTOR</strong><small>ADMIN / OS</small></a><div class="admin-side-label">WORKSPACE</div><nav class="admin-nav" aria-label="Admin workspace">'+Object.entries(labels).map(([key,[icon,label]])=>'<button type="button" data-screen="'+key+'"><span>'+icon+'</span>'+label+'</button>').join('')+'</nav><div class="admin-side-foot"><strong>● DEMO POINTS MODE</strong><small>15% platform commission<br>No real payments enabled</small></div>';
  const main=node('div','admin-main');main.innerHTML='<header class="admin-console-top"><div><span class="admin-eyebrow">OPERATIONS / AMER TUTOR</span><h1 id="adminScreenTitle">Overview</h1></div><div class="admin-top-actions"><span id="adminToday"></span><button id="adminRefresh" type="button">↻ Refresh</button></div></header><div class="admin-screen-holder"></div>';
  const holder=main.querySelector('.admin-screen-holder');
  view.parentNode.insertBefore(shell,view);shell.append(side,main);holder.append(view);
  view.classList.add('admin-view');
  for(const key of Object.keys(labels)){const section=node('section','admin-screen');section.dataset.screen=key;section.hidden=true;view.append(section);}
  side.querySelectorAll('button').forEach(b=>b.onclick=()=>tab(b.dataset.screen));
  main.querySelector('#adminRefresh').onclick=()=>{if(typeof overview==='function')overview();};
  main.querySelector('#adminToday').textContent=new Intl.DateTimeFormat('en-AE',{dateStyle:'medium',timeZone:'Asia/Dubai'}).format(new Date())+' · Dubai';
 }
 return view;
}
function move(id,screen){
 const el=document.getElementById(id);const dest=document.querySelector('.admin-screen[data-screen="'+screen+'"]');if(el&&dest&&el.parentNode!==dest)dest.append(el);
}
function rebuild(){
 const view=document.getElementById('view');
 if(!view||!view.querySelector('.tiles')||!view.querySelector('#addForm'))return;
 ensureShell();
 const screens=[...view.querySelectorAll('.admin-screen')];
 // On every overview refresh, old screens are removed by the existing render. Recreate them.
 for(const key of Object.keys(labels))if(!view.querySelector('.admin-screen[data-screen="'+key+'"]')){const el=node('section','admin-screen');el.dataset.screen=key;el.hidden=true;view.append(el);}
 const s=k=>view.querySelector('.admin-screen[data-screen="'+k+'"]');
 const header=view.querySelector(':scope > header'),tiles=view.querySelector(':scope > .tiles'),table=view.querySelector(':scope > .table-wrap');
 if(header)s('overview').append(header);
 if(tiles)s('overview').append(tiles);
 if(table)s('students').append(table);
 move('addForm','students');move('billForm','settings');
 const school=[...view.children].find(x=>x.classList.contains('section')&&x.querySelector('#schForm'));if(school)s('schools').append(school);
 const marketplace=document.getElementById('marketplaceAdmin');
 if(marketplace&&!marketplace.dataset.split){
  marketplace.dataset.split='1';
  const chunks={people:[],bookings:[],points:[],refunds:[]};
  let current='people';
  [...marketplace.children].forEach(child=>{
   if(child.tagName==='H3'){
    const t=child.textContent.toLowerCase();
    if(t.includes('lesson bookings'))current='bookings';
    else if(t.includes('point refund'))current='refunds';
    else if(t.includes('demo point')||t.includes('completed lesson'))current='points';
   }
   chunks[current].push(child);
  });
  for(const [key,items] of Object.entries(chunks)){
   if(!items.length)continue;
   const panel=node('section','admin-ops-panel');
   for(const child of items)panel.append(child);
   s(key).append(panel);
  }
  marketplace.remove();
 }
 const screensNow=[...view.querySelectorAll('.admin-screen')];
 screensNow.forEach(x=>x.hidden=x.dataset.screen!==active);
 if(!s(active))active='overview';
 tab(active);
 renderDashboard();
}
async function renderDashboard(){
 const target=document.querySelector('.admin-screen[data-screen="overview"]');
 if(!target||target.dataset.dashboard==='1')return;
 target.dataset.dashboard='1';
 const dash=node('div','admin-live-dashboard');target.prepend(dash);
 dash.innerHTML='<div class="admin-loading">Loading platform metrics…</div>';
 const token=++version;
 try{
  const [o,accounts,bookings,refunds]=await Promise.all([api('/api/admin/overview'),api('/api/admin/accounts'),api('/api/admin/bookings'),api('/api/admin/refunds')]);
  if(token!==version||!dash.isConnected)return;
  const teachers=accounts.filter(x=>x.role==='teacher'),parents=accounts.filter(x=>x.role==='parent');
  const pending=teachers.filter(x=>!x.approved),requested=bookings.filter(x=>x.status==='requested'),confirmed=bookings.filter(x=>x.status==='confirmed'),completed=bookings.filter(x=>x.status==='completed'),paid=bookings.filter(x=>x.payment_status==='paid');
  const refundsPending=refunds.filter(x=>x.status==='requested');
  const count=[['STUDENTS',o.students.length,'♙'],['TEACHERS',teachers.length,'♧'],['PARENTS',parents.length,'♧'],['LESSONS',bookings.length,'▤'],['AWAITING APPROVAL',pending.length,'!'],['OPEN REQUESTS',requested.length,'↗'],['CONFIRMED',confirmed.length,'✓'],['REFUND REQUESTS',refundsPending.length,'↩']];
  const status=[['Requested',requested.length],['Confirmed',confirmed.length],['Completed',completed.length],['Cancelled',bookings.filter(x=>x.status==='cancelled').length]];
  const max=Math.max(1,...status.map(x=>x[1]));
  const names=new Map([...o.students,...accounts].map(x=>[x.id,x.display_name]));
  dash.innerHTML='<div class="admin-hero"><div><span class="admin-eyebrow">PLATFORM / CONTROL CENTER</span><h2>Everything in<br><em>one place.</em></h2><p>Monitor learning, manage tutors and families, review lessons and settle demo points.</p></div><div class="admin-hero-actions"><button data-jump="people">+ Add teacher / parent</button><button data-jump="students">+ Add student</button><button data-jump="bookings">Review bookings ↗</button></div></div>'+
  '<div class="admin-stat-grid">'+count.map(([title,value,icon])=>'<article class="admin-stat"><div><span>'+title+'</span><b>'+icon+'</b></div><strong>'+value+'</strong></article>').join('')+'</div>'+
  '<div class="admin-data-grid"><section class="admin-graph"><div class="admin-section-heading"><h3>Lesson pipeline</h3><span>LIVE DATA</span></div><div class="admin-bars">'+status.map(([name,n])=>'<div class="admin-bar-row"><span>'+name+'</span><div><i style="width:'+Math.max(0,n/max*100)+'%"></i></div><strong>'+n+'</strong></div>').join('')+'</div><p>Booking statuses from the last 200 records.</p></section>'+
  '<section class="admin-queue"><div class="admin-section-heading"><h3>Needs attention</h3><span>ACTION QUEUE</span></div>'+[
   ['Tutor approvals',pending.length,'people'],['Lesson requests',requested.length,'bookings'],['Refund reviews',refundsPending.length,'refunds'],['Completed lessons',completed.filter(x=>x.payment_status==='paid').length,'points']
  ].map(([label,n,key])=>'<button data-jump="'+key+'"><span>'+label+'</span><b>'+n+'</b><span>↗</span></button>').join('')+'</section></div>'+
  '<section class="admin-recent"><div class="admin-section-heading"><h3>Recent lessons</h3><button data-jump="bookings">View all ↗</button></div><div class="table-wrap"><table><thead><tr><th>Booking</th><th>Teacher</th><th>Student</th><th>Dubai time</th><th>Points</th><th>Status</th></tr></thead><tbody>'+bookings.slice(0,8).map(b=>'<tr><td>#'+b.id+'</td><td>'+safe(names.get(b.teacher_id)||'Tutor #'+b.teacher_id)+'</td><td>'+safe(names.get(b.student_id)||'Student #'+b.student_id)+'</td><td>'+safe(b.start_at)+'</td><td>'+b.amount_aed+'</td><td><span class="admin-badge">'+safe(b.status)+'</span></td></tr>').join('')+(bookings.length?'':'<tr><td colspan="6">No bookings yet.</td></tr>')+'</tbody></table></div></section>';
  // Operational tables use the same live records as the KPI overview.
  const bookingScreen=document.querySelector('.admin-screen[data-screen="bookings"]');
  if(bookingScreen&&!bookingScreen.querySelector('#adminBookingTable')){
   const list=node('section','admin-ops-panel');list.id='adminBookingTable';
   list.innerHTML='<div class="admin-section-heading"><h3>All lesson bookings</h3><label>Status <select id="adminBookingFilter"><option value="">All statuses</option><option>requested</option><option>confirmed</option><option>completed</option><option>cancelled</option></select></label></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Parent</th><th>Student</th><th>Teacher</th><th>Dubai time</th><th>Duration</th><th>Points</th><th>Status</th><th>Transfer</th></tr></thead><tbody id="adminBookingRows"></tbody></table></div>';
   bookingScreen.prepend(list);
   // Hide the old text-only booking listing without removing the existing API actions.
   const legacy=bookingScreen.querySelector('.admin-ops-panel:not(#adminBookingTable)');if(legacy)legacy.hidden=true;
   function drawBookings(){
    const filter=list.querySelector('#adminBookingFilter').value;
    const rows=bookings.filter(b=>!filter||b.status===filter);
    list.querySelector('#adminBookingRows').innerHTML=rows.map(b=>'<tr><td>#'+b.id+'</td><td>'+safe(names.get(b.parent_id)||'Parent #'+b.parent_id)+'</td><td>'+safe(names.get(b.student_id)||'Student #'+b.student_id)+'</td><td>'+safe(names.get(b.teacher_id)||'Teacher #'+b.teacher_id)+'</td><td>'+safe(b.start_at)+'</td><td>'+b.minutes+' min</td><td>'+b.amount_aed+'</td><td><span class="admin-badge">'+safe(b.status)+'</span></td><td>'+safe(b.payment_status)+'</td></tr>').join('')+(rows.length?'':'<tr><td colspan="9">No matching lessons.</td></tr>');
   }
   list.querySelector('#adminBookingFilter').onchange=drawBookings;drawBookings();
  }
  const peopleScreen=document.querySelector('.admin-screen[data-screen="people"]');
  if(peopleScreen&&!peopleScreen.querySelector('#adminAccountSearch')){
   const search=document.createElement('label');search.className='admin-search-label';search.textContent='Search teacher or parent';
   search.innerHTML='<span>Search teachers and parents</span><input type="search" id="adminAccountSearch" placeholder="Name or role…">';
   peopleScreen.prepend(search);
   search.querySelector('input').addEventListener('input',e=>{
    const q=e.target.value.toLowerCase().trim();
    peopleScreen.querySelectorAll('tbody tr').forEach(tr=>{tr.hidden=!tr.textContent.toLowerCase().includes(q);});
   });
   const parentInput=peopleScreen.querySelector('#grantPoints input[name="parent_id"]');
   if(parentInput){
    const select=document.createElement('select');select.name='parent_id';select.required=true;
    select.innerHTML='<option value="">Select a parent</option>'+parents.map(p=>'<option value="'+p.id+'">'+safe(p.display_name)+' (#'+p.id+')</option>').join('');
    // Point grant form lives on the Points tab, not People.
   }
  }
  const grant=document.querySelector('.admin-screen[data-screen="points"] #grantPoints input[name="parent_id"]');
  if(grant){
   const select=document.createElement('select');select.name='parent_id';select.required=true;
   select.innerHTML='<option value="">Select a parent</option>'+parents.map(p=>'<option value="'+p.id+'">'+safe(p.display_name)+' (#'+p.id+')</option>').join('');
   grant.replaceWith(select);
  }
  dash.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>tab(b.dataset.jump));
  const legacy=target.querySelector(':scope > header, :scope > .tiles');if(legacy){target.querySelector(':scope > header')?.classList.add('admin-legacy');target.querySelector(':scope > .tiles')?.classList.add('admin-legacy');}
 }catch(e){dash.innerHTML='<p class="admin-error">Dashboard metrics unavailable: '+safe(e.message)+'</p>';}
}
function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;const v=document.getElementById('view');if(v&&v.querySelector('.tiles')&&v.querySelector('#addForm'))rebuild();},120);}
document.addEventListener('DOMContentLoaded',()=>{
 try{const saved=sessionStorage.getItem('amer-admin-tab');if(labels[saved])active=saved;}catch{}
 new MutationObserver(schedule).observe(document.getElementById('root')||document.body,{subtree:true,childList:true});
 schedule();
});
})();
