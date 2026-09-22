import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button, Card, IconButton } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { SkeletonCard, StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { ScheduleClassRow, ScheduleDaySelector } from '@/student/s3-components';
import { studentS3Client } from '@/student/s3-data';
import { StudentShell } from '@/student/shell';

const today = '2026-09-21';
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function startOfWeek(date: Date) { const result = new Date(date); const day = (result.getDay() + 6) % 7; result.setDate(result.getDate() - day); result.setHours(12, 0, 0, 0); return result; }
function parseDate(value: string) { return new Date(`${value}T12:00:00`); }

export default function StudentSchedule() {
  const { colors } = useRollCallTheme(); const { isCompact, isExpanded } = useResponsive(); const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'no-classes' | 'error' | 'offline' }>();
  const resource = useResource(studentS3Client.schedule, []); const source = useMemo(() => state === 'empty' ? [] : resource.data ?? [], [resource.data, state]);
  const [selectedDate, setSelectedDate] = useState(today); const [weekStart, setWeekStart] = useState(() => startOfWeek(parseDate(today)));
  const dayClasses = useMemo(() => state === 'no-classes' ? [] : source.filter((item) => item.date === selectedDate), [selectedDate, source, state]);
  const focusClasses = selectedDate === today ? dayClasses.filter((item) => item.status === 'current' || item.status === 'next') : [];
  const selectedLabel = parseDate(selectedDate).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  const moveWeek = (amount: number) => { const next = new Date(weekStart); next.setDate(next.getDate() + amount * 7); setWeekStart(next); setSelectedDate(dateKey(next)); };
  const moveDay = (amount: number) => { const next = parseDate(selectedDate); next.setDate(next.getDate() + amount); setSelectedDate(dateKey(next)); setWeekStart(startOfWeek(next)); };
  const selectToday = () => { const date = parseDate(today); setSelectedDate(today); setWeekStart(startOfWeek(date)); };
  const retry = () => state ? router.replace('/student/schedule' as Href) : resource.retry();

  return <StudentShell activeKey="schedule" title="Academic Schedule" subtitle={selectedLabel}><PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
    <View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', justifyContent: 'space-between', gap: spacing.md }}><View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Academic Schedule</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Review today and move through your current academic week.</Text></View><Button label="Refresh" variant="secondary" icon={<Ionicons accessibilityElementsHidden name="refresh-outline" size={sizing.iconSm} color={colors.primary} />} onPress={resource.retry} /></View>
    {state === 'offline' ? <AlertBanner title="You are offline" message="Showing the schedule available on this device." tone="warning" /> : null}
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><IconButton label="Previous week" onPress={() => moveWeek(-1)}><Ionicons name="chevron-back" size={sizing.iconMd} color={colors.primary} /></IconButton><Text accessibilityRole="header" style={[typography.heading, { flex: 1, textAlign: 'center', color: colors.textPrimary }]}>Week of {weekStart.toLocaleDateString([], { day: 'numeric', month: 'short' })}</Text><IconButton label="Next week" onPress={() => moveWeek(1)}><Ionicons name="chevron-forward" size={sizing.iconMd} color={colors.primary} /></IconButton></View><ScheduleDaySelector weekStart={weekStart} selectedDate={selectedDate} onSelect={setSelectedDate} /><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}><Button label="Previous day" variant="text" onPress={() => moveDay(-1)} /><Button label="Today" variant="secondary" disabled={selectedDate === today} onPress={selectToday} /><Button label="Next day" variant="text" onPress={() => moveDay(1)} /></View></Card>
    {resource.loading || state === 'loading' ? <View style={{ gap: spacing.md }}><SkeletonCard /><SkeletonCard /><SkeletonCard /></View> : null}
    {resource.error || state === 'error' ? <StateView state="error" title="Schedule unavailable" message={resource.error?.message ?? 'Your academic schedule could not be loaded.'} onRetry={retry} /> : null}
    {!resource.loading && !resource.error && state !== 'loading' && state !== 'error' ? source.length ? <View style={{ flexDirection: isExpanded ? 'row' : 'column', alignItems: 'flex-start', gap: spacing.xxl }}><View style={{ flex: 1, width: '100%', gap: spacing.sm }}><SectionHeading title={selectedLabel} />{dayClasses.length ? <Card style={{ paddingVertical: spacing.sm }}>{dayClasses.map((item, index) => <ScheduleClassRow key={item.id} item={item} last={index === dayClasses.length - 1} onPress={() => router.push(`/student/schedule/${item.id}` as Href)} />)}</Card> : <StateView state="empty" title={selectedDate === today ? 'No classes scheduled today' : 'No classes scheduled'} message="There are no classes in the local schedule for this day." />}</View><View style={{ width: isExpanded ? 360 : '100%', gap: spacing.lg }}>{focusClasses.length ? <View style={{ gap: spacing.sm }}><SectionHeading title="Current and next" /><Card style={{ paddingVertical: spacing.sm }}>{focusClasses.map((item, index) => <ScheduleClassRow key={item.id} item={item} compact last={index === focusClasses.length - 1} onPress={() => router.push(`/student/schedule/${item.id}` as Href)} />)}</Card></View> : null}<View style={{ gap: spacing.sm }}><SectionHeading title="Academic information" /><Button label="View Academic Overview" variant="secondary" onPress={() => router.push('/student/academic' as Href)} /><Button label="Important Academic Dates" variant="secondary" onPress={() => router.push('/student/academic/dates' as Href)} /></View></View></View> : <StateView state="empty" title="Schedule unavailable" message="No schedule data is available on this device." /> : null}
  </PageContainer></StudentShell>;
}
