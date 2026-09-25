import React, { createContext, useCallback, useMemo, useState } from 'react';

export type AdminSchedule = { id: string; departmentId: string; academicYearId: string; semesterId: string; sectionId: string; subjectId: string; lecturerId: string; day: string; startTime: string; endTime: string; room: string; updatedAt: string };
export type AdminSessionState = 'Conducted' | 'Pending' | 'Not Conducted';
export type AdminSession = { id: string; scheduleId: string; date: string; state: AdminSessionState; present: number; absent: number; total: number; submittedBy?: string; updatedAt: string };
export type AdminIssueStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Resolved';
export type AdminIssue = { id: string; studentId: string; departmentId: string; subjectId: string; sectionId: string; sessionId: string; issueType: string; existingStatus: 'Present' | 'Absent'; requestedStatus: 'Present' | 'Absent'; reason: string; status: AdminIssueStatus; submittedAt: string; decisionReason?: string; decidedAt?: string; decidedBy?: string; decidedByRole?: string; escalated?: boolean };
export type AdminNotification = { id: string; title: string; message: string; category: string; priority: 'Normal' | 'High'; audience: string; sender: string; status: 'Draft' | 'Scheduled' | 'Sent' | 'Failed'; createdAt: string; sendAt?: string; sentAt?: string };
export type Subscription = { plan: string; cycle: 'Monthly' | 'Annual'; status: 'Active' | 'Payment Issue' | 'Suspended' | 'Cancelled'; studentCapacity: number; renewalDate: string; paymentStatus: string };

type NotificationInput = Pick<AdminNotification, 'title' | 'message' | 'category' | 'priority' | 'audience'> & { sendAt?: string };
type OperationsValue = {
  schedules: AdminSchedule[]; sessions: AdminSession[]; issues: AdminIssue[]; notifications: AdminNotification[]; subscription: Subscription; lastUpdated: string;
  decideIssue: (id: string, decision: 'Approved' | 'Rejected', reason: string) => void; escalateIssue: (id: string, reason: string) => void; resolveIssues: (ids: string[]) => void;
  createNotification: (input: NotificationInput, mode: 'draft' | 'send' | 'schedule') => AdminNotification; retryNotification: (id: string) => void;
};

const Context = createContext<OperationsValue | null>(null);
const now = new Date(); const stamp = now.toISOString(); const today = stamp.slice(0, 10); const day = now.toLocaleDateString('en-US', { weekday: 'long' });
const schedules: AdminSchedule[] = [
  { id: 'schedule-cse-ml', departmentId: 'dept-cse', academicYearId: 'ay-2026', semesterId: 'sem-7', sectionId: 'section-cse-7a', subjectId: 'subject-ml', lecturerId: 'lec-ananya', day, startTime: '09:00', endTime: '10:00', room: 'Lab 3', updatedAt: stamp },
  { id: 'schedule-cse-ml-2', departmentId: 'dept-cse', academicYearId: 'ay-2026', semesterId: 'sem-7', sectionId: 'section-cse-7a', subjectId: 'subject-ml', lecturerId: 'lec-ananya', day, startTime: '13:00', endTime: '14:00', room: 'Lab 3', updatedAt: stamp },
  { id: 'schedule-ise-db', departmentId: 'dept-ise', academicYearId: 'ay-2026', semesterId: 'sem-7', sectionId: 'section-ise-7a', subjectId: 'subject-db', lecturerId: 'lec-rahul', day, startTime: '10:15', endTime: '11:15', room: 'Room 204', updatedAt: stamp },
  { id: 'schedule-ise-db-2', departmentId: 'dept-ise', academicYearId: 'ay-2026', semesterId: 'sem-7', sectionId: 'section-ise-7a', subjectId: 'subject-db', lecturerId: 'lec-rahul', day, startTime: '14:15', endTime: '15:15', room: 'Room 204', updatedAt: stamp },
  { id: 'schedule-ece-dsp', departmentId: 'dept-ece', academicYearId: 'ay-2026', semesterId: 'sem-5', sectionId: 'section-ece-5a', subjectId: 'subject-dsp', lecturerId: 'lec-nikhil', day, startTime: '11:30', endTime: '12:30', room: 'Room 118', updatedAt: stamp },
  { id: 'schedule-ece-dsp-2', departmentId: 'dept-ece', academicYearId: 'ay-2026', semesterId: 'sem-5', sectionId: 'section-ece-5a', subjectId: 'subject-dsp', lecturerId: 'lec-nikhil', day, startTime: '15:30', endTime: '16:30', room: 'Room 118', updatedAt: stamp },
];
const sessions: AdminSession[] = [
  { id: 'session-cse-1', scheduleId: 'schedule-cse-ml', date: today, state: 'Conducted', present: 1, absent: 1, total: 2, submittedBy: 'Dr. Ananya Rao', updatedAt: stamp },
  { id: 'session-cse-2', scheduleId: 'schedule-cse-ml-2', date: today, state: 'Pending', present: 0, absent: 0, total: 2, updatedAt: stamp },
  { id: 'session-ise-1', scheduleId: 'schedule-ise-db', date: today, state: 'Conducted', present: 1, absent: 0, total: 1, submittedBy: 'Prof. Rahul Sen', updatedAt: stamp },
  { id: 'session-ise-2', scheduleId: 'schedule-ise-db-2', date: today, state: 'Conducted', present: 1, absent: 0, total: 1, submittedBy: 'Prof. Rahul Sen', updatedAt: stamp },
  { id: 'session-ece-1', scheduleId: 'schedule-ece-dsp', date: today, state: 'Not Conducted', present: 0, absent: 0, total: 1, submittedBy: 'Prof. Nikhil Kumar', updatedAt: stamp },
  { id: 'session-ece-2', scheduleId: 'schedule-ece-dsp-2', date: today, state: 'Pending', present: 0, absent: 0, total: 1, updatedAt: stamp },
];
const initialIssues: AdminIssue[] = [
  { id: 'issue-cse-1', studentId: 'stu-diya', departmentId: 'dept-cse', subjectId: 'subject-ml', sectionId: 'section-cse-7a', sessionId: 'session-cse-1', issueType: 'Attendance marked incorrectly', existingStatus: 'Absent', requestedStatus: 'Present', reason: 'I attended the laboratory and completed the activity.', status: 'Submitted', submittedAt: new Date(now.getTime() - 45 * 60000).toISOString() },
  { id: 'issue-ise-1', studentId: 'stu-meera', departmentId: 'dept-ise', subjectId: 'subject-db', sectionId: 'section-ise-7a', sessionId: 'session-ise-1', issueType: 'Session record review', existingStatus: 'Absent', requestedStatus: 'Present', reason: 'The lecturer confirmed my presence after submission.', status: 'Under Review', submittedAt: new Date(now.getTime() - 86400000).toISOString(), escalated: true },
  { id: 'issue-cse-0', studentId: 'stu-aarav', departmentId: 'dept-cse', subjectId: 'subject-ml', sectionId: 'section-cse-7a', sessionId: 'session-cse-1', issueType: 'Correction completed', existingStatus: 'Absent', requestedStatus: 'Present', reason: 'Lecturer confirmation received.', status: 'Resolved', submittedAt: new Date(now.getTime() - 5 * 86400000).toISOString(), decisionReason: 'Verified against the class record.', decidedAt: new Date(now.getTime() - 4 * 86400000).toISOString(), decidedBy: 'Dr. Vikram Shah', decidedByRole: 'HOD' },
];
const initialNotifications: AdminNotification[] = [
  { id: 'notification-1', title: 'Academic registration closes Friday', message: 'Complete subject registration before Friday at 5 PM.', category: 'Academic', priority: 'High', audience: 'Entire college', sender: 'Development College Admin', status: 'Sent', createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(), sentAt: new Date(now.getTime() - 2 * 86400000).toISOString() },
  { id: 'notification-2', title: 'Semester records review', message: 'HODs should review semester placement.', category: 'Operations', priority: 'Normal', audience: 'HODs', sender: 'Development College Admin', status: 'Draft', createdAt: new Date(now.getTime() - 3600000).toISOString() },
  { id: 'notification-3', title: 'Portal maintenance', message: 'The portal will be unavailable briefly.', category: 'Important', priority: 'High', audience: 'Entire college', sender: 'Development College Admin', status: 'Failed', createdAt: new Date(now.getTime() - 7200000).toISOString() },
];
const subscription: Subscription = { plan: 'Professional', cycle: 'Monthly', status: 'Active', studentCapacity: 1000, renewalDate: '15 Oct 2026', paymentStatus: 'Paid' };
function uid(prefix: string) { return `${prefix}-${Date.now().toString(36)}`; }

export function AdminOperationsProvider({ children }: React.PropsWithChildren) {
  const [issues, setIssues] = useState(initialIssues); const [notifications, setNotifications] = useState(initialNotifications); const [lastUpdated, setLastUpdated] = useState(stamp);
  const touch = useCallback(() => setLastUpdated(new Date().toISOString()), []);
  const decideIssue = useCallback((id: string, decision: 'Approved' | 'Rejected', reason: string) => { setIssues((current) => current.map((item) => item.id === id ? { ...item, status: decision, decisionReason: reason, decidedAt: new Date().toISOString(), decidedBy: 'Development College Admin', decidedByRole: 'College Admin' } : item)); touch(); }, [touch]);
  const escalateIssue = useCallback((id: string, reason: string) => { setIssues((current) => current.map((item) => item.id === id ? { ...item, status: 'Under Review', escalated: true, decisionReason: reason } : item)); touch(); }, [touch]);
  const resolveIssues = useCallback((ids: string[]) => { setIssues((current) => current.map((item) => ids.includes(item.id) && (item.status === 'Approved' || item.status === 'Rejected') ? { ...item, status: 'Resolved' } : item)); touch(); }, [touch]);
  const createNotification = useCallback((input: NotificationInput, mode: 'draft' | 'send' | 'schedule') => { const createdAt = new Date().toISOString(); const item: AdminNotification = { ...input, id: uid('notification'), sender: 'Development College Admin', status: mode === 'send' ? 'Sent' : mode === 'schedule' ? 'Scheduled' : 'Draft', createdAt, sentAt: mode === 'send' ? createdAt : undefined }; setNotifications((current) => [item, ...current]); setLastUpdated(createdAt); return item; }, []);
  const retryNotification = useCallback((id: string) => { const sentAt = new Date().toISOString(); setNotifications((current) => current.map((item) => item.id === id && item.status === 'Failed' ? { ...item, status: 'Sent', sentAt } : item)); setLastUpdated(sentAt); }, []);
  const value = useMemo<OperationsValue>(() => ({ schedules, sessions, issues, notifications, subscription, lastUpdated, decideIssue, escalateIssue, resolveIssues, createNotification, retryNotification }), [issues, notifications, lastUpdated, decideIssue, escalateIssue, resolveIssues, createNotification, retryNotification]);
  return <Context value={value}>{children}</Context>;
}
export function useAdminOperations() { const value = React.use(Context); if (!value) throw new Error('useAdminOperations must be used within AdminOperationsProvider'); return value; }
