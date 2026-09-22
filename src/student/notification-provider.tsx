import React, { createContext, useMemo, useState } from 'react';
import { initialStudentNotifications } from './s3-data';
import type { StudentNotification } from './types';

type StudentNotificationValue = {
  notifications: StudentNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => Promise<void>;
};

const StudentNotificationContext = createContext<StudentNotificationValue | null>(null);

export function StudentNotificationProvider({ children }: React.PropsWithChildren) {
  const [notifications, setNotifications] = useState(initialStudentNotifications);
  const value = useMemo<StudentNotificationValue>(() => ({
    notifications,
    unreadCount: notifications.filter((item) => item.unread).length,
    markRead: (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item)),
    markAllRead: () => setNotifications((current) => current.map((item) => item.unread ? { ...item, unread: false } : item)),
    refresh: async () => setNotifications((current) => [...current]),
  }), [notifications]);
  return <StudentNotificationContext value={value}>{children}</StudentNotificationContext>;
}

export function useStudentNotifications() {
  const value = React.use(StudentNotificationContext);
  if (!value) throw new Error('useStudentNotifications must be used within StudentNotificationProvider');
  return value;
}
