const db=require('./db');
const minute=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
function get(id,duration){
 const schedule=db.prepare('SELECT weekday,start_time,end_time FROM teacher_availability WHERE teacher_id=?').all(id);
 const reserved=db.prepare("SELECT start_at,minutes FROM lesson_bookings WHERE teacher_id=? AND status IN ('requested','confirmed')").all(id);
 const today=new Date(Date.now()+4*3600000).toISOString().slice(0,10);
 const base=Date.parse(today+'T00:00:00Z');
 const days=[];
 for(let i=0;i<14;i++){
  const date=new Date(base+i*86400000).toISOString().slice(0,10);
  const weekday=new Date(date+'T00:00:00Z').getUTCDay();
  const times=[];
  for(const a of schedule.filter(x=>x.weekday===weekday)){
   for(let m=minute(a.start_time);m+duration<=minute(a.end_time);m+=15){
    const time=String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
    const stamp=date+'T'+time,ts=Date.parse(stamp+'+04:00');
    if(ts<Date.now()+3600000)continue;
    const occupied=reserved.some(b=>{const x=Date.parse(b.start_at+'+04:00');return ts<x+b.minutes*60000&&x<ts+duration*60000;});
    if(!occupied)times.push(stamp);
   }
  }
  days.push({date,weekday,times:[...new Set(times)]});
 }
 return {timezone:'Asia/Dubai',days};
}
module.exports={get};
