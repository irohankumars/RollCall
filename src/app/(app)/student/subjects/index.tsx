import { useDeferredValue, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { SearchField } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { useResource } from '@/lecturer/use-resource';
import { SubjectsSkeleton, SubjectAttendanceRow } from '@/student/components';
import { studentClient } from '@/student/student-data';
import { StudentShell } from '@/student/shell';
import type { StudentAttendanceStatus } from '@/student/types';
import { useStudentFinal } from '@/student/final-provider';

type SubjectFilter = 'all' | StudentAttendanceStatus;
type SubjectSort = 'name' | 'attendance';
const filters = [{ label: 'All', value: 'all' }, { label: 'Good', value: 'good' }, { label: 'Attention', value: 'attention' }, { label: 'Low', value: 'low' }] as const;

export default function StudentSubjects() {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  const { pinnedSubjectIds, togglePinnedSubject } = useStudentFinal();
  const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'error' | 'offline' }>();
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState<SubjectFilter>('all'); const [sort, setSort] = useState<SubjectSort>('name');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase()); const resource = useResource(studentClient.subjects, []);
  const source = useMemo(() => state === 'empty' ? [] : resource.data ?? [], [resource.data, state]);
  const subjects = useMemo(() => source.filter((item) => `${item.name} ${item.code} ${item.lecturer}`.toLowerCase().includes(deferredQuery) && (filter === 'all' || item.status === filter)).sort((a, b) => Number(pinnedSubjectIds.includes(b.id)) - Number(pinnedSubjectIds.includes(a.id)) || (sort === 'name' ? a.name.localeCompare(b.name) : b.percentage - a.percentage)), [deferredQuery, filter, pinnedSubjectIds, sort, source]);
  const retry = () => { if (state) router.replace('/student/subjects' as Href); else resource.retry(); };
  const clear = () => { setQuery(''); setFilter('all'); };

  return <StudentShell activeKey="subjects" title="My Subjects" subtitle="Attendance by subject">
    <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
      <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>My Subjects</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Review attendance across every enrolled subject.</Text></View>
      <View accessibilityLabel="Subject search and controls" style={{ gap: spacing.md }}><View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'flex-end', gap: spacing.md }}><View style={{ flex: 1 }}><SearchField value={query} onChangeText={setQuery} placeholder="Search subject, code, or lecturer" /></View><Button label="Refresh" variant="secondary" icon={<Ionicons accessibilityElementsHidden name="refresh-outline" size={sizing.iconSm} color={colors.primary} />} onPress={resource.retry} /></View><View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: spacing.md }}><View accessibilityRole="radiogroup" accessibilityLabel="Attendance status filters" style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{filters.map((option) => <Button key={option.value} label={option.label} variant={filter === option.value ? 'primary' : 'secondary'} accessibilityRole="radio" accessibilityState={{ checked: filter === option.value }} onPress={() => setFilter(option.value)} />)}</View><Button label={`Sort: ${sort === 'name' ? 'Subject name' : 'Attendance'}`} variant="text" onPress={() => setSort((current) => current === 'name' ? 'attendance' : 'name')} /></View></View>
      {state === 'offline' ? <AlertBanner title="You are offline" message="Showing enrolled subjects already available on this device." tone="warning" /> : null}
      {resource.loading || state === 'loading' ? <SubjectsSkeleton /> : null}
      {state === 'error' || resource.error ? <StateView state={resource.error?.code === 'NETWORK_ERROR' ? 'offline' : 'error'} title="Subjects unavailable" message={resource.error?.message ?? 'Your subjects could not be loaded.'} onRetry={retry} /> : null}
      {!resource.loading && state !== 'loading' && state !== 'error' && !resource.error ? source.length ? subjects.length ? <><Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{subjects.length} of {source.length} subjects</Text><Card style={{ paddingVertical: spacing.sm }}>{subjects.map((item, index) => <SubjectAttendanceRow key={item.id} item={item} pinned={pinnedSubjectIds.includes(item.id)} onTogglePin={() => togglePinnedSubject(item.id)} last={index === subjects.length - 1} />)}</Card></> : <View style={{ gap: spacing.md }}><StateView state="empty" title="No matching subjects" message={`No subjects match '${query.trim() || filters.find((item) => item.value === filter)?.label}'.`} /><Button label="Clear search" variant="secondary" onPress={clear} /></View> : <StateView state="empty" title="No subjects available" message="Your enrolled subjects will appear here when they are assigned." /> : null}
    </PageContainer>
  </StudentShell>;
}
