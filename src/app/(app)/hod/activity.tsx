import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, RefreshControl, Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { PersonalActivityRow, type LecturerActivityCategory, type LecturerActivityItem } from '@/lecturer/activity-components';
import { LecturerPageSkeleton, HodShell, SectionHeading } from '@/hod/components';
import { AdaptiveUtilityMenu } from '@/lecturer/utility-components';

type Filter = 'ALL' | LecturerActivityCategory;
const filters: readonly { label: string; value: Filter }[] = [{ label: 'All', value: 'ALL' }, { label: 'Attendance', value: 'ATTENDANCE' }, { label: 'Account', value: 'ACCOUNT' }];
const activities: readonly LecturerActivityItem[] = [
  { id: 'a1', category: 'ATTENDANCE', title: 'Attendance completed', context: 'Machine Learning · CSE 2024 A', timestamp: '10:42 AM', group: 'Today', icon: 'checkmark-circle-outline', destination: '/hod/history' },
  { id: 'a2', category: 'ACCOUNT', title: 'Profile updated', context: 'HOD profile', timestamp: '9:15 AM', group: 'Today', icon: 'person-outline', destination: '/hod/profile' },
  { id: 'a3', category: 'ATTENDANCE', title: 'Attendance reviewed', context: 'Artificial Intelligence · CSE 2024 A', timestamp: '4:20 PM', group: 'Yesterday', icon: 'document-text-outline', destination: '/hod/history' },
  { id: 'a4', category: 'ACCOUNT', title: 'Appearance changed', context: 'Dark theme selected', timestamp: '2:05 PM', group: 'Yesterday', icon: 'contrast-outline', destination: '/hod/settings/appearance' },
  { id: 'a5', category: 'ACCOUNT', title: 'Sign-in method updated', context: 'Google connected', timestamp: 'Sep 18', group: 'Earlier', icon: 'key-outline', destination: '/hod/settings/security/sign-in-methods' },
];

export default function LecturerActivity() {
  const { colors } = useRollCallTheme(); const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'error' }>();
  const [filter, setFilter] = useState<Filter>('ALL'); const [selected, setSelected] = useState<LecturerActivityItem>(); const [refreshing, setRefreshing] = useState(false); const [refreshed, setRefreshed] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); }, []);
  const visible = useMemo(() => activities.filter((item) => filter === 'ALL' || item.category === filter), [filter]);
  const groups = useMemo(() => ['Today', 'Yesterday', 'Earlier'].map((group) => ({ group, items: visible.filter((item) => item.group === group) })).filter((group) => group.items.length), [visible]);
  const refresh = () => { if (refreshing) return; setRefreshing(true); setRefreshed(false); refreshTimer.current = setTimeout(() => { setRefreshing(false); setRefreshed(true); }, 650); };
  const open = (item: LecturerActivityItem) => router.push(item.destination as Href);

  return <HodShell activeKey="activity" title="Activity" subtitle="Your recent RollCall activity" back backFallback={'/hod/profile' as Href}>
    <PageContainer width="compact" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}>
      {state === 'loading' ? <LecturerPageSkeleton rows={5} /> : null}
      {state === 'error' ? <StateView state="error" message="Activity could not be loaded." onRetry={refresh} /> : null}
      {state === 'empty' ? <StateView state="empty" title="No activity yet" message="Meaningful attendance and account actions will appear here." /> : null}
      {!state ? <>
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><SectionHeading title="Personal activity" />{Platform.OS === 'web' ? <Button label="Refresh" variant="text" loading={refreshing} onPress={refresh} /> : null}</View>
          <View accessibilityRole="radiogroup" accessibilityLabel="Activity filters" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{filters.map((option) => { const active = filter === option.value; return <Button key={option.value} label={option.label} variant={active ? 'primary' : 'secondary'} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setFilter(option.value)} />; })}</View>
          <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{refreshing ? 'Refreshing activity.' : refreshed ? 'Activity refreshed just now.' : `${visible.length} recent ${visible.length === 1 ? 'event' : 'events'}`}</Text>
        </View>
        {groups.length ? groups.map(({ group, items }) => <View key={group} style={{ gap: spacing.xs }}><SectionHeading title={group} />{items.map((item, index) => <PersonalActivityRow key={item.id} item={item} last={index === items.length - 1} onOpen={() => open(item)} onMore={() => setSelected(item)} />)}</View>) : <StateView state="empty" title="No matching activity" message="Choose another activity filter." />}
      </> : null}
    </PageContainer>
    <AdaptiveUtilityMenu visible={Boolean(selected)} title={selected?.title ?? 'Activity details'} onDismiss={() => setSelected(undefined)}>{selected ? <><Text style={[typography.body, { color: colors.textPrimary }]}>{selected.context}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{selected.group}, {selected.timestamp}</Text><Button label="Open related page" onPress={() => { const item = selected; setSelected(undefined); open(item); }} /><Button label="Close" variant="secondary" onPress={() => setSelected(undefined)} /></> : null}</AdaptiveUtilityMenu>
  </HodShell>;
}
