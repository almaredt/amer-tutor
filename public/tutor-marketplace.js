/* Amer Tutor marketplace — only real approved teachers, no invented ratings or photos. */
(function(){
const safe=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const initials=s=>String(s||'T').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
function mount(el,teachers,onBook){
 let search='',subject='',grade='',curriculum='',sort='name',max=Infinity,selected=null,favourites=new Set();
 try{favourites=new Set(JSON.parse(localStorage.getItem('amer-favourite-tutors')||'[]').map(Number));}catch{}
 const subjects=[...new Set(teachers.flatMap(t=>t.subjects||[]))].sort(),grades=[...new Set(teachers.flatMap(t=>t.grades||[]))].sort(),curricula=[...new Set(teachers.flatMap(t=>t.curricula||[]))].sort();
 const prices=teachers.map(t=>Number(t.rate_45_aed)).filter(Number.isFinite),maxPrice=Math.max(100,...prices);
 el.innerHTML='<div class="market-heading"><div><span class="market-eyebrow">FIND YOUR PERFECT MATCH / AMER TUTOR</span><h2>Find your tutor<span class="market-dot">.</span></h2><p>Explore approved teachers, compare subjects and points, then choose an available lesson time.</p></div><span class="market-count" id="marketCount"></span></div><div class="market-filters"><label class="market-search"><span>Search</span><input type="search" id="marketSearch" placeholder="Teacher name, subject, or keyword"></label><label>Subject<select id="marketSubject"><option value="">All subjects</option>'+subjects.map(x=>'<option>'+safe(x)+'</option>').join('')+'</select></label><label>Grade<select id="marketGrade"><option value="">All grades</option>'+grades.map(x=>'<option>'+safe(x)+'</option>').join('')+'</select></label><label>Curriculum<select id="marketCurriculum"><option value="">All curricula</option>'+curricula.map(x=>'<option>'+safe(x)+'</option>').join('')+'</select></label><label>Sort<select id="marketSort"><option value="name">Name A–Z</option><option value="price">Lowest points</option><option value="price-desc">Highest points</option></select></label><label class="market-budget">Max points / 45 min <output id="marketBudgetLabel">Any</output><input id="marketBudget" type="range" min="0" max="'+maxPrice+'" value="'+maxPrice+'" step="5"></label><button type="button" id="marketReset">Reset filters ↺</button></div><div class="market-grid" id="marketGrid"></div><div id="marketDetail"></div>';
 const grid=el.querySelector('#marketGrid'),detail=el.querySelector('#marketDetail');
 function render(){
  const list=teachers.filter(t=>(!search||[t.display_name,t.bio,...(t.subjects||[]),...(t.grades||[]),...(t.curricula||[])].join(' ').toLowerCase().includes(search))&&(!subject||(t.subjects||[]).includes(subject))&&(!grade||(t.grades||[]).includes(grade))&&(!curriculum||(t.curricula||[]).includes(curriculum))&&(t.rate_45_aed==null||Number(t.rate_45_aed)<=max));
  list.sort((a,b)=>sort==='price'?Number(a.rate_45_aed??Infinity)-Number(b.rate_45_aed??Infinity):sort==='price-desc'?Number(b.rate_45_aed??-1)-Number(a.rate_45_aed??-1):a.display_name.localeCompare(b.display_name));
  el.querySelector('#marketCount').textContent=list.length+' approved tutor'+(list.length===1?'':'s');
  grid.innerHTML=list.length?list.map(t=>'<article class="market-card"><div class="market-portrait" aria-hidden="true">'+(t.photo_url?'<img loading="lazy" src="'+safe(t.photo_url)+'" alt="Tutor portrait">':'<span>'+safe(initials(t.display_name))+'</span>')+'<small>AMER / TUTOR</small></div><button class="market-heart'+(favourites.has(t.id)?' saved':'')+'" type="button" data-save="'+t.id+'" aria-label="'+(favourites.has(t.id)?'Remove from':'Add to')+' saved tutors" aria-pressed="'+favourites.has(t.id)+'">'+(favourites.has(t.id)?'♥':'♡')+'</button><div class="market-card-body"><div class="market-approved">✓ ADMIN APPROVED'+(t.is_demo?' · DEMO':'')+'</div><h3>'+safe(t.display_name)+'</h3><p class="market-subjects">'+(t.subjects||[]).slice(0,3).map(s=>'<span>'+safe(s)+'</span>').join('')+'</p><p class="market-card-bio">'+safe((t.bio||'No introduction yet.').slice(0,125))+'</p><p class="market-meta">'+safe((t.grades||[]).slice(0,3).join(' · ')||'All grades')+' · '+safe((t.curricula||[]).slice(0,2).join(', ')||'Curriculum not specified')+'</p><div class="market-card-foot"><div><strong>'+safe(t.rate_45_aed??'Ask')+'</strong><small>points / 45 min</small></div><button type="button" data-profile="'+t.id+'">View profile ↗</button></div></div></article>').join(''):'<div class="market-empty"><h3>No matching tutors</h3><p>Try another subject, grade, or point range.</p><button type="button" id="marketClear">Clear filters</button></div>';
  grid.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.save);favourites.has(id)?favourites.delete(id):favourites.add(id);try{localStorage.setItem('amer-favourite-tutors',JSON.stringify([...favourites]));}catch{}render();});
  grid.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>profile(Number(b.dataset.profile)));
  const clear=grid.querySelector('#marketClear');if(clear)clear.onclick=reset;
 }
 function profile(id){
  const t=teachers.find(x=>x.id===id);if(!t)return;
  selected=id;
  grid.querySelectorAll('.market-card').forEach(card=>card.classList.toggle('market-card-active',Number(card.querySelector('[data-profile]')?.dataset.profile)===id));
  const portrait=t.photo_url?'<img src="'+safe(t.photo_url)+'" alt="Illustrated tutor avatar">':'<span>'+safe(initials(t.display_name))+'</span>';
  detail.innerHTML='<section class="market-profile" aria-label="Tutor details">'+
   '<div class="market-profile-top"><div class="market-profile-avatar">'+portrait+'</div><div class="market-profile-name"><span class="market-approved">✓ APPROVED'+(t.is_demo?' · DEMO PROFILE':'')+'</span><h3>'+safe(t.display_name)+'</h3><p>'+safe((t.subjects||[]).join(' · ')||'Tutor')+'</p></div></div>'+
   '<div class="market-profile-quick"><span>▤ '+safe((t.grades||[]).slice(0,2).join(' / ')||'All grades')+'</span><span>⌂ '+safe((t.curricula||[]).slice(0,2).join(' / ')||'Curriculum not listed')+'</span><span>◉ '+safe((t.languages||[]).slice(0,2).join(', ')||'Languages not listed')+'</span></div>'+
   '<div class="market-profile-rates"><div><small>45 MINUTES</small><strong>'+safe(t.rate_45_aed??'—')+' <em>points</em></strong></div><div><small>60 MINUTES</small><strong>'+safe(t.rate_60_aed??'—')+' <em>points</em></strong></div></div>'+
   '<div class="market-profile-tabs" role="tablist" aria-label="Tutor profile sections"><button type="button" class="active" role="tab" aria-selected="true" data-info="about">About</button><button type="button" role="tab" aria-selected="false" data-info="subjects">Subjects</button><button type="button" role="tab" aria-selected="false" data-info="availability">Availability</button></div>'+
   '<div class="market-info-panel" id="marketInfoPanel"></div>'+
   '<button type="button" id="marketBook" class="market-book-btn primary">See available times ↗</button>'+
   '<p class="market-book-note">Dubai time · Sign in only when you book a lesson.</p>'+
   '</section>';
  const info=detail.querySelector('#marketInfoPanel');
  const panels={
   about:'<h4>About '+safe(t.display_name)+'</h4><p class="market-full-bio">'+safe(t.bio||'This tutor has not written an introduction yet.')+'</p><h4>Languages</h4><p>'+safe((t.languages||[]).join(' · ')||'Not specified')+'</p>',
   subjects:'<h4>Subjects taught</h4><div class="market-info-tags">'+(t.subjects||[]).map(x=>'<span>'+safe(x)+'</span>').join('')+'</div><h4>Grade levels</h4><p>'+safe((t.grades||[]).join(' · ')||'Not specified')+'</p><h4>Curriculum</h4><p>'+safe((t.curricula||[]).join(' · ')||'Not specified')+'</p>',
   availability:'<h4>Available teaching hours</h4><p>Choose “See available times” to check the tutor’s weekly schedule. Exact booking times are confirmed separately.</p><div class="market-weekdays"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div>'
  };
  function showInfo(key){info.innerHTML=panels[key];detail.querySelectorAll('[data-info]').forEach(b=>{const on=b.dataset.info===key;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});}
  detail.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>showInfo(b.dataset.info));
  detail.querySelector('#marketBook').onclick=()=>onBook(t,detail.querySelector('.market-profile'));
  showInfo('about');
  if(el.dataset.marketMode==='public'||window.matchMedia('(max-width:900px)').matches)detail.scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 function reset(){search=subject=grade=curriculum='';sort='name';max=Infinity;for(const id of ['marketSearch','marketSubject','marketGrade','marketCurriculum'])el.querySelector('#'+id).value='';el.querySelector('#marketSort').value='name';el.querySelector('#marketBudget').value=maxPrice;el.querySelector('#marketBudgetLabel').textContent='Any';render();}
 for(const [id,fn] of [['marketSearch',v=>search=v.toLowerCase().trim()],['marketSubject',v=>subject=v],['marketGrade',v=>grade=v],['marketCurriculum',v=>curriculum=v],['marketSort',v=>sort=v]])el.querySelector('#'+id).addEventListener(id==='marketSearch'?'input':'change',e=>{fn(e.target.value);render();});
 el.querySelector('#marketBudget').addEventListener('input',e=>{max=Number(e.target.value)>=maxPrice?Infinity:Number(e.target.value);el.querySelector('#marketBudgetLabel').textContent=max===Infinity?'Any':max;render();});
 el.querySelector('#marketReset').onclick=reset;
 render();
 if(teachers.length)profile(teachers[0].id);
}
window.TutorMarketplace={mount};
})();
