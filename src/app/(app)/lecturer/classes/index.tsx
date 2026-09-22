import { useDeferredValue, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/auth/auth-provider';
import { SegmentedControl } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { ClassSearch, LecturerClassRow, LecturerPageSkeleton, LecturerShell, ResourceState } from '@/lecturer/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';

type ClassFilter = 'all' | 'today';
const filterOptions = [{ label: 'All classes', value: 'all' }, { label: 'Today', value: 'today' }] as const;

function isToday(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

export default function Classes() {
  const { colors } = useRollCallTheme();
  const { isCompact } = useResponsive();
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ClassFilter>('all');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const token = session?.token ?? '';
  const resource = useResource(() => lecturerClient.classes(token), [token]);
  const rows = useMemo(() => (resource.data ?? []).filter((item) => {
    const matchesQuery = `${item.subjectCode} ${item.subjectName} ${item.batchName} ${item.semester}`.toLowerCase().includes(deferredQuery);
    return matchesQuery && (filter === 'all' || isToday(item.nextSessionAt));
  }), [deferredQuery, filter, resource.data]);
  const filtering = Boolean(query.trim()) || filter !== 'all';

  return <LecturerShell activeKey="classes" title="Classes" subtitle="Assigned subjects only">
    <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
      <View style={{ gap: spacing.xs }}>
        <Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Your classes</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{resource.data ? `${resource.data.length} assigned ${resource.data.length === 1 ? 'class' : 'classes'}` : 'Subjects and teaching groups assigned to you.'}</Text>
      </View>

      <View accessibilityLabel="Class search and filters" style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: spacing.md }}>
        <View style={{ flex: 1 }}><ClassSearch value={query} onChangeText={setQuery} /></View>
        <View style={{ width: isCompact ? '100%' : 264 }}><SegmentedControl value={filter} options={filterOptions} onChange={setFilter} /></View>
      </View>

      {resource.loading ? <LecturerPageSkeleton rows={4} /> : null}
      <ResourceState loading={false} error={resource.error} retry={resource.retry} />
      {resource.data ? rows.length ? <View accessibilityLabel={`${rows.length} classes`}>
        {rows.map((item) => <LecturerClassRow key={item.id} item={item} />)}
      </View> : <StateView state="empty" title={filtering ? 'No matching classes' : 'No assigned classes'} message={filtering ? 'Try another search or choose All classes.' : 'Your assigned subjects will appear here.'} /> : null}
    </PageContainer>
  </LecturerShell>;
}
