// Explicit opt-in demo data. NEVER run automatically in production.
// Usage: node --env-file=.env scripts/seed-demo.js
const db=require('../src/db');
const auth=require('../src/auth');
const crypto=require('node:crypto');
const teachers=[
 ['aisyah','Aisyah Rahman',['Mathematics'],['Grade 6','Grade 7','Grade 8','Grade 9'],['IB MYP','IGCSE'],['English','Malay'],60,80,'Friendly mathematics tutor focused on confidence, problem solving, and exam readiness.',47],
 ['daniel','Daniel Tan',['Physics','Science'],['Grade 8','Grade 9','Grade 10','Grade 11'],['IGCSE','IB MYP'],['English'],65,85,'Hands-on science and physics lessons using practical examples and clear explanations.',12],
 ['kavitha','Kavitha Nair',['English'],['Grade 6','Grade 7','Grade 8','Grade 9'],['IB MYP','IGCSE'],['English','Hindi'],60,80,'Reading, writing and speaking practice tailored to each learner.',44],
 ['jason','Jason Lim',['Mathematics','Science'],['Grade 7','Grade 8','Grade 9'],['IB MYP','IGCSE'],['English','Mandarin'],70,95,'Structured lessons for building strong foundations in mathematics and science.',13],
 ['farah','Farah Nabila',['Mathematics'],['Grade 9','Grade 10','Grade 11'],['IGCSE','IB DP'],['English','Malay'],75,100,'Additional mathematics tutor specialising in step-by-step exam preparation.',49],
 ['amir','Muhammad Amir',['Physics','Chemistry'],['Grade 9','Grade 10','Grade 11','Grade 12'],['IGCSE','IB DP'],['English','Arabic'],80,110,'Physics and chemistry practice with targeted feedback and exam-style questions.',14]
];
const parents=[['sara','Sara Hassan'],['omar','Omar Farouk'],['lina','Lina Chen']];
const students=[['amer','Amer Hassan',0],['ali','Ali Hassan',0],['noor','Noor Farouk',1],['adam','Adam Farouk',1],['maya','Maya Chen',2],['leo','Leo Chen',2]];
// A separate random password is generated for every account and written to stdout only.
// Avoid committed credentials and protect existing demo accounts from silent password changes.
const created=[];
function add(role,key,name){
 const username='demo.'+role+'.'+key;
 const existing=db.prepare('SELECT id,role FROM users WHERE username=?').get(username);
 if(existing){if(existing.role!==role)throw Error('Demo username conflicts with '+existing.role);return existing.id;}
 const password=crypto.randomBytes(15).toString('base64url');
 const id=db.prepare('INSERT INTO users(username,display_name,role,password_hash,active) VALUES(?,?,?,?,1)').run(username,name,role,auth.hashPassword(password)).lastInsertRowid;
 created.push({username,password,role});
 return Number(id);
}
const ids={teachers:[],parents:[],students:[]};
db.transaction(()=>{
 for(const [key,name,subjects,grades,curricula,languages,r45,r60,bio] of teachers){
  const id=add('teacher',key,name);ids.teachers.push(id);
  db.prepare(`INSERT INTO teacher_profiles(user_id,bio,subjects,grades,curricula,languages,rate_45_aed,rate_60_aed,approved)
  VALUES(?,?,?,?,?,?,?,?,1) ON CONFLICT(user_id) DO NOTHING`).run(id,bio,JSON.stringify(subjects),JSON.stringify(grades),JSON.stringify(curricula),JSON.stringify(languages),r45,r60);
  if(!db.prepare('SELECT 1 FROM teacher_availability WHERE teacher_id=? LIMIT 1').get(id)){
   const slot=db.prepare('INSERT INTO teacher_availability(teacher_id,weekday,start_time,end_time) VALUES(?,?,?,?)');
   for(let day=0;day<7;day++)if(day!==5)slot.run(id,day,day===6?'09:00':'15:00',day===6?'14:00':'20:00');
  }
 }
 for(const [key,name] of parents){const id=add('parent',key,name);ids.parents.push(id);db.prepare('INSERT INTO point_wallets(user_id,balance) VALUES(?,500) ON CONFLICT(user_id) DO NOTHING').run(id);}
 for(const [key,name,parent] of students){
  const id=add('student',key,name);ids.students.push(id);
  db.prepare('INSERT OR IGNORE INTO parent_students(parent_id,student_id) VALUES(?,?)').run(ids.parents[parent],id);
 }
 for(let i=0;i<ids.students.length;i++){
  const t=ids.teachers[i%ids.teachers.length],student=ids.students[i];
  db.prepare('INSERT OR IGNORE INTO teacher_students(teacher_id,student_id,subject) VALUES(?,?,?)').run(t,student,teachers[i%teachers.length][2][0]);
 }
})();
console.log('Demo seed complete: 6 tutors, 3 parents, 6 students. Existing accounts kept unchanged.');
if(created.length){
 console.log('\nNEW DEMO LOGIN CREDENTIALS — save securely now (not stored in plaintext):');
 for(const row of created)console.log(row.role.padEnd(8),row.username.padEnd(27),row.password);
 console.log('\nPasswords are displayed ONLY for newly created accounts. Rerunning does not reset them.');
}else console.log('All demo users already existed; no passwords were changed.');
