import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { StateView } from '@/design-system/components/states';
import { breakpoints, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { HodShell, SectionHeading } from '@/hod/components';
import { AttendanceAction, ClassAttendanceSummary, ClassDetailHeader, ClassInformation, DetailPageSkeleton, RecentSessionRow, StudentAccessRow } from '@/hod/detail-components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';

export default function ClassDetails() {
  const { colors } = useRollCallTheme();
  const { width } = useResponsive();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { session } = useAuth();
  const token = session?.token ?? '';
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const rosterResource = useResource(() => lecturerClient.roster(token, classId), [token, classId]);
  const historyResource = useResource(() => lecturerClient.history(token), [token]);
  const item = classResource.data;
  const roster = rosterResource.data ?? [];
  const sessions = (historyResource.data ?? []).filter((entry) => entry.classId === classId && entry.status === 'COMPLETED');
  const attendanceTotal = sessions.reduce((total, entry) => total + entry.total, 0);
  const attendancePresent = sessions.reduce((total, entry) => total + entry.present, 0);
  const attendancePercentage = attendanceTotal ? Math.round(attendancePresent * 100 / attendanceTotal) : null;
  const isWide = width >= breakpoints.wide;
  const loading = classResource.loading || rosterResource.loading || historyResource.loading;

  const information = item ? <View style={{ gap: spacing.sm }}><SectionHeading title="Class information" /><ClassInformation item={item} /></View> : null;
  const attendance = item ? <View style={{ gap: spacing.md }}><SectionHeading title="Attendance summary" /><ClassAttendanceSummary percentage={attendancePercentage} students={roster.length} completedSessions={sessions.length} /><AttendanceAction classId={classId} /></View> : null;
  const students = item ? <View style={{ gap: spacing.sm }}><SectionHeading title="Students" /><StudentAccessRow classId={classId} count={roster.length} />{roster.length === 0 ? <Text style={[typography.bodySmall, { color: colors.textMuted }]}>No students are currently assigned to this class.</Text> : null}</View> : null;
  const recent = <View style={{ gap: spacing.sm }}><SectionHeading title="Recent sessions" />{historyResource.error ? <StateView state={historyResource.error.code === 'NETWORK_ERROR' ? 'offline' : 'error'} message={historyResource.error.message} onRetry={historyResource.retry} /> : sessions.length ? sessions.slice(0, 5).map((entry) => <RecentSessionRow key={entry.id} item={entry} />) : <StateView state="empty" title="No session history" message="Completed attendance sessions will appear here." />}</View>;

  return <HodShell activeKey="classes" title="Class details" subtitle={item ? `${item.subjectCode} · ${item.batchName}` : undefined} back backFallback="/hod/classes">
    <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
      {loading ? <DetailPageSkeleton /> : null}
      {!loading && classResource.error ? <StateView state={classResource.error.status === 404 ? 'empty' : classResource.error.code === 'NETWORK_ERROR' ? 'offline' : 'error'} title={classResource.error.status === 404 ? 'Class not found' : undefined} message={classResource.error.message} onRetry={classResource.retry} /> : null}
      {!loading && !classResource.error && rosterResource.error ? <StateView state={rosterResource.error.code === 'NETWORK_ERROR' ? 'offline' : 'error'} message={rosterResource.error.message} onRetry={rosterResource.retry} /> : null}
      {!loading && item && !rosterResource.error ? <>
        <ClassDetailHeader item={item} />
        {isWide ? <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.giant }}>
          <View style={{ flex: 1, gap: spacing.xxl }}>{information}{recent}</View>
          <View style={{ width: 344, gap: spacing.xxl }}>{attendance}{students}</View>
        </View> : <View style={{ gap: spacing.xxl }}>{information}{attendance}{students}{recent}</View>}
      </> : null}
    </PageContainer>
  </HodShell>;
}
