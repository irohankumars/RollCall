import React, { createContext, useMemo, useState } from 'react';
import { useAuth } from '@/auth/auth-provider';
import { lecturerAccessFor } from './access';

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

export function LecturerNotificationProvider({ children }: React.PropsWithChildren) {
  const { session } = useAuth();
  const access = lecturerAccessFor(session?.user);
  const [notifications, setNotifications] = useState(() => initialNotifications.filter((item) => access.isClassTeacher || item.related !== 'Class Teacher'));
  const value = useMemo<NotificationValue>(() => ({
    notifications,
    unreadCount: notifications.filter((item) => item.unread).length,
    markRead: (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item)),
    markAllRead: () => setNotifications((current) => current.map((item) => ({ ...item, unread: false }))),
  }), [notifications]);
  return <NotificationContext value={value}>{children}</NotificationContext>;
}

export function useLecturerNotifications() {
  const value = React.use(NotificationContext);
  if (!value) throw new Error('useLecturerNotifications must be used within LecturerNotificationProvider');
  return value;
}
