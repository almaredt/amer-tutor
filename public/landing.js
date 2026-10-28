document.getElementById('year').textContent=new Date().getFullYear();
document.querySelector('footer a').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});

/* Public tutor preview: real approved profiles only. */
(async function(){
 const grid=document.getElementById('homeTutorGrid'),search=document.getElementById('homeTutorSearch');if(!grid||!search)return;
 const safe=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 try{
  const response=await fetch('/api/public/teachers');if(!response.ok)throw Error('Could not load tutors.');
  const teachers=await response.json();
  function draw(){
   const q=search.value.toLowerCase().trim();
   const filtered=teachers.filter(t=>[t.display_name,...(t.subjects||[]),...(t.curricula||[])].join(' ').toLowerCase().includes(q));
   grid.innerHTML=filtered.length?filtered.slice(0,8).map(t=>'<article class="home-tutor-card"><div class="home-tutor-avatar" aria-hidden="true">'+(t.photo_url?'<img loading="lazy" src="'+safe(t.photo_url)+'" alt="Tutor portrait">':safe(t.display_name.slice(0,2).toUpperCase()))+'</div><div class="home-tutor-body"><small>✓ APPROVED TUTOR'+(t.is_demo?' · DEMO':'')+'</small><h3>'+safe(t.display_name)+'</h3><p>'+safe((t.subjects||[]).slice(0,3).join(' · ')||'Tutor')+'</p><div><strong>'+safe(t.rate_45_aed??'—')+'</strong> points / 45 min</div><a href="/tutor/'+t.id+'">View profile ↗</a></div></article>').join(''):'<p class="home-tutor-empty">'+(teachers.length?'No tutors match your search.':'No approved tutors yet. Please check back soon.')+'</p>';
  }
  search.addEventListener('input',draw);draw();
 }catch(e){grid.textContent='Tutor directory is temporarily unavailable.';}
})();
