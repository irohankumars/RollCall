import { lecturerClient } from './lecturer-client';
import type { AttendanceMark, LecturerClass, LecturerStudent } from './types';
import type { LecturerAccess } from './access';

export type DailySessionStatus = 'COMPLETED' | 'PENDING' | 'NOT_CONDUCTED';
export type DailySession = {
  id: string;
  subjectCode: string;
  subjectName: string;
  time: string;
  status: DailySessionStatus;
  records: Record<string, AttendanceMark>;
};

export type ClassTeacherWorkspace = {
  assignedClass: LecturerClass | null;
  students: LecturerStudent[];
};

export async function loadClassTeacherWorkspace(token: string, access: LecturerAccess): Promise<ClassTeacherWorkspace> {
  if (!access.isClassTeacher || !access.classTeacherSubjectCode) return { assignedClass: null, students: [] };
  const classes = await lecturerClient.classes(token);
  const assignedClass = classes.find((item) => item.subjectCode === access.classTeacherSubjectCode) ?? null;
  if (!assignedClass) return { assignedClass: null, students: [] };
  const students = await lecturerClient.roster(token, assignedClass.id);
  return { assignedClass, students };
}

const sessionDetails = [
  { id: 'daily-os', subjectCode: 'CS301', subjectName: 'Operating Systems', time: '9:00 AM', status: 'COMPLETED' },
  { id: 'daily-cn', subjectCode: 'CS302', subjectName: 'Computer Networks', time: '10:00 AM', status: 'COMPLETED' },
  { id: 'daily-db', subjectCode: 'CS303', subjectName: 'Database Systems', time: '11:15 AM', status: 'COMPLETED' },
  { id: 'daily-se', subjectCode: 'CS304', subjectName: 'Software Engineering', time: '1:00 PM', status: 'NOT_CONDUCTED' },
  { id: 'daily-ai', subjectCode: 'CS305', subjectName: 'Artificial Intelligence', time: '2:15 PM', status: 'COMPLETED' },
] as const satisfies readonly Omit<DailySession, 'records'>[];

export function createDailySessions(students: LecturerStudent[]): DailySession[] {
  return sessionDetails.map((session, sessionIndex) => ({
    ...session,
    records: session.status === 'COMPLETED'
      ? Object.fromEntries(students.map((student, studentIndex) => [student.id, (studentIndex + sessionIndex) % Math.max(students.length, 1) === students.length - 1 ? 'ABSENT' : 'PRESENT'])) as Record<string, AttendanceMark>
      : {},
  }));
}

export function latestDailyMark(studentId: string, sessions: DailySession[]): AttendanceMark {
  const completed = sessions.filter((session) => session.status === 'COMPLETED');
  return completed.at(-1)?.records[studentId] ?? 'ABSENT';
}

export const classTeacherDate = () => new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
