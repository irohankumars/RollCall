import { useDeferredValue, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { SearchField, SelectField } from '@/design-system/components/forms';
import { SkeletonCard, StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { useGlobalOverlays } from '@/shell/overlay-provider';
import { ChoiceSheet } from '@/student/attendance-components';
import { useStudentNotifications } from '@/student/notification-provider';
import { NotificationRow } from '@/student/s3-components';
import { StudentShell } from '@/student/shell';
import type { StudentNotificationCategory } from '@/student/types';

type CategoryFilter = 'ALL' | StudentNotificationCategory;
type ReadFilter = 'ALL' | 'UNREAD' | 'READ';
const categoryOptions = [{ label: 'All categories', value: 'ALL' }, { label: 'Attendance', value: 'ATTENDANCE' }, { label: 'Attendance Issue', value: 'ATTENDANCE_ISSUE' }, { label: 'Academic', value: 'ACADEMIC' }, { label: 'System', value: 'SYSTEM' }, { label: 'Important', value: 'IMPORTANT' }] as const;
const readOptions = [{ label: 'All notifications', value: 'ALL' }, { label: 'Unread', value: 'UNREAD' }, { label: 'Read', value: 'READ' }] as const;

export default function StudentNotifications() {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const overlays = useGlobalOverlays();
  const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'error' | 'offline' }>();
  const { notifications, unreadCount, markRead, markAllRead, refresh } = useStudentNotifications();
  const [query, setQuery] = useState(''); const [category, setCategory] = useState<CategoryFilter>('ALL'); const [readState, setReadState] = useState<ReadFilter>('ALL'); const [sheet, setSheet] = useState<'category' | 'read'>(); const [refreshing, setRefreshing] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase()); const source = useMemo(() => state === 'empty' ? [] : notifications, [notifications, state]);
  const visible = useMemo(() => source.filter((item) => { const matchesSearch = `${item.title} ${item.preview} ${item.message} ${item.source} ${item.subject ?? ''} ${item.category}`.toLowerCase().includes(deferredQuery); const matchesCategory = category === 'ALL' || item.category === category; const matchesRead = readState === 'ALL' || (readState === 'UNREAD' ? item.unread : !item.unread); return matchesSearch && matchesCategory && matchesRead; }), [category, deferredQuery, readState, source]);
  const open = (id: string) => { markRead(id); router.push(`/student/notifications/${id}` as Href); };
  const refreshInbox = async () => { setRefreshing(true); await refresh(); setRefreshing(false); overlays.showToast('Notifications refreshed'); };
  const clear = () => { setQuery(''); setCategory('ALL'); setReadState('ALL'); };
  const retry = () => state ? router.replace('/student/notifications' as Href) : void refreshInbox();
  const categoryLabel = categoryOptions.find((item) => item.value === category)?.label; const readLabel = readOptions.find((item) => item.value === readState)?.label;

  return <StudentShell activeKey="notifications" title="Notifications" subtitle={unreadCount ? `${unreadCount} unread` : 'All caught up'}><PageContainer width="standard" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
    <View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', justifyContent: 'space-between', gap: spacing.md }}><View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Notifications</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{unreadCount ? `${unreadCount} notification${unreadCount === 1 ? '' : 's'} need your attention.` : 'You have no unread notifications.'}</Text></View><Button label="Mark all as read" variant="secondary" disabled={!unreadCount} onPress={() => { markAllRead(); overlays.showToast('All notifications marked as read'); }} /></View>
    {state === 'offline' ? <AlertBanner title="You are offline" message="Showing notifications available on this device." tone="warning" /> : null}
    <View accessibilityLabel="Notification controls" style={{ gap: spacing.md }}><View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'flex-end', gap: spacing.md }}><View style={{ flex: 1 }}><SearchField value={query} onChangeText={setQuery} placeholder="Search notifications" /></View><Button label="Refresh" variant="secondary" loading={refreshing} icon={<Ionicons accessibilityElementsHidden name="refresh-outline" size={sizing.iconSm} color={colors.primary} />} onPress={() => void refreshInbox()} /></View><View style={{ flexDirection: isCompact ? 'column' : 'row', gap: spacing.md }}><View style={{ flex: 1 }}><SelectField label="Category" value={categoryLabel} onPress={() => setSheet('category')} /></View><View style={{ flex: 1 }}><SelectField label="Read state" value={readLabel} onPress={() => setSheet('read')} /></View></View></View>
    {state === 'loading' ? <View style={{ gap: spacing.md }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View> : null}
    {state === 'error' ? <StateView state="error" title="Notifications unavailable" message="Notifications could not be loaded." onRetry={retry} /> : null}
    {state !== 'loading' && state !== 'error' ? source.length ? visible.length ? <><Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{visible.length} of {source.length} notifications</Text><View style={{ gap: spacing.md }}>{visible.map((item) => <NotificationRow key={item.id} item={item} onOpen={() => open(item.id)} onMarkRead={() => markRead(item.id)} />)}</View></> : <View style={{ gap: spacing.md }}><StateView state="empty" title="No matching notifications" message="No notifications match the current search and filters." /><Button label="Clear filters" variant="secondary" onPress={clear} /></View> : <StateView state="empty" title="No notifications" message="You’re all caught up. New notifications will appear here." /> : null}
  </PageContainer><ChoiceSheet visible={sheet === 'category'} title="Filter by category" value={category} options={categoryOptions} onChange={setCategory} onDismiss={() => setSheet(undefined)} /><ChoiceSheet visible={sheet === 'read'} title="Filter by read state" value={readState} options={readOptions} onChange={setReadState} onDismiss={() => setSheet(undefined)} /></StudentShell>;
}
