// Explainable progress insights from actual marked answers; no fabricated AI scores.
const db=require('./db');
function get(studentId){
 const total=db.prepare(`SELECT COUNT(*) attempts,COALESCE(SUM(CASE WHEN a.correct=1 THEN 1 ELSE 0 END),0) correct
 FROM answers a WHERE a.user_id=? AND a.correct IS NOT NULL`).get(studentId);
 const topics=db.prepare(`SELECT COALESCE(NULLIF(TRIM(q.subject),''),'Other') subject,
 COALESCE(NULLIF(TRIM(q.topic),''),'General') topic,
 COUNT(*) attempts, SUM(CASE WHEN a.correct=1 THEN 1 ELSE 0 END) correct,
 MAX(a.updated_at) last_practiced
 FROM answers a JOIN questions q ON q.id=a.qid WHERE a.user_id=? AND a.correct IS NOT NULL
 GROUP BY q.subject,q.topic ORDER BY attempts DESC,subject,topic`).all(studentId);
 const subjects=db.prepare(`SELECT COALESCE(NULLIF(TRIM(q.subject),''),'Other') subject,COUNT(*) attempts,
 SUM(CASE WHEN a.correct=1 THEN 1 ELSE 0 END) correct
 FROM answers a JOIN questions q ON q.id=a.qid WHERE a.user_id=? AND a.correct IS NOT NULL
 GROUP BY q.subject ORDER BY attempts DESC`).all(studentId);
 const weekly=db.prepare(`SELECT date(a.updated_at) day,COUNT(*) attempts,
 SUM(CASE WHEN a.correct=1 THEN 1 ELSE 0 END) correct FROM answers a
 WHERE a.user_id=? AND a.correct IS NOT NULL AND a.updated_at>=datetime('now','-27 days')
 GROUP BY date(a.updated_at) ORDER BY day`).all(studentId);
 const sessions=db.prepare('SELECT COUNT(*) n FROM runs WHERE user_id=? AND done_at IS NOT NULL').get(studentId).n;
 const due=db.prepare('SELECT COUNT(*) n FROM srs WHERE user_id=? AND learned_skey IS NULL').get(studentId).n;
 const decorate=x=>({...x,accuracy:Math.round(100*x.correct/x.attempts),confidence:x.attempts>=5?'good':x.attempts>=3?'moderate':'limited'});
 const ranked=topics.map(decorate).filter(x=>x.attempts>=3);
 const focus=ranked.filter(x=>x.accuracy<70).sort((a,b)=>a.accuracy-b.accuracy||b.attempts-a.attempts).slice(0,5);
 const strengths=ranked.filter(x=>x.accuracy>=80).sort((a,b)=>b.accuracy-a.accuracy||b.attempts-a.attempts).slice(0,5);
 return {summary:{attempts:total.attempts,correct:total.correct,accuracy:total.attempts?Math.round(100*total.correct/total.attempts):null,sessions,review_due:due},
 subjects:subjects.map(decorate),topics:topics.map(decorate),weekly,focus,strengths,
 guidance:total.attempts<3?'Not enough marked answers yet. Complete a few practice questions to unlock insights.':focus.length?'Start with your lowest-accuracy topic, review mistakes, then try five new questions.':'Keep practicing regularly. Topics need at least three marked answers before they are classified.'};
}
module.exports={get};
