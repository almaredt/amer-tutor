document.getElementById('year').textContent=new Date().getFullYear();
document.querySelector('footer a').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});
