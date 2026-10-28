/* Shared theme control for all Amer Tutor pages.
   Respects the Student settings key and system preference. */
(function(){
 const KEY='ui-theme';
 const modes=['system','light','dark'];
 function current(){try{const x=localStorage.getItem(KEY);return modes.includes(x)?x:'system';}catch{return 'system';}}
 function apply(mode){
  if(mode==='system')document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme',mode);
  const b=document.getElementById('siteThemeSwitch');
  if(b){b.textContent=mode==='dark'?'☾ Dark':mode==='light'?'☀ Light':'◐ Auto';b.setAttribute('aria-label','Theme: '+mode+'. Click to change theme');b.title='Theme: '+mode+' (click to change)';}
 }
 function set(mode){try{localStorage.setItem(KEY,mode);}catch{}apply(mode);}
 function init(){
  if(document.getElementById('siteThemeSwitch'))return;
  const b=document.createElement('button');
  b.type='button';b.id='siteThemeSwitch';b.className='site-theme-switch';
  b.addEventListener('click',()=>set(modes[(modes.indexOf(current())+1)%modes.length]));
  document.body.appendChild(b);apply(current());
  window.addEventListener('storage',e=>{if(e.key===KEY)apply(current());});
 }
 apply(current());
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('amer-theme-change',()=>apply(current()));
})();
