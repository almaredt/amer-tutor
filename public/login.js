const go=role=>location.replace(role==='admin'?'/admin':role==='teacher'||role==='parent'?'/portal':'/study');
api('/api/me').then(u=>go(u.role)).catch(()=>renderLogin(document.getElementById('loginRoot'),u=>go(u.role)));
