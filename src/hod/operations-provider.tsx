import React, { createContext, useCallback, useMemo, useState } from 'react';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';

export type ScheduleEntry = { id: string; academicYearId: string; semesterId: string; sectionId: string; subjectId: string; lecturerId: string; day: string; startTime: string; endTime: string; room: string; updatedAt: string };
export type AttendanceSessionState = 'Conducted' | 'Pending' | 'Not Conducted';
export type DepartmentAttendanceSession = { id: string; scheduleId: string; date: string; state: AttendanceSessionState; present: number; absent: number; total: number; submittedBy?: string; updatedAt: string };
export type AttendanceIssueStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Resolved';
export type AttendanceIssue = { id: string; studentId: string; subjectId: string; sectionId: string; sessionId: string; issueType: string; existingStatus: 'Present' | 'Absent'; requestedStatus: 'Present' | 'Absent'; reason: string; status: AttendanceIssueStatus; submittedAt: string; decisionReason?: string; decidedAt?: string; decidedBy?: string };
export type DepartmentNotification = { id: string; title: string; message: string; category: string; priority: 'Normal' | 'High'; audience: string; status: 'Draft' | 'Ready' | 'Sent' | 'Failed'; createdAt: string; sentAt?: string };
export type RecentChange = { id: string; action: string; entity: string; at: string };
export type ViewedEntity = { id: string; type: 'Student' | 'Lecturer' | 'Subject' | 'Class'; title: string; href: string };
export type SavedFilter = { id: string; name: string; kind: 'low-attendance' | 'schedule'; value: string };

type ScheduleInput = Omit<ScheduleEntry, 'id' | 'updatedAt'>;
type NotificationInput = Pick<DepartmentNotification, 'title' | 'message' | 'category' | 'priority' | 'audience'>;
type OperationsValue = {
  schedules: ScheduleEntry[]; sessions: DepartmentAttendanceSession[]; issues: AttendanceIssue[]; notifications: DepartmentNotification[]; recentChanges: RecentChange[];
  pinnedSectionId?: string; pinnedSemesterId?: string; recentlyViewed: ViewedEntity[]; savedFilters: SavedFilter[];
  saveSchedule: (input: ScheduleInput, editId?: string, replace?: boolean) => { status: 'saved' | 'conflict'; conflict?: ScheduleEntry };
  decideIssue: (id: string, decision: 'Approved' | 'Rejected', reason: string) => void;
  createNotification: (input: NotificationInput, send: boolean) => DepartmentNotification; sendNotification: (id: string) => void;
  setPinnedSection: (id?: string) => void; setPinnedSemester: (id?: string) => void; recordViewed: (item: ViewedEntity) => void; removeViewed: (id: string) => void;
  addSavedFilter: (name: string, kind: SavedFilter['kind'], value: string) => void; removeSavedFilter: (id: string) => void;
  resolveIssues: (ids: string[]) => void;
};

const Context = createContext<OperationsValue | null>(null);
const now = new Date(); const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']; const today = dayNames[now.getDay()]; const isoDate = now.toISOString().slice(0,10);
const initialSchedules: ScheduleEntry[] = [
  { id: 'schedule-ml', academicYearId: 'ay-2026', semesterId: 'sem-7', sectionId: 'section-7a', subjectId: 'subject-ml', lecturerId: 'me', day: today, startTime: '10:00', endTime: '11:00', room: 'Lab 3', updatedAt: now.toISOString() },
  { id: 'schedule-cn', academicYearId: 'ay-2026', semesterId: 'sem-7', sectionId: 'section-7a', subjectId: 'subject-cn', lecturerId: 'lec-rahul', day: today, startTime: '13:00', endTime: '14:00', room: 'Room 204', updatedAt: now.toISOString() },
  { id: 'schedule-db', academicYearId: 'ay-2026', semesterId: 'sem-5', sectionId: 'section-5b', subjectId: 'subject-db', lecturerId: 'lec-ananya', day: today, startTime: '14:15', endTime: '15:15', room: 'Room 118', updatedAt: now.toISOString() },
  { id: 'schedule-ml-wed', academicYearId: 'ay-2026', semesterId: 'sem-7', sectionId: 'section-7a', subjectId: 'subject-ml', lecturerId: 'me', day: 'Wednesday', startTime: '10:00', endTime: '11:00', room: 'Lab 3', updatedAt: now.toISOString() },
];
const initialSessions: DepartmentAttendanceSession[] = [
  { id: 'dept-session-1', scheduleId: 'schedule-ml', date: isoDate, state: 'Conducted', present: 5, absent: 1, total: 6, submittedBy: 'Dr. Vikram Shah', updatedAt: now.toISOString() },
  { id: 'dept-session-2', scheduleId: 'schedule-cn', date: isoDate, state: 'Pending', present: 0, absent: 0, total: 6, updatedAt: now.toISOString() },
  { id: 'dept-session-3', scheduleId: 'schedule-db', date: isoDate, state: 'Not Conducted', present: 0, absent: 0, total: 6, submittedBy: 'Dr. Ananya Rao', updatedAt: now.toISOString() },
];
const initialIssues: AttendanceIssue[] = [
  { id: 'issue-1', studentId: 'student-3', subjectId: 'subject-ml', sectionId: 'section-7a', sessionId: 'dept-session-1', issueType: 'Attendance marked incorrectly', existingStatus: 'Absent', requestedStatus: 'Present', reason: 'I was present and completed the laboratory activity.', status: 'Submitted', submittedAt: new Date(now.getTime()-45*60000).toISOString() },
  { id: 'issue-2', studentId: 'student-5', subjectId: 'subject-cn', sectionId: 'section-7a', sessionId: 'dept-session-2', issueType: 'Session status question', existingStatus: 'Absent', requestedStatus: 'Present', reason: 'Attendance was not available when class ended.', status: 'Under Review', submittedAt: new Date(now.getTime()-24*3600000).toISOString() },
];
const initialNotifications: DepartmentNotification[] = [{ id: 'dept-note-1', title: 'Academic registration review', message: 'Review your registered subjects before Friday.', category: 'Academic', priority: 'Normal', audience: 'Entire department', status: 'Sent', createdAt: new Date(now.getTime()-2*86400000).toISOString(), sentAt: new Date(now.getTime()-2*86400000).toISOString() }];

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) { return aStart < bEnd && bStart < aEnd; }
function uid(prefix: string) { return `${prefix}-${Date.now().toString(36)}`; }

export function HodOperationsProvider({ children }: React.PropsWithChildren) {
  const [schedules, setSchedules] = useState(initialSchedules); const [sessions] = useState(initialSessions); const [issues, setIssues] = useState(initialIssues); const [notifications, setNotifications] = useState(initialNotifications);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([{ id: 'change-1', action: 'Lecturer assigned', entity: 'Machine Learning · CSE 2024 A', at: new Date(now.getTime()-20*60000).toISOString() }, { id: 'change-2', action: 'Class Teacher changed', entity: 'CSE 2025 B', at: new Date(now.getTime()-2*3600000).toISOString() }]);
  const [pinnedSectionId, setPinnedSectionState] = useState<string>(); const [pinnedSemesterId, setPinnedSemesterState] = useState<string>(); const [recentlyViewed, setRecentlyViewed] = useState<ViewedEntity[]>([]); const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  React.useEffect(() => { void Promise.all([readLocalPreference('rollcall.hod.pin.section'), readLocalPreference('rollcall.hod.pin.semester'), readLocalPreference('rollcall.hod.saved-filters')]).then(([section, semester, filters]) => { if (section) setPinnedSectionState(section); if (semester) setPinnedSemesterState(semester); if (filters) try { setSavedFilters(JSON.parse(filters)); } catch { /* Ignore malformed local preference. */ } }); }, []);
  const addChange = useCallback((action: string, entity: string) => setRecentChanges((current) => [{ id: uid('change'), action, entity, at: new Date().toISOString() }, ...current].slice(0, 8)), []);
  const saveSchedule = useCallback((input: ScheduleInput, editId?: string, replace = false) => { const conflict = schedules.find((item) => item.id !== editId && item.day === input.day && overlaps(item.startTime, item.endTime, input.startTime, input.endTime) && (item.sectionId === input.sectionId || item.lecturerId === input.lecturerId)); if (conflict && !replace) return { status: 'conflict' as const, conflict }; const entry = { ...input, id: editId ?? uid('schedule'), updatedAt: new Date().toISOString() }; setSchedules((current) => editId ? current.map((item) => item.id === editId ? entry : item) : [...current, entry]); addChange(editId ? 'Schedule updated' : 'Schedule created', `${input.day} · ${input.startTime}`); return { status: 'saved' as const }; }, [addChange, schedules]);
  const decideIssue = useCallback((id: string, decision: 'Approved' | 'Rejected', reason: string) => { setIssues((current) => current.map((item) => item.id === id ? { ...item, status: decision, decisionReason: reason, decidedAt: new Date().toISOString(), decidedBy: 'Dr. Vikram Shah' } : item)); addChange(`Attendance issue ${decision.toLowerCase()}`, id); }, [addChange]);
  const createNotification = useCallback((input: NotificationInput, send: boolean) => { const item: DepartmentNotification = { ...input, id: uid('notification'), status: send ? 'Sent' : 'Draft', createdAt: new Date().toISOString(), sentAt: send ? new Date().toISOString() : undefined }; setNotifications((current) => [item, ...current]); addChange(send ? 'Notification sent' : 'Notification drafted', input.title); return item; }, [addChange]);
  const sendNotification = useCallback((id: string) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, status: 'Sent', sentAt: new Date().toISOString() } : item)), []);
  const setPinnedSection = useCallback((id?: string) => { setPinnedSectionState(id); void writeLocalPreference('rollcall.hod.pin.section', id ?? ''); }, []); const setPinnedSemester = useCallback((id?: string) => { setPinnedSemesterState(id); void writeLocalPreference('rollcall.hod.pin.semester', id ?? ''); }, []);
  const recordViewed = useCallback((item: ViewedEntity) => setRecentlyViewed((current) => [item, ...current.filter((value) => value.id !== item.id)].slice(0, 6)), []); const removeViewed = useCallback((id: string) => setRecentlyViewed((current) => current.filter((item) => item.id !== id)), []);
  const addSavedFilter = useCallback((name: string, kind: SavedFilter['kind'], filterValue: string) => setSavedFilters((current) => { const next = [...current.filter((item) => item.name !== name), { id: uid('filter'), name, kind, value: filterValue }]; void writeLocalPreference('rollcall.hod.saved-filters', JSON.stringify(next)); return next; }), []); const removeSavedFilter = useCallback((id: string) => setSavedFilters((current) => { const next = current.filter((item) => item.id !== id); void writeLocalPreference('rollcall.hod.saved-filters', JSON.stringify(next)); return next; }), []);
  const resolveIssues = useCallback((ids: string[]) => setIssues((current) => current.map((item) => ids.includes(item.id) && (item.status === 'Approved' || item.status === 'Rejected') ? { ...item, status: 'Resolved' } : item)), []);
  const value = useMemo(() => ({ schedules, sessions, issues, notifications, recentChanges, pinnedSectionId, pinnedSemesterId, recentlyViewed, savedFilters, saveSchedule, decideIssue, createNotification, sendNotification, setPinnedSection, setPinnedSemester, recordViewed, removeViewed, addSavedFilter, removeSavedFilter, resolveIssues }), [schedules, sessions, issues, notifications, recentChanges, pinnedSectionId, pinnedSemesterId, recentlyViewed, savedFilters, saveSchedule, decideIssue, createNotification, sendNotification, setPinnedSection, setPinnedSemester, recordViewed, removeViewed, addSavedFilter, removeSavedFilter, resolveIssues]);
  return <Context value={value}>{children}</Context>;
}

export function useHodOperations() { const value = React.use(Context); if (!value) throw new Error('useHodOperations must be used within HodOperationsProvider'); return value; }
