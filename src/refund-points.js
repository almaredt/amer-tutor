const db = require('./db');
const points = require('./points');

function request(parentId, bookingId, reason) {
  if (typeof reason !== 'string' || reason.trim().length < 5 || reason.length > 500) throw Error('Reason must contain 5–500 characters');
  return db.transaction(() => {
    const b = db.prepare('SELECT * FROM lesson_bookings WHERE id=? AND parent_id=?').get(bookingId,parentId);
    if (!b || b.status !== 'confirmed' || b.payment_status !== 'paid') throw Error('Only confirmed, paid lessons can be refunded');
    if (Date.parse(b.start_at + '+04:00') <= Date.now()) throw Error('Lesson has already started');
    const id = db.prepare('INSERT INTO point_refund_requests(booking_id,parent_id,reason) VALUES(?,?,?)').run(bookingId,parentId,reason.trim()).lastInsertRowid;
    return {id,status:'requested'};
  })();
}
function decide(adminId,requestId,approve) {
  return db.transaction(() => {
    const r=db.prepare("SELECT r.*,b.amount_aed,b.start_at,b.status booking_status,b.payment_status FROM point_refund_requests r JOIN lesson_bookings b ON b.id=r.booking_id WHERE r.id=? AND r.status='requested'").get(requestId);
    if(!r) throw Error('Request not found or already reviewed');
    if(approve) {
      if(r.booking_status!=='confirmed'||r.payment_status!=='paid'||Date.parse(r.start_at+'+04:00')<=Date.now()) throw Error('Lesson is not refundable');
      const payment=db.prepare("SELECT to_user FROM point_movements WHERE booking_id=? AND kind='lesson'").get(r.booking_id);
      if(!payment||payment.to_user!==adminId) throw Error('Only receiving admin may refund');
      if(db.prepare("SELECT 1 FROM point_movements WHERE booking_id=? AND kind IN ('refund','teacher_share')").get(r.booking_id)) throw Error('Already refunded or settled');
      const debited=db.prepare('UPDATE point_wallets SET balance=balance-? WHERE user_id=? AND balance>=?').run(r.amount_aed,adminId,r.amount_aed);
      if(!debited.changes) throw Error('Admin wallet has insufficient points');
      db.prepare('INSERT INTO point_wallets(user_id,balance) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET balance=balance+excluded.balance').run(r.parent_id,r.amount_aed);
      db.prepare("INSERT INTO point_movements(booking_id,from_user,to_user,points,kind) VALUES(?,?,?,?,'refund')").run(r.booking_id,adminId,r.parent_id,r.amount_aed);
      db.prepare("UPDATE lesson_bookings SET status='cancelled',payment_status='refunded' WHERE id=?").run(r.booking_id);
    }
    db.prepare("UPDATE point_refund_requests SET status=?,reviewed_by=?,reviewed_at=datetime('now') WHERE id=?").run(approve?'approved':'rejected',adminId,r.id);
    return {id:r.id,status:approve?'approved':'rejected',points:approve?r.amount_aed:0};
  })();
}
function parentRequests(id){return db.prepare('SELECT * FROM point_refund_requests WHERE parent_id=? ORDER BY id DESC').all(id);}
function allRequests(){return db.prepare('SELECT * FROM point_refund_requests ORDER BY id DESC LIMIT 200').all();}
module.exports={request,decide,parentRequests,allRequests};
