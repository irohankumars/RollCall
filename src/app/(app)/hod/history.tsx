import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/auth-provider';
import { BottomSheet } from '@/design-system/components/feedback';
import { SelectField } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { type AttendanceMethod } from '@/lecturer/attendance-flow-components';
import { LecturerPageSkeleton, HodShell, ResourceState, SectionHeading } from '@/hod/components';
import { HistoryRangeControl, HistorySessionRow, type HistoryRange } from '@/lecturer/history-components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import type { SessionSummary } from '@/lecturer/types';
import { useResource } from '@/lecturer/use-resource';

function inRange(value: string, range: HistoryRange) {
  if (range === 'ALL') return true;
  const date = new Date(value); const now = new Date();
  if (range === 'TODAY') return date.toDateString() === now.toDateString();
  if (range === 'WEEK') { const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6); return date >= start; }
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function History() {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  const { demoSessionId, classId: demoClassId, present, confirmedAt, method = 'FACE' } = useLocalSearchParams<{ demoSessionId?: string; classId?: string; present?: string; confirmedAt?: string; method?: AttendanceMethod }>();
  const { session } = useAuth(); const token = session?.token ?? '';
  const historyResource = useResource(() => lecturerClient.history(token), [token]);
  const classesResource = useResource(() => lecturerClient.classes(token), [token]);
  const [classId, setClassId] = useState('ALL'); const [range, setRange] = useState<HistoryRange>('ALL'); const [classSheet, setClassSheet] = useState(false);
  const classes = useMemo(() => classesResource.data ?? [], [classesResource.data]);
  const allowedClassIds = useMemo(() => new Set(classes.map((item) => item.id)), [classes]);
  const localSession = useMemo<SessionSummary | undefined>(() => {
    const item = classes.find((entry) => entry.id === demoClassId); if (!demoSessionId || !item || !confirmedAt) return undefined;
    const presentCount = (present ?? '').split(',').filter(Boolean).length;
    return { id: demoSessionId, classId: item.id, subjectCode: item.subjectCode, subjectName: item.subjectName, batchName: item.batchName, method, status: 'COMPLETED', scheduledAt: confirmedAt, submittedAt: confirmedAt, correctedAt: null, present: presentCount, absent: Math.max(0, item.studentCount - presentCount), total: item.studentCount };
  }, [classes, confirmedAt, demoClassId, demoSessionId, method, present]);
  const sessions = useMemo(() => {
    const remote = (historyResource.data ?? []).filter((item) => item.status === 'COMPLETED' && allowedClassIds.has(item.classId));
    const all = localSession ? [localSession, ...remote.filter((item) => item.id !== localSession.id)] : remote;
    return all.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [allowedClassIds, historyResource.data, localSession]);
  const visible = sessions.filter((item) => (classId === 'ALL' || item.classId === classId) && inRange(item.scheduledAt, range));
  const selectedClass = classes.find((item) => item.id === classId);
  const loading = historyResource.loading || classesResource.loading;
  const chooseClass = (next: string) => { setClassId(next); setClassSheet(false); };
  const openSession = (item: SessionSummary) => {
    const query = item.id === demoSessionId ? `?classId=${encodeURIComponent(item.classId)}&present=${encodeURIComponent(present ?? '')}&confirmedAt=${encodeURIComponent(confirmedAt ?? item.scheduledAt)}&method=${encodeURIComponent(method)}` : '';
    router.push(`/hod/attendance/${item.id}${query}` as Href);
  };

  return <HodShell activeKey="history" title="Attendance history" subtitle="Completed sessions">
    <PageContainer width="standard">
      {loading ? <LecturerPageSkeleton rows={5} /> : null}
      {!loading && historyResource.error ? <ResourceState loading={false} error={historyResource.error} retry={historyResource.retry} /> : null}
      {!loading && !historyResource.error && classesResource.error ? <ResourceState loading={false} error={classesResource.error} retry={classesResource.retry} /> : null}
      {!loading && !historyResource.error && !classesResource.error ? <>
        <View style={{ gap: spacing.md }}><SectionHeading title="Session history" /><View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'flex-end', gap: spacing.lg }}><View style={{ flex: 1 }}><SelectField label="Class" value={selectedClass ? `${selectedClass.subjectCode} · ${selectedClass.batchName}` : 'All Classes'} onPress={() => setClassSheet(true)} /></View><View style={{ flex: 2, gap: spacing.sm }}><Text style={[typography.label, { color: colors.textPrimary }]}>Time range</Text><HistoryRangeControl value={range} onChange={setRange} /></View></View></View>
        {sessions.length ? <View style={{ gap: spacing.sm }}><Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{visible.length} completed session{visible.length === 1 ? '' : 's'}</Text>{visible.map((item) => <HistorySessionRow key={item.id} item={item} onPress={() => openSession(item)} />)}{!visible.length ? <StateView state="empty" title="No matching sessions" message="Choose another class or time range." /> : null}</View> : <StateView state="empty" title="No attendance history" message="Completed sessions will appear here." />}
      </> : null}
    </PageContainer>
    <BottomSheet visible={classSheet} title="Filter by class" onDismiss={() => setClassSheet(false)}>
      {[{ id: 'ALL', subjectCode: 'All Classes', batchName: 'Show every assigned class' }, ...classes].map((item) => { const selected = classId === item.id; return <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => chooseClass(item.id)} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed || selected ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.76 : 1 })}><View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.subjectCode}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.batchName}</Text></View>{selected ? <Ionicons accessibilityLabel="Selected" name="checkmark" size={sizing.iconMd} color={colors.primary} /> : null}</Pressable>; })}
    </BottomSheet>
  </HodShell>;
}
