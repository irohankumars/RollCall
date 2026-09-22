import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { useStudentNotifications } from '@/student/notification-provider';
import { MetadataList, NotificationCategory } from '@/student/s3-components';
import { StudentShell } from '@/student/shell';

export default function StudentNotificationDetails() {
  const { colors } = useRollCallTheme(); const { notificationId = '' } = useLocalSearchParams<{ notificationId: string }>(); const { notifications, markRead } = useStudentNotifications(); const item = notifications.find((notification) => notification.id === notificationId);
  useEffect(() => { if (item?.unread) markRead(notificationId); }, [item?.unread, markRead, notificationId]);
  const timestamp = item ? new Date(item.timestamp).toLocaleString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
  return <StudentShell activeKey="notifications" title="Notification Details" subtitle={item?.source ?? 'Notification'} back backFallback={'/student/notifications' as Href}><PageContainer width="compact" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
    {!item ? <StateView state="empty" title="Notification unavailable" message="This notification is no longer available on this device." /> : <>
      <Card><View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md }}><View style={{ flex: 1, minWidth: 220, gap: spacing.sm }}><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.title}</Text><Text style={[typography.bodySmall, { color: colors.textMuted }]}>{item.source} · {timestamp}</Text></View><NotificationCategory category={item.category} /></View><Text style={[typography.body, { color: colors.textPrimary }]}>{item.message}</Text>{item.priority === 'HIGH' ? <Text style={[typography.label, { color: colors.error }]}>High priority</Text> : null}</Card>
      {item.metadata.length ? <MetadataList rows={item.metadata} /> : null}
      {item.destination && item.actionLabel ? <Button label={item.actionLabel} onPress={() => router.push(item.destination as Href)} /> : <Text style={[typography.bodySmall, { color: colors.textMuted }]}>No action is required for this notification.</Text>}
    </>}
  </PageContainer></StudentShell>;
}
