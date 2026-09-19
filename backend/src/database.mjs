import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export function createDatabase(filename) {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new Database(filename);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DISABLED')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      login_identifier TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','COLLEGE_ADMIN','HOD','LECTURER','STUDENT')),
      college_id TEXT REFERENCES colleges(id) ON DELETE RESTRICT,
      status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'DISABLED')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK ((role = 'SUPER_ADMIN' AND college_id IS NULL) OR (role <> 'SUPER_ADMIN' AND college_id IS NOT NULL))
    );
    CREATE INDEX IF NOT EXISTS users_college_id_idx ON users(college_id);
    CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS lecturer_classes (
      id TEXT PRIMARY KEY,
      college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
      lecturer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      subject_code TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      batch_name TEXT NOT NULL,
      semester TEXT NOT NULL,
      schedule_text TEXT NOT NULL,
      next_session_at TEXT,
      status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS lecturer_classes_lecturer_idx ON lecturer_classes(lecturer_id, status);
    CREATE INDEX IF NOT EXISTS lecturer_classes_college_idx ON lecturer_classes(college_id);
    CREATE TABLE IF NOT EXISTS class_enrollments (
      class_id TEXT NOT NULL REFERENCES lecturer_classes(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      roll_number TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (class_id, student_id),
      UNIQUE (class_id, roll_number)
    );
    CREATE INDEX IF NOT EXISTS class_enrollments_student_idx ON class_enrollments(student_id);
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL REFERENCES lecturer_classes(id) ON DELETE RESTRICT,
      lecturer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
      method TEXT NOT NULL CHECK (method IN ('MANUAL', 'FACE')),
      status TEXT NOT NULL CHECK (status IN ('DRAFT', 'COMPLETED')),
      scheduled_at TEXT NOT NULL,
      submitted_at TEXT,
      corrected_at TEXT,
      correction_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS attendance_sessions_lecturer_idx ON attendance_sessions(lecturer_id, scheduled_at);
    CREATE INDEX IF NOT EXISTS attendance_sessions_class_idx ON attendance_sessions(class_id, scheduled_at);
    CREATE TABLE IF NOT EXISTS attendance_records (
      session_id TEXT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT')),
      updated_at TEXT NOT NULL,
      PRIMARY KEY (session_id, student_id)
    );
    CREATE INDEX IF NOT EXISTS attendance_records_student_idx ON attendance_records(student_id);
  `);
  return db;
}
