import React, { createContext, useEffect, useState } from 'react';
import { useAuth } from '@/auth/auth-provider';
import { timetableClient } from '@/timetable/client';
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
  const { session } = useAuth();
  const [notifications, setNotifications] = useState(initialStudentNotifications);

  const toStudentNotifications = (
    data: Awaited<ReturnType<typeof timetableClient.fetch>>,
  ): StudentNotification[] =>
    data.notifications.map((item) => ({
      id: item.id,
      category: 'ACADEMIC',
      title: item.title,
      preview: item.message,
      message: item.message,
      source: 'Timetable',
      timestamp: new Date(item.createdAt).toLocaleString(),
      unread: !item.readAt,
      destination: '/student/schedule',
      actionLabel: 'Open timetable',
      metadata: [{ label: 'Type', value: 'Timetable change' }],
    }));

  const mergeTimetableNotifications = (items: StudentNotification[]) =>
    setNotifications((current) => [
      ...items,
      ...current.filter((item) => !items.some((next) => next.id === item.id)),
    ]);

  const refresh = async () => {
    if (!session?.token) return;
    try {
      mergeTimetableNotifications(
        toStudentNotifications(await timetableClient.fetch(session.token)),
      );
    } catch {
      // Existing inbox remains available offline.
    }
  };

  useEffect(() => {
    let active = true;
    if (session?.token) {
      void timetableClient
        .fetch(session.token)
        .then((data) => {
          if (active) mergeTimetableNotifications(toStudentNotifications(data));
        })
        .catch(() => {
          // Existing inbox remains available offline.
        });
    }
    return () => {
      active = false;
    };
  }, [session?.token]);

  const value: StudentNotificationValue = {
    notifications,
    unreadCount: notifications.filter((item) => item.unread).length,
    markRead: (id) =>
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
      ),
    markAllRead: () =>
      setNotifications((current) =>
        current.map((item) => (item.unread ? { ...item, unread: false } : item)),
      ),
    refresh,
  };

  return <StudentNotificationContext value={value}>{children}</StudentNotificationContext>;
}

export function useStudentNotifications() {
  const value = React.use(StudentNotificationContext);
  if (!value) throw new Error('useStudentNotifications must be used within StudentNotificationProvider');
  return value;
}
