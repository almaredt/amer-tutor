const go=role=>{
 const target=role==='admin'?'/admin':role==='teacher'||role==='parent'?'/portal':'/study';
 const requested=new URLSearchParams(location.search).get('next');
 // Only parents may return to the internal booking portal. Reject external redirects.
 location.replace(role==='parent'&&requested&&/^\/portal(?:\?[^#]*)?$/.test(requested)?requested:target);
};
api('/api/me').then(u=>go(u.role)).catch(()=>renderLogin(document.getElementById('loginRoot'),u=>go(u.role)));
