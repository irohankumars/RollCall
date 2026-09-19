import { apiRequest } from '@/auth/auth-client';
import type { AttendanceMark, AttendanceSession, LecturerClass, LecturerOverview, LecturerStudent, SessionSummary, StudentDetail } from './types';

const authorized = (token:string):HeadersInit => ({ authorization:`Bearer ${token}` });
export const lecturerClient = {
  overview:(token:string)=>apiRequest<LecturerOverview>('/api/lecturer/overview',{headers:authorized(token)}),
  classes:(token:string)=>apiRequest<LecturerClass[]>('/api/lecturer/classes',{headers:authorized(token)}),
  classDetails:(token:string,id:string)=>apiRequest<LecturerClass>(`/api/lecturer/classes/${encodeURIComponent(id)}`,{headers:authorized(token)}),
  roster:(token:string,id:string)=>apiRequest<LecturerStudent[]>(`/api/lecturer/classes/${encodeURIComponent(id)}/students`,{headers:authorized(token)}),
  student:(token:string,classId:string,studentId:string)=>apiRequest<StudentDetail>(`/api/lecturer/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(studentId)}`,{headers:authorized(token)}),
  startSession:(token:string,classId:string,method:'MANUAL'|'FACE',scheduledAt:string)=>apiRequest<AttendanceSession>(`/api/lecturer/classes/${encodeURIComponent(classId)}/attendance-sessions`,{method:'POST',headers:authorized(token),body:JSON.stringify({method,scheduledAt})}),
  session:(token:string,id:string)=>apiRequest<AttendanceSession>(`/api/lecturer/attendance-sessions/${encodeURIComponent(id)}`,{headers:authorized(token)}),
  submit:(token:string,id:string,records:{studentId:string;status:AttendanceMark}[])=>apiRequest<AttendanceSession>(`/api/lecturer/attendance-sessions/${encodeURIComponent(id)}/submit`,{method:'POST',headers:authorized(token),body:JSON.stringify({records})}),
  correct:(token:string,id:string,records:{studentId:string;status:AttendanceMark}[],note:string)=>apiRequest<AttendanceSession>(`/api/lecturer/attendance-sessions/${encodeURIComponent(id)}/correct`,{method:'POST',headers:authorized(token),body:JSON.stringify({records,note})}),
  history:(token:string)=>apiRequest<SessionSummary[]>('/api/lecturer/attendance-history',{headers:authorized(token)}),
};
