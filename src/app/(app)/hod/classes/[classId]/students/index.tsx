import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { SegmentedControl } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { ClassDetailHeader, DetailPageSkeleton, StudentRosterRow, StudentSearch } from '@/hod/detail-components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';

type StudentFilter = 'all' | 'attention';
const filterOptions = [{ label: 'All students', value: 'all' }, { label: 'Needs attention', value: 'attention' }] as const;

export default function Roster() {
  const { colors } = useRollCallTheme();
  const responsive = useResponsive();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { session } = useAuth();
  const token = session?.token ?? '';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StudentFilter>('all');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const rosterResource = useResource(() => lecturerClient.roster(token, classId), [token, classId]);
  const students = useMemo(() => (rosterResource.data ?? []).filter((student) => {
    const matchesQuery = `${student.name} ${student.rollNumber}`.toLowerCase().includes(deferredQuery);
    return matchesQuery && (filter === 'all' || student.attendanceStatus !== 'good');
  }), [deferredQuery, filter, rosterResource.data]);
  const loading = classResource.loading || rosterResource.loading;
  const filtering = Boolean(query.trim()) || filter !== 'all';
  const item = classResource.data;

  return <HodShell activeKey="classes" title="Students" subtitle={item ? `${item.subjectName} · ${item.batchName}` : undefined} back backFallback={`/hod/classes/${classId}` as Href}>
    {loading ? <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}><DetailPageSkeleton rows={5} /></PageContainer> : null}
    {!loading && classResource.error ? <PageContainer width="full"><StateView state={classResource.error.status === 404 ? 'empty' : classResource.error.code === 'NETWORK_ERROR' ? 'offline' : 'error'} title={classResource.error.status === 404 ? 'Class not found' : undefined} message={classResource.error.message} onRetry={classResource.retry} /></PageContainer> : null}
    {!loading && !classResource.error && rosterResource.error ? <PageContainer width="full"><StateView state={rosterResource.error.code === 'NETWORK_ERROR' ? 'offline' : 'error'} message={rosterResource.error.message} onRetry={rosterResource.retry} /></PageContainer> : null}
    {!loading && item && rosterResource.data ? <FlatList
      data={students}
      keyExtractor={(student) => student.id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ width: '100%', maxWidth: sizing.contentMax, alignSelf: 'center', paddingHorizontal: responsive.contentPadding, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.none }}
      ListHeaderComponent={<View style={{ gap: spacing.xl, marginBottom: spacing.lg }}>
        <ClassDetailHeader item={item} />
        <View accessibilityLabel="Student search and filters" style={{ flexDirection: responsive.isCompact ? 'column' : 'row', alignItems: responsive.isCompact ? 'stretch' : 'center', gap: spacing.md }}>
          <View style={{ flex: 1 }}><StudentSearch value={query} onChangeText={setQuery} /></View>
          <View style={{ width: responsive.isCompact ? '100%' : 320 }}><SegmentedControl value={filter} options={filterOptions} onChange={setFilter} /></View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.md }}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>Student roster</Text>
          <Text accessibilityLiveRegion="polite" style={[typography.bodySmall, { color: colors.textMuted }]}>{students.length} of {rosterResource.data.length}</Text>
        </View>
      </View>}
      ListEmptyComponent={<StateView state="empty" title={filtering ? 'No matching students' : 'No enrolled students'} message={filtering ? 'Try another name, student ID, or filter.' : 'No students are currently assigned to this class.'} />}
      renderItem={({ item: student }) => <StudentRosterRow item={student} classId={classId} />}
    /> : null}
  </HodShell>;
}
