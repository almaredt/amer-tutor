// Stripe Checkout: parents pay the platform, payouts to freelancers remain manual.
// Stripe is optional; never treat a browser redirect as proof of payment.
const crypto=require('crypto');
const db=require('./db');
const key=process.env.STRIPE_SECRET_KEY;
const secret=process.env.STRIPE_WEBHOOK_SECRET;
const site=process.env.PUBLIC_BASE_URL;
const configuredBps=Number(process.env.PLATFORM_COMMISSION_BPS||1500);
if(!Number.isInteger(configuredBps)||configuredBps<0||configuredBps>5000)throw new Error('Invalid platform commission basis points');
const commissionBps=configuredBps;
function configured(){return !!(key&&secret&&site&&/^https:\/\//.test(site));}
async function checkout(booking){
 if(!configured())throw new Error('Online payment is not configured.');
 const params=new URLSearchParams();
 params.set('mode','payment');
 params.set('success_url',site+'/portal?payment=return');
 params.set('cancel_url',site+'/portal?payment=cancelled');
 params.set('client_reference_id',String(booking.id));
 params.set('metadata[booking_id]',String(booking.id));
 params.set('line_items[0][quantity]','1');
 params.set('line_items[0][price_data][currency]','aed');
 params.set('line_items[0][price_data][unit_amount]',String(booking.amount_aed*100));
 params.set('line_items[0][price_data][product_data][name]','Amer Tutor lesson '+booking.minutes+' min');
 const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'amer-booking-'+booking.id},body:params});
 const data=await response.json();
 if(!response.ok||!data.id||!data.url)throw new Error('Payment provider unavailable.');
 return {id:data.id,url:data.url};
}
function verifiedEvent(raw,header){
 if(!secret||!header)return null;
 const parts=Object.fromEntries(header.split(',').map(p=>p.split('=',2)));
 const ts=Number(parts.t);
 if(!Number.isSafeInteger(ts)||Math.abs(Date.now()/1000-ts)>300||!parts.v1)return null;
 const signature=crypto.createHmac('sha256',secret).update(String(ts)+'.').update(raw).digest('hex');
 const received=Buffer.from(parts.v1,'hex'),expected=Buffer.from(signature,'hex');
 if(received.length!==expected.length||!crypto.timingSafeEqual(received,expected))return null;
 return JSON.parse(raw.toString('utf8'));
}
function recordPayment(event){
 if(event.type!=='checkout.session.completed'&&event.type!=='checkout.session.async_payment_succeeded')return;
 const session=event.data.object,id=Number(session.metadata?.booking_id);
 if(!Number.isSafeInteger(id)||id<1||session.payment_status!=='paid'||session.currency!=='aed')return;
 db.transaction(()=>{
  const b=db.prepare('SELECT * FROM lesson_bookings WHERE id=?').get(id);
  if(!b||b.status!=='confirmed'||b.payment_status==='paid'||b.amount_aed*100!==session.amount_total||String(id)!==session.client_reference_id)return;
  db.prepare("UPDATE lesson_bookings SET payment_status='paid' WHERE id=? AND payment_status IN ('pending','unpaid')").run(id);
  const net=Math.floor(b.amount_aed*(10000-commissionBps)/10000);
  db.prepare("INSERT OR IGNORE INTO teacher_payouts(teacher_id,booking_id,amount_aed) VALUES(?,?,?)").run(b.teacher_id,id,net);
 })();
}
module.exports={configured,checkout,verifiedEvent,recordPayment};
