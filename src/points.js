// Non-monetary demo points: no bank, Stripe, or cash value.
const db=require('./db');
const COMMISSION=15;
function balance(id){return db.prepare('SELECT balance FROM point_wallets WHERE user_id=?').get(id)?.balance||0;}
function credit(id,n){db.prepare('INSERT INTO point_wallets(user_id,balance) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET balance=balance+excluded.balance').run(id,n);}
function debit(id,n){return db.prepare('UPDATE point_wallets SET balance=balance-? WHERE user_id=? AND balance>=?').run(n,id,n).changes===1;}
function movement(booking,from,to,n,kind){db.prepare('INSERT INTO point_movements(booking_id,from_user,to_user,points,kind) VALUES(?,?,?,?,?)').run(booking,from,to,n,kind);}
function valid(n){return Number.isSafeInteger(n)&&n>0&&n<=1000000;}
function seed(admin,parent,n){
 if(!valid(n))throw Error('Invalid points');
 return db.transaction(()=>{credit(parent,n);movement(null,admin,parent,n,'demo_grant');return balance(parent);})();
}
function pay(parent,bookingId,admin){
 return db.transaction(()=>{
  const b=db.prepare('SELECT * FROM lesson_bookings WHERE id=? AND parent_id=?').get(bookingId,parent);
  if(!b||b.status!=='confirmed'||b.payment_status!=='unpaid')throw Error('Booking cannot be paid with points');
  if(!valid(b.amount_aed)||!debit(parent,b.amount_aed))throw Error('Not enough points');
  credit(admin,b.amount_aed);
  movement(b.id,parent,admin,b.amount_aed,'lesson');
  db.prepare("UPDATE lesson_bookings SET payment_status='paid' WHERE id=?").run(b.id);
  return {balance:balance(parent),points:b.amount_aed};
 })();
}
function settle(admin,bookingId){
 return db.transaction(()=>{
  const b=db.prepare('SELECT * FROM lesson_bookings WHERE id=?').get(bookingId);
  if(!b||b.status!=='completed'||b.payment_status!=='paid')throw Error('Lesson is not eligible');
  if(!db.prepare("SELECT 1 FROM point_movements WHERE booking_id=? AND kind='lesson' AND to_user=?").get(bookingId,admin))throw Error('Points not received by this admin');
  if(db.prepare("SELECT 1 FROM point_movements WHERE booking_id=? AND kind='teacher_share'").get(bookingId))throw Error('Already settled');
  const teacherPoints=Math.floor(b.amount_aed*(100-COMMISSION)/100);
  const fee=b.amount_aed-teacherPoints;
  if(!debit(admin,teacherPoints))throw Error('Admin has insufficient points');
  credit(b.teacher_id,teacherPoints);
  movement(b.id,admin,b.teacher_id,teacherPoints,'teacher_share');
  return {teacher_points:teacherPoints,admin_points:fee};
 })();
}
function history(id){return db.prepare('SELECT * FROM point_movements WHERE from_user=? OR to_user=? ORDER BY id DESC LIMIT 100').all(id,id);}
module.exports={balance,seed,pay,settle,history,COMMISSION};
