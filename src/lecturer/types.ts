import type { AttendanceStatus } from '@/design-system/components/attendance';

export type LecturerClass = { id:string; subjectCode:string; subjectName:string; batchName:string; semester:string; schedule:string; nextSessionAt:string|null; studentCount:number; completedSessions:number; requiresAttendance:boolean; lecturer?:{id:string;name:string} };
export type LecturerStudent = { id:string; name:string; rollNumber:string; attendancePercentage:number; attendanceStatus:AttendanceStatus; presentCount:number; absentCount:number };
export type StudentDetail = LecturerStudent & { history:{sessionId:string;date:string;status:'PRESENT'|'ABSENT'}[] };
export type AttendanceMark = 'PRESENT'|'ABSENT';
export type AttendanceSession = { id:string; classId:string; subjectCode:string; subjectName:string; batchName:string; method:'MANUAL'|'FACE'; status:'DRAFT'|'COMPLETED'; scheduledAt:string; submittedAt:string|null; correctedAt:string|null; present:number; absent:number; total:number; records:Record<string,AttendanceMark>; students:LecturerStudent[] };
export type SessionSummary = Omit<AttendanceSession,'records'|'students'>;
export type LecturerOverview = { today:LecturerClass[]; upcoming:LecturerClass[]; requiringAttendance:LecturerClass[]; recentSessions:SessionSummary[] };
