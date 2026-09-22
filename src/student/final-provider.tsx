import React, { createContext, useCallback, useMemo, useState } from 'react';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';
import { studentHomeData } from './student-data';
import type { StudentNotificationPreferences, StudentRecentItem } from './types';

export type StudentProfileDraft = { displayName: string; phone: string };
type StudentFinalValue = {
  loading: boolean;
  profile: StudentProfileDraft;
  saveProfile: (profile: StudentProfileDraft) => Promise<void>;
  notificationPreferences: StudentNotificationPreferences;
  updateNotificationPreference: (key: keyof StudentNotificationPreferences, value: boolean) => void;
  pinnedSubjectIds: string[];
  togglePinnedSubject: (id: string) => void;
  recentItems: StudentRecentItem[];
  recordRecent: (item: Omit<StudentRecentItem, 'viewedAt'>) => void;
  dismissedImportantIds: string[];
  dismissImportant: (id: string) => void;
};

const keys = {
  profile: 'rollcall.student.profile', notifications: 'rollcall.student.notification-preferences', pinned: 'rollcall.student.pinned-subjects', recent: 'rollcall.student.recent-items', dismissed: 'rollcall.student.dismissed-important',
} as const;
const initialPreferences: StudentNotificationPreferences = { attendance: true, attendanceIssues: true, academic: true, important: true, system: true };
const initialProfile: StudentProfileDraft = { displayName: studentHomeData.student.name, phone: '' };
const StudentFinalContext = createContext<StudentFinalValue | null>(null);
function parseStored<T>(value: string | null, fallback: T): T { if (!value) return fallback; try { return JSON.parse(value) as T; } catch { return fallback; } }

export function StudentFinalProvider({ children }: React.PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfileDraft>(initialProfile);
  const [notificationPreferences, setNotificationPreferences] = useState(initialPreferences);
  const [pinnedSubjectIds, setPinnedSubjectIds] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState<StudentRecentItem[]>([]);
  const [dismissedImportantIds, setDismissedImportantIds] = useState<string[]>([]);
  React.useEffect(() => { let active = true; void Promise.all([readLocalPreference(keys.profile), readLocalPreference(keys.notifications), readLocalPreference(keys.pinned), readLocalPreference(keys.recent), readLocalPreference(keys.dismissed)]).then(([storedProfile, storedNotifications, storedPinned, storedRecent, storedDismissed]) => { if (!active) return; setProfile(parseStored(storedProfile, initialProfile)); setNotificationPreferences(parseStored(storedNotifications, initialPreferences)); setPinnedSubjectIds(parseStored(storedPinned, [])); setRecentItems(parseStored(storedRecent, [])); setDismissedImportantIds(parseStored(storedDismissed, [])); setLoading(false); }); return () => { active = false; }; }, []);
  const saveProfile = useCallback(async (next: StudentProfileDraft) => { setProfile(next); await writeLocalPreference(keys.profile, JSON.stringify(next)); }, []);
  const updateNotificationPreference = useCallback((key: keyof StudentNotificationPreferences, value: boolean) => { setNotificationPreferences((current) => { const next = { ...current, [key]: value }; void writeLocalPreference(keys.notifications, JSON.stringify(next)); return next; }); }, []);
  const togglePinnedSubject = useCallback((id: string) => { setPinnedSubjectIds((current) => { const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]; void writeLocalPreference(keys.pinned, JSON.stringify(next)); return next; }); }, []);
  const recordRecent = useCallback((item: Omit<StudentRecentItem, 'viewedAt'>) => { setRecentItems((current) => { const next = [{ ...item, viewedAt: new Date().toISOString() }, ...current.filter((existing) => !(existing.kind === item.kind && existing.id === item.id))].slice(0, 6); void writeLocalPreference(keys.recent, JSON.stringify(next)); return next; }); }, []);
  const dismissImportant = useCallback((id: string) => { setDismissedImportantIds((current) => { if (current.includes(id)) return current; const next = [...current, id]; void writeLocalPreference(keys.dismissed, JSON.stringify(next)); return next; }); }, []);
  const value = useMemo<StudentFinalValue>(() => ({ loading, profile, saveProfile, notificationPreferences, updateNotificationPreference, pinnedSubjectIds, togglePinnedSubject, recentItems, recordRecent, dismissedImportantIds, dismissImportant }), [dismissImportant, dismissedImportantIds, loading, notificationPreferences, pinnedSubjectIds, profile, recentItems, recordRecent, saveProfile, togglePinnedSubject, updateNotificationPreference]);
  return <StudentFinalContext value={value}>{children}</StudentFinalContext>;
}

export function useStudentFinal() {
  const value = React.use(StudentFinalContext);
  if (!value) throw new Error('useStudentFinal must be used within StudentFinalProvider');
  return value;
}
