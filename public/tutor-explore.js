/* AMER TUTOR — native JS public tutor listing and profile.
   Production data from approved teacher API; ratings are explicitly sample-only for demo records. */
(function(){
'use strict';
const DEMO=Object.freeze({
 'Aisyah Rahman':{rating:4.9,reviews:112,subject:'Mathematics',curriculum:'IGCSE',years:3,style:['Clear explanations','Practice questions','Exam techniques','Interactive and supportive']},
 'Daniel Tan':{rating:4.8,reviews:85,subject:'Science',curriculum:'A Level',years:4,style:['Real-world examples','Practice questions','Visual explanations','Exam techniques']},
 'Kavitha Nair':{rating:4.9,reviews:130,subject:'English',curriculum:'IELTS',years:5,style:['Reading strategies','Writing feedback','Speaking practice','Interactive and supportive']},
 'Jason Lim':{rating:4.7,reviews:98,subject:'Bahasa Melayu',curriculum:'SPM',years:3,style:['Language practice','Past papers','Writing feedback','Exam techniques']}
});
const $=(q,root=document)=>root.querySelector(q);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=n=>String(n||'Tutor').split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase();
const allText=t=>[t.display_name,t.bio,...(t.subjects||[]),...(t.grades||[]),...(t.curricula||[]),...(t.languages||[])].join(' ').toLowerCase();
const demo=t=>t.is_demo?DEMO[t.display_name]:null;
const mainSubject=t=>demo(t)?.subject||(t.subjects||[])[0]||'Tutoring';
const mainCurriculum=t=>demo(t)?.curriculum||(t.curricula||[])[0]||'';
const rate=t=>Number.isFinite(Number(t.rate_45_aed))&&t.rate_45_aed!==null?Number(t.rate_45_aed):null;
const portrait=t=>t.photo_url?'<img src="'+safe(t.photo_url)+'" alt="Illustrated profile avatar for '+safe(t.display_name)+'" loading="lazy">':'<div class="tx-avatar-fallback" aria-label="Initials avatar">'+safe(initials(t.display_name))+'</div>';
let teachers=[];
function card(t,saved){
 const d=demo(t),r=rate(t),status=t.is_demo?'● Online · Demo':'✓ Approved tutor';
 return '<article class="tx-card"><div class="tx-photo">'+portrait(t)+'<span class="tx-status">'+safe(status)+'</span></div>'+
 '<button type="button" class="tx-heart" data-save="'+t.id+'" aria-label="'+(saved?'Remove saved tutor':'Save tutor')+'" aria-pressed="'+saved+'">'+(saved?'♥':'♡')+'</button>'+
 '<div class="tx-card-body"><h2>'+safe(t.display_name)+'</h2>'+
 (d?'<div class="tx-rating"><span class="tx-star">★</span> '+d.rating.toFixed(1)+' ('+d.reviews+' sample reviews)</div><div class="tx-rating-note">Illustrative demo rating — not verified reviews</div>':'<div class="tx-rating-note">No verified reviews yet</div>')+
 '<div class="tx-subject">'+safe(mainSubject(t))+' · '+safe(mainCurriculum(t))+'</div>'+
 '<div class="tx-subject-tags">'+(t.subjects||[]).slice(0,2).map(s=>'<span>'+safe(s)+'</span>').join('')+'</div>'+
 '<div class="tx-price"><strong>'+(r??'—')+'</strong> points / 45 min</div>'+
 '<a class="tx-primary" href="/tutor/'+t.id+'">View Profile ↗</a></div></article>';
}
function readSaved(){try{const x=JSON.parse(localStorage.getItem('amer-favourite-tutors')||'[]');return new Set(Array.isArray(x)?x.map(Number):[]);}catch{return new Set();}}
function save(id,set){set.has(id)?set.delete(id):set.add(id);try{localStorage.setItem('amer-favourite-tutors',JSON.stringify([...set]));}catch{}}
async function load(){
 const res=await fetch('/api/public/teachers',{credentials:'omit'});
 if(!res.ok)throw Error('Tutor directory is temporarily unavailable.');
 const x=await res.json();if(!Array.isArray(x))throw Error('Invalid tutor directory response');
 teachers=x;return x;
}
function listPage(){
 const root=$('#txListing');if(!root)return;
 const saved=readSaved(),subjects=['All Tutors',...new Set(teachers.flatMap(t=>t.subjects||[]))].sort((a,b)=>a==='All Tutors'?-1:b==='All Tutors'?1:a.localeCompare(b));
 const sampleSubjects=['Mathematics','Science','English','Physics','Chemistry','Bahasa Melayu'];
 const choices=['All Tutors',...sampleSubjects.filter(x=>subjects.includes(x)),...subjects.filter(x=>x!=='All Tutors'&&!sampleSubjects.includes(x))];
 const grades=[...new Set(teachers.flatMap(t=>t.grades||[]))].sort(),curricula=[...new Set(teachers.flatMap(t=>t.curricula||[]))].sort();
 const costs=teachers.map(rate).filter(x=>x!==null),min=Math.min(30,...costs),max=Math.max(120,...costs);
 root.innerHTML='<div class="tx-page-head"><div><span class="tx-eyebrow">DISCOVER / AMER TUTOR</span><h1>Find Your Tutor</h1><p>Expert tutors for every subject. Flexible times. Online. Simple.</p></div><span class="tx-count" id="txCount"></span></div>'+
 '<form class="tx-filters" id="txFilters" role="search"><label><span>Search tutors</span><input type="search" name="query" placeholder="Search by subject, tutor name or keyword..." aria-label="Search tutors"></label>'+
 '<label><span>Subject</span><select name="subject"><option value="">All subjects</option>'+choices.slice(1).map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('')+'</select></label>'+
 '<label><span>Grade level</span><select name="grade"><option value="">All levels</option>'+grades.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('')+'</select></label>'+
 '<label><span>Curriculum</span><select name="curriculum"><option value="">All curricula</option>'+curricula.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('')+'</select></label>'+
 '<label><span>Price Range (points): <output id="txBudgetLabel">'+min+'–'+max+'</output></span><div class="tx-budget-box"><input type="range" name="price" min="'+min+'" max="'+max+'" value="'+max+'" step="5" aria-label="Maximum lesson price in points"></div></label></form>'+
 '<div class="tx-filter-footer"><div id="txChips" class="tx-chips" role="group" aria-label="Filter by subject"></div><label class="tx-sort">Sort by: <select id="txSort"><option value="rating">Highest Rated</option><option value="name">Name A–Z</option><option value="price">Lowest points</option><option value="priceDesc">Highest points</option></select></label></div>'+
 '<div class="tx-grid" id="txGrid" aria-live="polite"></div>';
 const form=$('#txFilters'),grid=$('#txGrid'),chips=$('#txChips'),price=form.elements.price,label=$('#txBudgetLabel');
 let selected='';
 function renderChips(){
 chips.innerHTML=choices.map(x=>{const n=x==='All Tutors'?teachers.length:teachers.filter(t=>(t.subjects||[]).includes(x)).length;return '<button type="button" class="tx-chip" data-subject="'+safe(x==='All Tutors'?'':x)+'" aria-pressed="'+(selected===(x==='All Tutors'?'':x))+'">'+safe(x)+' ('+n+')</button>';}).join('');
 chips.querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=b.dataset.subject;form.elements.subject.value=selected;render();});
 }
 function render(){
  selected=form.elements.subject.value;const q=form.elements.query.value.trim().toLowerCase(),grade=form.elements.grade.value,curr=form.elements.curriculum.value,limit=Number(price.value),sort=$('#txSort').value;
  label.textContent=min+'–'+limit;
  const found=teachers.filter(t=>(!q||allText(t).includes(q))&&(!selected||(t.subjects||[]).includes(selected))&&(!grade||(t.grades||[]).includes(grade))&&(!curr||(t.curricula||[]).includes(curr))&&(rate(t)===null||rate(t)<=limit));
  found.sort((a,b)=>sort==='rating'?(demo(b)?.rating??-1)-(demo(a)?.rating??-1)||a.display_name.localeCompare(b.display_name):sort==='price'?(rate(a)??Infinity)-(rate(b)??Infinity):sort==='priceDesc'?(rate(b)??-1)-(rate(a)??-1):a.display_name.localeCompare(b.display_name));
  $('#txCount').textContent=found.length+' tutor'+(found.length===1?'':'s')+' found';
  grid.innerHTML=found.length?found.map(t=>card(t,saved.has(t.id))).join(''):'<div class="tx-empty"><h2>No tutors found</h2><p>Try another subject, grade or price range.</p><button type="button" class="tx-secondary" id="txReset">Clear filters</button></div>';
  grid.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{save(Number(b.dataset.save),saved);render();});
  $('#txReset')?.addEventListener('click',()=>{form.reset();selected='';render();});
  renderChips();
 }
 form.addEventListener('input',render);form.addEventListener('change',render);$('#txSort').addEventListener('change',render);render();
}
async function detailPage(){
 const root=$('#txDetail');if(!root)return;
 const id=Number(location.pathname.match(/\/tutor\/(\d+)/)?.[1]);
 const t=teachers.find(x=>x.id===id);
 if(!t){root.innerHTML='<div class="tx-empty"><h1>Tutor not found</h1><a class="tx-secondary" href="/tutors">Back to tutors</a></div>';return;}
 document.title=t.display_name+' · AMER TUTOR';
 const d=demo(t),subjects=t.subjects||[],grades=t.grades||[],curricula=t.curricula||[],languages=t.languages||[];
 const defaultStyle=d?.style||['Clear explanations','Practice questions','Friendly support','Structured learning'];
 root.innerHTML='<a class="tx-back" href="/tutors">← Back to tutors</a>'+
 '<div class="tx-profile-grid"><section class="tx-profile-main"><div class="tx-profile-intro"><div><div class="tx-profile-portrait">'+portrait(t)+'<span class="tx-status">'+(t.is_demo?'● Online · Demo':'✓ Approved')+'</span></div><div class="tx-thumbs" aria-label="Portrait gallery">'+[0,1,2,3].map((n)=>'<button type="button" aria-label="View avatar '+(n+1)+'" aria-pressed="'+(n===0)+'">'+portrait(t)+'</button>').join('')+'</div></div>'+
 '<div><span class="tx-eyebrow">✓ VERIFIED LISTING'+(t.is_demo?' · DEMO ACCOUNT':'')+'</span><h1 class="tx-profile-title">'+safe(t.display_name)+'</h1>'+
 (d?'<div class="tx-rating"><span class="tx-star">★</span> '+d.rating.toFixed(1)+' ('+d.reviews+' demo reviews)</div><p class="tx-rating-note">Illustrative demo data; no verified reviews</p>':'<p>No verified reviews yet</p>')+
 '<div class="tx-profile-role">'+safe(mainSubject(t))+' Tutor</div><div class="tx-attribute">▤ <strong>Levels:</strong> '+safe(grades.join(' · ')||'Not specified')+'</div>'+
 '<div class="tx-attribute">◎ <strong>Languages:</strong> '+safe(languages.join(', ')||'Not specified')+'</div>'+
 (d?'<div class="tx-attribute">◷ <strong>Experience:</strong> '+d.years+'+ years (demo profile)</div>':'')+
 '<p class="tx-bio">'+safe(t.bio||'This tutor has not added a biography yet.')+'</p></div></div>'+
 '<div class="tx-tabs" role="tablist" aria-label="Tutor profile information">'+['About','Subjects','Availability','Reviews'+(d?' ('+d.reviews+' demo)':'')].map((x,i)=>'<button type="button" role="tab" data-tab="'+i+'" aria-selected="'+(i===0)+'">'+x+'</button>').join('')+'</div><div id="txTabPanel" class="tx-tab-panel" role="tabpanel"></div></section>'+
 '<aside class="tx-booking" aria-label="Book a lesson"><div class="tx-book-head"><div><h2>Book a Lesson</h2><small>Dubai time (GMT+4) · Asia/Dubai</small></div><span class="tx-eyebrow">LIVE SLOTS</span></div>'+
 '<div class="tx-duration"><button type="button" data-duration="45" aria-pressed="true">45 min</button><button type="button" data-duration="60" aria-pressed="false">60 min</button></div>'+
 '<div class="tx-date-rail" id="txDateRail"></div><h3>Available start times</h3><div class="tx-slot-grid" id="txSlotGrid" aria-live="polite"></div>'+
 '<div class="tx-legend"><span><i class="available"></i> Available</span><span><i class="booked"></i> Unavailable</span><span><i class="selected"></i> Selected</span></div>'+
 '<div id="txSelection" class="tx-note">Select an available date and time to continue.</div>'+
 '<a id="txContinue" class="tx-primary" href="/login">Continue to Login ↗</a>'+
 '<p class="tx-helper">Please login to book this lesson. No points are transferred before confirmation.</p></aside></div>';
 const panel=$('#txTabPanel');
 function tab(i){
  $('#txDetail').querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(Number(b.dataset.tab)===i)));
  if(i===0)panel.innerHTML='<h3>About '+safe(t.display_name)+'</h3><p class="tx-bio">'+safe(t.bio||'No introduction supplied.')+'</p><h3>Teaching style'+(d?' (demo)':'')+'</h3><div class="tx-checks">'+defaultStyle.map(x=>'<span>✓ '+safe(x)+'</span>').join('')+'</div>';
  if(i===1)panel.innerHTML='<h3>Subjects & Levels</h3><div class="tx-tags">'+[...subjects,...grades,...curricula].map(x=>'<span>'+safe(x)+'</span>').join('')+'</div>';
  if(i===2)panel.innerHTML='<h3>Availability</h3><p>Select a day in the booking calendar to see real free times. These times are not guaranteed until a booking is accepted.</p>';
  if(i===3)panel.innerHTML='<h3>Reviews</h3><p>'+(d?'The '+d.reviews+' review count and '+d.rating.toFixed(1)+' rating are illustrative demo data, not submitted customer reviews.':'No verified reviews have been published for this tutor yet.')+'</p>';
 }
 root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(Number(b.dataset.tab)));tab(0);
 root.querySelectorAll('.tx-thumbs button').forEach((b,i)=>b.onclick=()=>{root.querySelectorAll('.tx-thumbs button').forEach((x,j)=>x.setAttribute('aria-pressed',String(i===j)));});
 let duration=45,calendar=[],selectedDate=null,selectedSlot=null,page=0,requestId=0;
 const dateRail=$('#txDateRail'),slotGrid=$('#txSlotGrid'),selection=$('#txSelection'),continueLink=$('#txContinue');
 const weekday=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 const fmt=t=>{const [h,m]=t.split(':').map(Number);return(h%12||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM');};
 function display(){
  const visible=calendar.slice(page*5,page*5+5);
  dateRail.innerHTML='<button type="button" data-arrow="-1" '+(page===0?'disabled':'')+' aria-label="Previous dates">‹</button>'+
  visible.map(x=>'<button type="button" data-date="'+x.date+'" aria-pressed="'+(selectedDate===x.date)+'" '+(!x.times.length?'disabled':'')+'><span>'+weekday[x.weekday]+'</span><strong>'+Number(x.date.slice(8))+'</strong><small>'+x.date.slice(5,7)+'</small></button>').join('')+
  '<button type="button" data-arrow="1" '+((page+1)*5>=calendar.length?'disabled':'')+' aria-label="Next dates">›</button>';
  const opts=calendar.find(x=>x.date===selectedDate)?.times||[];
  slotGrid.innerHTML=opts.length?opts.map(t=>'<button type="button" class="tx-slot" data-time="'+t+'" aria-pressed="'+(selectedSlot===t)+'">'+fmt(t.slice(11))+'</button>').join(''):'<p>No free times on this day. Please choose another day.</p>';
  selection.textContent=selectedSlot?'Selected: '+selectedSlot.slice(0,10)+' at '+fmt(selectedSlot.slice(11))+' · '+duration+' min · '+(duration===60?t.rate_60_aed:t.rate_45_aed)+' points':'Choose a free time, then continue to log in.';
  dateRail.querySelectorAll('[data-arrow]').forEach(b=>b.onclick=()=>{page=Math.max(0,Math.min(2,page+Number(b.dataset.arrow)));display();});
  dateRail.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{selectedDate=b.dataset.date;selectedSlot=null;display();});
  slotGrid.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{selectedSlot=b.dataset.time;display();});
 }
 async function times(){
  const token=++requestId;selection.textContent='Loading real availability…';slotGrid.innerHTML='';
  try{const res=await fetch('/api/public/teachers/'+id+'/calendar?duration='+duration,{credentials:'omit',cache:'no-store'});if(!res.ok)throw Error('Could not load availability');const data=await res.json();if(token!==requestId)return;
   calendar=data.days||[];selectedDate=calendar.find(x=>x.times.length)?.date||calendar[0]?.date||null;page=Math.max(0,Math.floor(calendar.findIndex(x=>x.date===selectedDate)/5));selectedSlot=null;display();
  }catch(e){if(token===requestId){selection.textContent=e.message;dateRail.innerHTML='';slotGrid.innerHTML='';}}
 }
 root.querySelectorAll('[data-duration]').forEach(b=>b.onclick=()=>{duration=Number(b.dataset.duration);root.querySelectorAll('[data-duration]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));times();});
 continueLink.addEventListener('click',e=>{
  if(!selectedSlot){e.preventDefault();selection.textContent='Select an available lesson time first.';return;}
  try{sessionStorage.setItem('amer-pending-booking',JSON.stringify({teacher_id:id,start_at:selectedSlot,minutes:duration}));}catch{}
  continueLink.href='/login?next='+encodeURIComponent('/portal?teacher='+id);
 });
 await times();
}
async function start(){
 try{await load();if($('#txListing'))listPage();if($('#txDetail'))await detailPage();}
 catch(e){const el=$('#txListing')||$('#txDetail');if(el)el.innerHTML='<div class="tx-empty"><h2>Could not load tutors</h2><p>'+safe(e.message)+'</p><button type="button" class="tx-secondary" id="txRetry">Try again</button></div>';$('#txRetry')?.addEventListener('click',start);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();