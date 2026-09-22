import { useDeferredValue, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { SearchField, SelectField } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { useResource } from '@/lecturer/use-resource';
import { AttendanceHistoryRow, ChoiceSheet } from '@/student/attendance-components';
import { SubjectsSkeleton } from '@/student/components';
import { studentClient, studentSubjects } from '@/student/student-data';
import { StudentShell } from '@/student/shell';
import type { StudentAttendanceMark } from '@/student/types';

type StatusFilter = 'ALL' | StudentAttendanceMark;
type DateFilter = 'ALL' | 'WEEK' | 'MONTH';
const statusOptions = [{ label: 'All', value: 'ALL' }, { label: 'Present', value: 'PRESENT' }, { label: 'Absent', value: 'ABSENT' }] as const;
const subjectOptions = [{ label: 'All subjects', value: 'ALL' }, ...studentSubjects.map((item) => ({ label: `${item.code} · ${item.name}`, value: item.id }))] as const;
const dateOptions = [{ label: 'All dates', value: 'ALL' }, { label: 'Last 7 days', value: 'WEEK' }, { label: 'Current month', value: 'MONTH' }] as const;

export default function StudentAttendanceHistory() {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const params = useLocalSearchParams<{ subjectId?: string; state?: 'loading' | 'empty' | 'error' | 'offline' }>();
  const [query, setQuery] = useState(''); const [subject, setSubject] = useState(params.subjectId ?? 'ALL'); const [date, setDate] = useState<DateFilter>('ALL'); const [status, setStatus] = useState<StatusFilter>('ALL'); const [sheet, setSheet] = useState<'subject' | 'date'>();
  const deferredQuery = useDeferredValue(query.trim().toLowerCase()); const resource = useResource(studentClient.attendanceHistory, []); const source = useMemo(() => params.state === 'empty' ? [] : resource.data ?? [], [params.state, resource.data]);
  const latest = useMemo(() => source.length ? Math.max(...source.map((item) => Date.parse(`${item.date}T12:00:00`))) : 0, [source]);
  const records = useMemo(() => source.filter((item) => { const timestamp = Date.parse(`${item.date}T12:00:00`); const matchesQuery = `${item.subject} ${item.code} ${item.lecturer} ${item.information}`.toLowerCase().includes(deferredQuery); const matchesDate = date === 'ALL' || date === 'WEEK' && timestamp >= latest - 6 * 86400000 || date === 'MONTH' && new Date(timestamp).getMonth() === new Date(latest).getMonth(); return matchesQuery && (subject === 'ALL' || item.subjectId === subject) && (status === 'ALL' || item.attendance === status) && matchesDate; }).sort((a, b) => b.date.localeCompare(a.date)), [date, deferredQuery, latest, source, status, subject]);
  const clear = () => { setQuery(''); setSubject('ALL'); setDate('ALL'); setStatus('ALL'); };
  const retry = () => params.state ? router.replace('/student/attendance/history' as Href) : resource.retry();
  const subjectLabel = subjectOptions.find((item) => item.value === subject)?.label; const dateLabel = dateOptions.find((item) => item.value === date)?.label;
  return <StudentShell activeKey="attendance" title="Attendance History" subtitle="Your recorded sessions" back backFallback={'/student/attendance' as Href}><PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
    <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Attendance History</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Search and filter only your own recorded attendance.</Text></View>
    <View accessibilityLabel="Attendance history controls" style={{ gap: spacing.md }}><View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'flex-end', gap: spacing.md }}><View style={{ flex: 1 }}><SearchField value={query} onChangeText={setQuery} placeholder="Search subject, code, lecturer, or session" /></View><Button label="Refresh" variant="secondary" icon={<Ionicons accessibilityElementsHidden name="refresh-outline" size={sizing.iconSm} color={colors.primary} />} onPress={resource.retry} /></View><View style={{ flexDirection: isCompact ? 'column' : 'row', gap: spacing.md }}><View style={{ flex: 1 }}><SelectField label="Subject" value={subjectLabel} onPress={() => setSheet('subject')} /></View><View style={{ flex: 1 }}><SelectField label="Date" value={dateLabel} onPress={() => setSheet('date')} /></View></View><View accessibilityRole="radiogroup" accessibilityLabel="Attendance status" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{statusOptions.map((option) => <Button key={option.value} label={option.label} variant={status === option.value ? 'primary' : 'secondary'} accessibilityRole="radio" accessibilityState={{ checked: status === option.value }} onPress={() => setStatus(option.value)} />)}</View></View>
    {params.state === 'offline' ? <AlertBanner title="You are offline" message="Showing attendance history available on this device." tone="warning" /> : null}
    {resource.loading || params.state === 'loading' ? <SubjectsSkeleton /> : null}
    {params.state === 'error' || resource.error ? <StateView state={resource.error?.code === 'NETWORK_ERROR' ? 'offline' : 'error'} title="History unavailable" message={resource.error?.message ?? 'Attendance history could not be loaded.'} onRetry={retry} /> : null}
    {!resource.loading && params.state !== 'loading' && params.state !== 'error' && !resource.error ? source.length ? records.length ? <><Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{records.length} of {source.length} sessions</Text><Card style={{ paddingVertical: spacing.sm }}>{records.map((item, index) => <AttendanceHistoryRow key={item.id} item={item} last={index === records.length - 1} />)}</Card></> : <View style={{ gap: spacing.md }}><StateView state="empty" title="No matching attendance" message="No sessions match the current search and filters." /><Button label="Clear filters" variant="secondary" onPress={clear} /></View> : <StateView state="empty" title="No attendance history" message="Recorded sessions will appear here." /> : null}
  </PageContainer><ChoiceSheet visible={sheet === 'subject'} title="Filter by subject" value={subject} options={subjectOptions} onChange={setSubject} onDismiss={() => setSheet(undefined)} /><ChoiceSheet visible={sheet === 'date'} title="Filter by date" value={date} options={dateOptions} onChange={setDate} onDismiss={() => setSheet(undefined)} /></StudentShell>;
}
