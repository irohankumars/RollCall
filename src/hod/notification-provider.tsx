import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/auth/auth-provider';
import { timetableClient } from '@/timetable/client';
import { hodAccessFor } from './access';

export type NotificationCategory = 'ALL' | 'ATTENDANCE' | 'CLASS' | 'SYSTEM';
export type LecturerNotification = {
  id: string;
  category: Exclude<NotificationCategory, 'ALL'>;
  title: string;
  message: string;
  related: string;
  timestamp: string;
  unread: boolean;
};

const initialNotifications: LecturerNotification[] = [
  { id: 'n1', category: 'ATTENDANCE', title: 'Attendance completed', message: 'Attendance for Artificial Intelligence was completed with 5 of 6 students present.', related: 'CSE 2024 A', timestamp: '12 min ago', unread: true },
  { id: 'n2', category: 'CLASS', title: 'Class not conducted', message: 'Software Engineering is recorded as not conducted. Student attendance was not changed.', related: 'CSE 2024 A', timestamp: '1 hr ago', unread: true },
  { id: 'n3', category: 'ATTENDANCE', title: 'Daily summary ready', message: 'Attendance data is available for 4 of 5 classes today.', related: 'Class Teacher', timestamp: '2 hrs ago', unread: false },
  { id: 'n4', category: 'SYSTEM', title: 'Session secured', message: 'Your RollCall session was renewed on this device.', related: 'Account', timestamp: 'Yesterday', unread: false },
];

type NotificationValue = {
  notifications: LecturerNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationValue | null>(null);

export function HodNotificationProvider({ children }: React.PropsWithChildren) {
  const { session } = useAuth();
  const access = hodAccessFor(session?.user);
  const [notifications, setNotifications] = useState(() => initialNotifications.filter((item) => access.isClassTeacher || item.related !== 'Class Teacher'));
  useEffect(() => { if (!session?.token) return; let active = true; void timetableClient.fetch(session.token).then((data) => { if (!active) return; const timetableItems: LecturerNotification[] = data.notifications.map((item) => ({ id: item.id, category: 'CLASS', title: item.title, message: item.message, related: 'Timetable', timestamp: new Date(item.createdAt).toLocaleString(), unread: !item.readAt })); setNotifications((current) => [...timetableItems, ...current.filter((item) => !timetableItems.some((next) => next.id === item.id))]); }).catch(() => undefined); return () => { active = false; }; }, [session?.token]);
  const value = useMemo<NotificationValue>(() => ({
    notifications,
    unreadCount: notifications.filter((item) => item.unread).length,
    markRead: (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item)),
    markAllRead: () => setNotifications((current) => current.map((item) => ({ ...item, unread: false }))),
  }), [notifications]);
  return <NotificationContext value={value}>{children}</NotificationContext>;
}

export function useHodNotifications() {
  const value = React.use(NotificationContext);
  if (!value) throw new Error('useHodNotifications must be used within HodNotificationProvider');
  return value;
}
