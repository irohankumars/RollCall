import { randomUUID } from 'node:crypto';
import { loadConfig } from '../src/config.mjs';
import { createDatabase } from '../src/database.mjs';
import { hashPassword } from '../src/password.mjs';
import { Roles } from '../src/roles.mjs';

const config = loadConfig();
if (config.nodeEnv === 'production') throw new Error('Development seed is disabled in production.');
const password = process.env.DEV_SEED_PASSWORD;
if (!password || password.length < 12) throw new Error('DEV_SEED_PASSWORD must contain at least 12 characters.');
const db = createDatabase(config.databasePath); const now = new Date().toISOString(); const passwordHash = await hashPassword(password);
const collegeName = process.env.DEV_COLLEGE_NAME ?? 'Development College';
const existingCollege = db.prepare('SELECT id FROM colleges WHERE name=? ORDER BY created_at LIMIT 1').get(collegeName);
const collegeId = existingCollege?.id ?? randomUUID();
db.prepare('INSERT OR IGNORE INTO colleges (id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(collegeId, collegeName, 'ACTIVE', now, now);
const createUser = db.prepare('INSERT OR IGNORE INTO users (id, name, login_identifier, password_hash, role, college_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
createUser.run(randomUUID(), 'Development College Admin', process.env.DEV_COLLEGE_ADMIN_LOGIN ?? 'admin@development.local', passwordHash, Roles.COLLEGE_ADMIN, collegeId, 'ACTIVE', now, now);
createUser.run(randomUUID(), 'Development Platform Owner', process.env.DEV_SUPER_ADMIN_LOGIN ?? 'owner@development.local', passwordHash, Roles.SUPER_ADMIN, null, 'ACTIVE', now, now);
const lecturerLogin = process.env.DEV_LECTURER_LOGIN ?? 'lecturer@development.local';
createUser.run(randomUUID(), 'Dr. Ananya Rao', lecturerLogin, passwordHash, Roles.LECTURER, collegeId, 'ACTIVE', now, now);
const lecturerId = db.prepare('SELECT id FROM users WHERE login_identifier=?').get(lecturerLogin).id;
const hodLogin = process.env.DEV_HOD_LOGIN ?? 'hod@development.local';
createUser.run(randomUUID(), 'Dr. Vikram Shah', hodLogin, passwordHash, Roles.HOD, collegeId, 'ACTIVE', now, now);
const hodId = db.prepare('SELECT id FROM users WHERE login_identifier=?').get(hodLogin).id;
const studentNames = ['Aarav Mehta','Diya Sharma','Ishaan Verma','Kavya Nair','Rohan Gupta','Sara Khan'];
const students = studentNames.map((name,index)=>{ const login=`student${index+1}@development.local`; createUser.run(randomUUID(),name,login,passwordHash,Roles.STUDENT,collegeId,'ACTIVE',now,now); const id=db.prepare('SELECT id FROM users WHERE login_identifier=?').get(login).id; return {id,rollNumber:`CSE24${String(index+1).padStart(3,'0')}`}; });
const insertClass=db.prepare(`INSERT INTO lecturer_classes (id,college_id,lecturer_id,subject_code,subject_name,batch_name,semester,schedule_text,next_session_at,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'ACTIVE',?,?)`);
const enroll=db.prepare('INSERT OR IGNORE INTO class_enrollments (class_id,student_id,roll_number,created_at) VALUES (?,?,?,?)');
const next=new Date(); next.setMinutes(next.getMinutes()+30);
const classData=[['CS401','Machine Learning','CSE 2024 A','Semester 7','Mon, Wed · 10:00 AM',next.toISOString()],['CS305','Database Systems','CSE 2025 B','Semester 5','Tue, Thu · 1:30 PM',new Date(next.getTime()+86400000).toISOString()]];
for(const values of classData){let row=db.prepare('SELECT id FROM lecturer_classes WHERE lecturer_id=? AND subject_code=? AND batch_name=?').get(lecturerId,values[0],values[2]);if(!row){const classId=randomUUID();insertClass.run(classId,collegeId,lecturerId,...values,now,now);row={id:classId};}students.forEach(student=>enroll.run(row.id,student.id,student.rollNumber,now));}
for(const values of classData){let row=db.prepare('SELECT id FROM lecturer_classes WHERE lecturer_id=? AND subject_code=? AND batch_name=?').get(hodId,values[0],values[2]);if(!row){const classId=randomUUID();insertClass.run(classId,collegeId,hodId,...values,now,now);row={id:classId};}students.forEach(student=>enroll.run(row.id,student.id,student.rollNumber,now));}
const sourceClass=db.prepare("SELECT id FROM lecturer_classes WHERE lecturer_id=? AND batch_name='CSE 2024 A' ORDER BY created_at LIMIT 1").get(lecturerId);
const sectionId='timetable-dev-cse-2024-a';
db.prepare(`INSERT OR IGNORE INTO timetable_sections (id,college_id,department_id,academic_year,semester,batch_name,name,default_room,source_class_id,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'ACTIVE',?,?)`).run(sectionId,collegeId,'dept-cse','2026–27','Semester 7','Batch 2024','CSE 2024 A','Room 302',sourceClass?.id??null,now,now);
const addScope=db.prepare('INSERT OR IGNORE INTO timetable_user_scopes (user_id,department_id,section_id,is_class_teacher,created_at) VALUES (?,?,?,?,?)');
addScope.run(hodId,'dept-cse',sectionId,0,now); addScope.run(lecturerId,'dept-cse',sectionId,1,now); students.forEach(student=>addScope.run(student.id,'dept-cse',sectionId,0,now));
const slots=[['09:00','10:00','Period 1','TEACHING'],['10:00','10:55','Period 2','TEACHING'],['10:55','11:10','Tea Break','BREAK'],['11:10','12:05','Period 3','TEACHING'],['12:05','13:00','Period 4','TEACHING'],['13:00','13:45','Lunch','LUNCH'],['13:45','14:40','Period 5','TEACHING'],['14:45','15:35','Period 6','TEACHING'],['15:35','16:30','Period 7','TEACHING']];
const addSlot=db.prepare('INSERT OR IGNORE INTO timetable_slots (id,college_id,department_id,label,start_time,end_time,slot_order,kind) VALUES (?,?,?,?,?,?,?,?)');slots.forEach((slot,index)=>addSlot.run(`slot-dev-cse-${index+1}`,collegeId,'dept-cse',slot[2],slot[0],slot[1],index+1,slot[3]));
const addEntry=db.prepare(`INSERT OR IGNORE INTO timetable_entries (id,section_id,day_of_week,start_time,end_time,subject_code,subject_name,lecturer_id,room,entry_type,display_label,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,'ACTIVE',?,?,?)`);
const timetableEntries=[
 ['mon-toc',1,'09:00','10:00','CS401','Theory of Computation',lecturerId,'Room 302','CLASS',null],['mon-cn',1,'10:00','10:55','CS402','Computer Networks',hodId,'Room 302','CLASS',null],['mon-tea',1,'10:55','11:10',null,'Tea Break',null,null,'BREAK','Tea Break'],['mon-se',1,'11:10','12:05','CS403','Software Engineering',lecturerId,'Room 302','CLASS',null],['mon-lunch',1,'13:00','13:45',null,'Lunch',null,null,'LUNCH','Lunch'],['mon-lab',1,'13:45','15:35','CSL404','Data Visualization Lab',lecturerId,'Lab 3','LAB',null],
 ['tue-cn',2,'09:00','10:00','CS402','Computer Networks',hodId,'Room 302','CLASS',null],['tue-project',2,'10:00','12:05','CSP405','Mini Project',lecturerId,'Project Lab','PROJECT',null],['tue-lunch',2,'13:00','13:45',null,'Lunch',null,null,'LUNCH','Lunch'],['tue-remedial',2,'14:45','15:35','CS401','TOC Remedial',lecturerId,'Room 302','REMEDIAL',null],
 ['wed-se',3,'09:00','10:00','CS403','Software Engineering',lecturerId,'Room 302','CLASS',null],['wed-activity',3,'11:10','12:05',null,'Department Activity',hodId,'Seminar Hall','ACTIVITY',null],['thu-lab',4,'09:00','10:55','CSL404','Data Visualization Lab',lecturerId,'Lab 3','LAB',null],['thu-cn',4,'11:10','12:05','CS402','Computer Networks',hodId,'Room 302','CLASS',null],['fri-special',5,'13:45','15:35',null,'Professional Skills Block',hodId,'Seminar Hall','SPECIAL',null]
];timetableEntries.forEach(item=>addEntry.run(`tt-${item[0]}`,sectionId,...item.slice(1),hodId,now,now));
console.log('Development accounts and Lecturer/HOD teaching workflow data created. Password was read only from DEV_SEED_PASSWORD.'); db.close();
