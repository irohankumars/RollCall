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
    CREATE TABLE IF NOT EXISTS college_applications (
      id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, college_name TEXT NOT NULL,
      legal_name TEXT NOT NULL, admin_email TEXT NOT NULL COLLATE NOCASE,
      admin_name TEXT NOT NULL, approved_at TEXT NOT NULL, payment_event_id TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY, college_id TEXT NOT NULL UNIQUE REFERENCES colleges(id) ON DELETE RESTRICT,
      application_id TEXT UNIQUE REFERENCES college_applications(id) ON DELETE RESTRICT,
      name TEXT NOT NULL, state TEXT NOT NULL CHECK (state IN ('PENDING','PAYMENT_CONFIRMED','PROVISIONING','READY_FOR_ADMIN','ACTIVE')),
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
      payment_event_id TEXT NOT NULL UNIQUE, plan_code TEXT NOT NULL, status TEXT NOT NULL,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workspace_memberships (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('COLLEGE_ADMIN','HOD','LECTURER','STUDENT')),
      status TEXT NOT NULL CHECK (status IN ('ACTIVE','DISABLED')),
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE (workspace_id, user_id, role)
    );
    CREATE INDEX IF NOT EXISTS workspace_memberships_user_idx ON workspace_memberships(user_id, status);
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      email TEXT NOT NULL COLLATE NOCASE, role TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE, status TEXT NOT NULL CHECK (status IN ('PENDING','ACCEPTED','EXPIRED','REVOKED')),
      expires_at TEXT NOT NULL, college_confirmed_at TEXT, admin_name TEXT, phone TEXT,
      otp_verified_at TEXT, accepted_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS invitations_workspace_idx ON invitations(workspace_id, status);
    CREATE TABLE IF NOT EXISTS otp_challenges (
      id TEXT PRIMARY KEY, invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL, expires_at TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
      resend_count INTEGER NOT NULL DEFAULT 0, last_sent_at TEXT NOT NULL, verified_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS otp_challenges_invitation_idx ON otp_challenges(invitation_id, created_at);
    CREATE TABLE IF NOT EXISTS academic_years (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL, is_current INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL, code TEXT NOT NULL, created_at TEXT NOT NULL,
      UNIQUE (workspace_id, code)
    );
    CREATE TABLE IF NOT EXISTS timetable_sections (
      id TEXT PRIMARY KEY, college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
      department_id TEXT NOT NULL, academic_year TEXT NOT NULL, semester TEXT NOT NULL,
      batch_name TEXT NOT NULL, name TEXT NOT NULL, default_room TEXT,
      source_class_id TEXT REFERENCES lecturer_classes(id) ON DELETE SET NULL,
      status TEXT NOT NULL CHECK (status IN ('ACTIVE','ARCHIVED')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS timetable_sections_scope_idx ON timetable_sections(college_id, department_id, status);
    CREATE TABLE IF NOT EXISTS timetable_user_scopes (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, department_id TEXT NOT NULL,
      section_id TEXT REFERENCES timetable_sections(id) ON DELETE CASCADE, is_class_teacher INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, PRIMARY KEY (user_id, department_id, section_id)
    );
    CREATE TABLE IF NOT EXISTS timetable_slots (
      id TEXT PRIMARY KEY, college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
      department_id TEXT NOT NULL, label TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
      slot_order INTEGER NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('TEACHING','BREAK','LUNCH')),
      UNIQUE (college_id, department_id, slot_order)
    );
    CREATE TABLE IF NOT EXISTS timetable_entries (
      id TEXT PRIMARY KEY, section_id TEXT NOT NULL REFERENCES timetable_sections(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), start_time TEXT NOT NULL, end_time TEXT NOT NULL,
      subject_code TEXT, subject_name TEXT NOT NULL, lecturer_id TEXT REFERENCES users(id) ON DELETE RESTRICT,
      room TEXT, entry_type TEXT NOT NULL CHECK (entry_type IN ('CLASS','LAB','BREAK','LUNCH','REMEDIAL','ACTIVITY','PROJECT','SPECIAL')),
      display_label TEXT, status TEXT NOT NULL CHECK (status IN ('ACTIVE','INACTIVE')),
      created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS timetable_entries_section_day_idx ON timetable_entries(section_id, day_of_week, start_time);
    CREATE INDEX IF NOT EXISTS timetable_entries_lecturer_idx ON timetable_entries(lecturer_id, day_of_week, start_time);
    CREATE TABLE IF NOT EXISTS timetable_overrides (
      id TEXT PRIMARY KEY, section_id TEXT NOT NULL REFERENCES timetable_sections(id) ON DELETE CASCADE,
      base_entry_id TEXT REFERENCES timetable_entries(id) ON DELETE SET NULL, override_date TEXT NOT NULL,
      change_kind TEXT NOT NULL CHECK (change_kind IN ('CHANGE','CANCELLED','SPECIAL','RESCHEDULED')),
      start_time TEXT, end_time TEXT, subject_code TEXT, subject_name TEXT,
      lecturer_id TEXT REFERENCES users(id) ON DELETE RESTRICT, room TEXT, entry_type TEXT, note TEXT,
      status TEXT NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','CANCELLED','REVERTED','EXPIRED')),
      original_snapshot TEXT, created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, published_at TEXT, reverted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS timetable_overrides_date_idx ON timetable_overrides(section_id, override_date, status);
    CREATE TABLE IF NOT EXISTS timetable_history (
      id TEXT PRIMARY KEY, section_id TEXT NOT NULL REFERENCES timetable_sections(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, action TEXT NOT NULL,
      old_value TEXT, new_value TEXT, changed_by TEXT NOT NULL REFERENCES users(id), changed_by_role TEXT NOT NULL,
      changed_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS timetable_history_section_idx ON timetable_history(section_id, changed_at);
    CREATE TABLE IF NOT EXISTS notification_events (
      id TEXT PRIMARY KEY, category TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
      section_id TEXT REFERENCES timetable_sections(id) ON DELETE SET NULL, source_id TEXT,
      created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notification_recipients (
      event_id TEXT NOT NULL REFERENCES notification_events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, read_at TEXT,
      PRIMARY KEY (event_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS device_tokens (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE, platform TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notification_deliveries (
      id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES notification_events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, device_token_id TEXT REFERENCES device_tokens(id) ON DELETE SET NULL,
      status TEXT NOT NULL CHECK (status IN ('QUEUED','SENT','FAILED','SKIPPED')), attempted_at TEXT, provider_reference TEXT
    );
  `);
  const now = new Date().toISOString();
  const addWorkspace = db.prepare(`INSERT OR IGNORE INTO workspaces (id, college_id, application_id, name, state, created_at, updated_at)
    SELECT 'workspace-' || id, id, NULL, name, CASE WHEN status='ACTIVE' THEN 'ACTIVE' ELSE 'READY_FOR_ADMIN' END, created_at, updated_at FROM colleges`);
  const addMembership = db.prepare(`INSERT OR IGNORE INTO workspace_memberships (id, workspace_id, user_id, role, status, created_at, updated_at)
    SELECT 'membership-' || u.id, w.id, u.id, u.role, u.status, ?, ? FROM users u JOIN workspaces w ON w.college_id=u.college_id WHERE u.role <> 'SUPER_ADMIN'`);
  db.transaction(() => { addWorkspace.run(); addMembership.run(now, now); })();
  return db;
}
