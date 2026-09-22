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
console.log('Development accounts and Lecturer/HOD teaching workflow data created. Password was read only from DEV_SEED_PASSWORD.'); db.close();
