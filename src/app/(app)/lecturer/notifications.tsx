import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { AlertBanner, BottomSheet } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerPageSkeleton, LecturerShell, SectionHeading } from '@/lecturer/components';
import { NotificationRow } from '@/lecturer/class-teacher-components';
import { useLecturerNotifications, type NotificationCategory } from '@/lecturer/notification-provider';
import { useGlobalOverlays } from '@/shell/overlay-provider';

const categoryOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Attendance', value: 'ATTENDANCE' },
  { label: 'Class', value: 'CLASS' },
  { label: 'System', value: 'SYSTEM' },
] as const;

export default function Notifications() {
  const { colors } = useRollCallTheme();
  const overlays = useGlobalOverlays();
  const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'error' | 'offline' }>();
  const { notifications, unreadCount: unread, markRead, markAllRead } = useLecturerNotifications();
  const [category, setCategory] = useState<NotificationCategory>('ALL');
  const [selectedId, setSelectedId] = useState<string>();
  const selected = notifications.find((item) => item.id === selectedId);
  const visible = useMemo(() => notifications.filter((item) => category === 'ALL' || item.category === category), [category, notifications]);
  const readAll = () => { markAllRead(); overlays.showToast('All notifications marked as read'); };

  return <LecturerShell activeKey="notifications" title="Notifications" subtitle={`${unread} unread`}>
    <PageContainer width="standard">
      {state === 'loading' ? <LecturerPageSkeleton rows={5} /> : null}
      {state === 'error' ? <StateView state="error" message="Notifications could not be loaded." onRetry={() => router.replace('/lecturer/notifications' as Href)} /> : null}
      {state === 'empty' ? <View style={{ gap: spacing.md }}><StateView state="empty" title="No notifications" message="You&apos;re all caught up." /><Button label="Return to Today" variant="secondary" onPress={() => router.replace('/lecturer' as Href)} /></View> : null}
      {state !== 'loading' && state !== 'error' && state !== 'empty' ? <>
        {state === 'offline' ? <AlertBanner title="You are offline" message="Showing notifications already available on this device. New updates will appear after reconnecting." tone="warning" /> : null}
        <View style={{ gap: spacing.md }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><SectionHeading title="Inbox" /><Button label="Mark all read" variant="text" disabled={!unread} onPress={readAll} /></View><View accessibilityRole="radiogroup" accessibilityLabel="Notification categories" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{categoryOptions.map((option) => { const active = option.value === category; return <Button key={option.value} label={option.label} variant={active ? 'primary' : 'secondary'} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setCategory(option.value)} />; })}</View></View>
        <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{visible.length} notification{visible.length === 1 ? '' : 's'}</Text>
        {visible.length ? <View style={{ gap: spacing.sm }}>{visible.map((item) => <NotificationRow key={item.id} {...item} onPress={() => setSelectedId(item.id)} />)}</View> : <StateView state="empty" title="No notifications" message="You&apos;re all caught up." />}
      </> : null}
    </PageContainer>
    <BottomSheet visible={Boolean(selected)} title={selected?.title ?? 'Notification'} onDismiss={() => setSelectedId(undefined)}>
      {selected ? <><Text style={[typography.body, { color: colors.textPrimary }]}>{selected.message}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{selected.related} · {selected.timestamp}</Text>{selected.unread ? <Button label="Mark as read" onPress={() => { markRead(selected.id); overlays.showToast('Notification marked as read'); }} /> : null}<Button label="Close" variant="secondary" onPress={() => setSelectedId(undefined)} /></> : null}
    </BottomSheet>
  </LecturerShell>;
}
