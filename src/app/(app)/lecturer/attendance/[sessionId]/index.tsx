import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Badge } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { AttendanceSummary, type AttendanceMethod } from '@/lecturer/attendance-flow-components';
import { DetailPageSkeleton } from '@/lecturer/detail-components';
import { HistoricalAttendanceRow, SessionAttendanceFilterControl, type SessionAttendanceFilter } from '@/lecturer/history-components';
import { LecturerShell, ResourceState, SectionHeading } from '@/lecturer/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import type { AttendanceMark, AttendanceSession } from '@/lecturer/types';
import { useResource } from '@/lecturer/use-resource';

function SessionMetadata({ item, lecturerName }: { item: AttendanceSession; lecturerName: string }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const date = new Date(item.scheduledAt);
  const fields = [
    { label: 'Date', value: date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) },
    { label: 'Time', value: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) },
    { label: 'Lecturer', value: lecturerName },
    { label: 'Method', value: item.method === 'FACE' ? 'Face recognition' : 'Manual attendance' },
  ];
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle }}>{fields.map((field) => <View key={field.label} style={{ width: isCompact ? '50%' : '25%', minHeight: 76, paddingVertical: spacing.md, paddingRight: spacing.md, justifyContent: 'center', gap: spacing.xs }}><Text style={[typography.caption, { color: colors.textMuted }]}>{field.label}</Text><Text style={[typography.body, { color: colors.textPrimary }]}>{field.value}</Text></View>)}</View>;
}

function SessionDetailContent({ item, lecturerName }: { item: AttendanceSession; lecturerName: string }) {
  const { colors } = useRollCallTheme(); const [filter, setFilter] = useState<SessionAttendanceFilter>('ALL');
  const visible = item.students.filter((student) => filter === 'ALL' || item.records[student.id] === filter);
  return <PageContainer width="standard">
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.lg }}><View style={{ flex: 1, gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.subjectName}</Text><Text style={[typography.subheading, { color: colors.textSecondary }]}>{item.subjectCode} · {item.batchName}</Text></View><Badge label="Completed" tone="success" /></View>
    </View>
    <SessionMetadata item={item} lecturerName={lecturerName} />
    <View style={{ paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}><AttendanceSummary present={item.present} absent={item.absent} total={item.total} /></View>
    <View style={{ gap: spacing.sm }}><SectionHeading title="Students" /><SessionAttendanceFilterControl value={filter} onChange={setFilter} /><Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{visible.length} of {item.students.length} students</Text></View>
    {item.students.length ? <View>{visible.map((student) => <HistoricalAttendanceRow key={student.id} item={student} status={item.records[student.id] ?? 'ABSENT'} />)}{!visible.length ? <StateView state="empty" title="No matching students" message="Choose another attendance filter." /> : null}</View> : <StateView state="empty" title="No students in this session" message="This historical record does not contain student attendance rows." />}
  </PageContainer>;
}

function LocalSessionDetail({ classId, present, confirmedAt, method }: { classId: string; present?: string; confirmedAt?: string; method: AttendanceMethod }) {
  const { session } = useAuth(); const token = session?.token ?? '';
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const rosterResource = useResource(() => lecturerClient.roster(token, classId), [token, classId]);
  const loading = classResource.loading || rosterResource.loading; const students = useMemo(() => rosterResource.data ?? [], [rosterResource.data]);
  const item = useMemo<AttendanceSession | undefined>(() => {
    if (!classResource.data) return undefined; const presentIds = new Set((present ?? '').split(',').filter(Boolean)); const records = Object.fromEntries(students.map((student) => [student.id, presentIds.has(student.id) ? 'PRESENT' : 'ABSENT'])) as Record<string, AttendanceMark>; const scheduledAt = confirmedAt ?? new Date().toISOString(); const presentCount = students.filter((student) => records[student.id] === 'PRESENT').length;
    return { id: `demo-${classId}`, classId, subjectCode: classResource.data.subjectCode, subjectName: classResource.data.subjectName, batchName: classResource.data.batchName, method, status: 'COMPLETED', scheduledAt, submittedAt: scheduledAt, correctedAt: null, present: presentCount, absent: students.length - presentCount, total: students.length, records, students };
  }, [classId, classResource.data, confirmedAt, method, present, students]);
  if (loading) return <PageContainer width="standard"><DetailPageSkeleton rows={7} /></PageContainer>;
  if (classResource.error?.status === 404) return <PageContainer width="standard"><StateView state="error" title="Session not found" message="This local attendance session is no longer available." /></PageContainer>;
  if (classResource.error) return <PageContainer width="standard"><ResourceState loading={false} error={classResource.error} retry={classResource.retry} /></PageContainer>;
  if (rosterResource.error) return <PageContainer width="standard"><ResourceState loading={false} error={rosterResource.error} retry={rosterResource.retry} /></PageContainer>;
  return item ? <SessionDetailContent item={item} lecturerName={session?.user.name ?? 'Lecturer'} /> : <PageContainer width="standard"><StateView state="error" title="Session not found" message="This local attendance session is unavailable." /></PageContainer>;
}

function SavedSessionDetail({ sessionId }: { sessionId: string }) {
  const { session } = useAuth(); const token = session?.token ?? '';
  const resource = useResource(() => lecturerClient.session(token, sessionId), [token, sessionId]);
  if (resource.loading) return <PageContainer width="standard"><DetailPageSkeleton rows={7} /></PageContainer>;
  if (resource.error?.status === 404) return <PageContainer width="standard"><StateView state="error" title="Session not found" message="The requested attendance session could not be found." /></PageContainer>;
  if (resource.error) return <PageContainer width="standard"><ResourceState loading={false} error={resource.error} retry={resource.retry} /></PageContainer>;
  return resource.data ? <SessionDetailContent item={resource.data} lecturerName={session?.user.name ?? 'Lecturer'} /> : <PageContainer width="standard"><StateView state="error" title="Session not found" message="The requested attendance session could not be found." /></PageContainer>;
}

export default function SessionDetail() {
  const { sessionId = '', classId, present, confirmedAt, method = 'FACE' } = useLocalSearchParams<{ sessionId: string; classId?: string; present?: string; confirmedAt?: string; method?: AttendanceMethod }>();
  return <LecturerShell activeKey="history" title="Session detail" back backFallback="/lecturer/history">
    {classId ? <LocalSessionDetail classId={classId} present={present} confirmedAt={confirmedAt} method={method} /> : <SavedSessionDetail sessionId={sessionId} />}
  </LecturerShell>;
}
