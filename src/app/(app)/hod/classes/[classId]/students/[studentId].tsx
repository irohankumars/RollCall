import { Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/auth/auth-provider';
import { AttendanceStatusIndicator } from '@/design-system/components/attendance';
import { Avatar, Badge, Button, Statistic } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { DetailPageSkeleton } from '@/hod/detail-components';
import { HodShell, ResourceState, SectionHeading } from '@/hod/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';
import { useGlobalOverlays } from '@/shell/overlay-provider';

function attendanceDate(value: string) {
  return new Date(value).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function StudentDetail() {
  const { colors } = useRollCallTheme();
  const { classId = '', studentId = '' } = useLocalSearchParams<{ classId: string; studentId: string }>();
  const { session } = useAuth();
  const overlays = useGlobalOverlays();
  const token = session?.token ?? '';
  const studentResource = useResource(() => lecturerClient.student(token, classId, studentId), [token, classId, studentId]);
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const item = studentResource.data;
  const classItem = classResource.data;
  const total = item ? item.presentCount + item.absentCount : 0;
  const statusColor = item?.attendanceStatus === 'good' ? colors.success : item?.attendanceStatus === 'warning' ? colors.warning : colors.error;
  const statusSurface = item?.attendanceStatus === 'good' ? colors.successSurface : item?.attendanceStatus === 'warning' ? colors.warningSurface : colors.errorSurface;
  const loading = studentResource.loading || classResource.loading;
  const notFound = studentResource.error?.status === 404;

  return <HodShell activeKey="classes" title="Student" subtitle={item?.rollNumber} back backFallback={`/hod/classes/${classId}/students` as Href}>
    <PageContainer width="detail">
      {loading ? <DetailPageSkeleton rows={4} /> : null}
      {!loading && notFound ? <StateView state="error" title="Student not found" message="This student is not enrolled in the selected class, or the record is no longer available." /> : null}
      {!loading && !notFound && studentResource.error ? <ResourceState loading={false} error={studentResource.error} retry={studentResource.retry} /> : null}
      {!loading && !studentResource.error && classResource.error ? <ResourceState loading={false} error={classResource.error} retry={classResource.retry} /> : null}
      {!loading && item && classItem ? <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <Avatar name={item.name} size="large" />
          <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
            <Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
              <Text selectable style={[typography.numeric, { color: colors.textSecondary }]}>{item.rollNumber}</Text>
              <Button label="Copy ID" variant="text" onPress={async () => { await Clipboard.setStringAsync(item.rollNumber); overlays.showToast('Student ID copied'); }} />
            </View>
            <Text style={[typography.bodySmall, { color: colors.textMuted }]}>{classItem.batchName} · {classItem.subjectName}</Text>
          </View>
        </View>

        <View accessibilityLabel={total ? `${item.attendancePercentage} percent attendance` : 'No attendance recorded'} style={{ paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.lg, flexWrap: 'wrap' }}>
            <View style={{ gap: spacing.xs }}>
              <Text selectable style={[typography.percentage, { color: total ? colors.textPrimary : colors.textMuted }]}>{total ? `${item.attendancePercentage}%` : 'N/A'}</Text>
              <Text style={[typography.label, { color: colors.textSecondary }]}>Attendance</Text>
            </View>
            {total ? <AttendanceStatusIndicator status={item.attendanceStatus} /> : <Badge label="No attendance" tone="neutral" />}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.giant, flexWrap: 'wrap' }}>
            <Statistic value={String(item.presentCount)} label="Present" />
            <Statistic value={String(item.absentCount)} label="Absent" />
            <Statistic value={String(total)} label="Sessions" />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeading title="Attendance status" />
          <View style={{ minHeight: 56, borderRadius: radii.md, backgroundColor: total ? statusSurface : colors.surfaceSecondary, padding: spacing.lg, justifyContent: 'center', gap: spacing.xs }}>
            <Text style={[typography.subheading, { color: total ? statusColor : colors.textPrimary }]}>{total ? (item.attendanceStatus === 'good' ? 'Good standing' : item.attendanceStatus === 'warning' ? 'Needs attention' : 'Below minimum') : 'Not available yet'}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{total ? `${item.presentCount} of ${total} completed sessions attended.` : 'Attendance status will appear after the first completed session.'}</Text>
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeading title="Recent attendance" />
          {item.history.length ? item.history.slice(0, 5).map((entry) => <View key={entry.sessionId} accessibilityLabel={`${attendanceDate(entry.date)}, ${entry.status === 'PRESENT' ? 'Present' : 'Absent'}`} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
            <Text style={[typography.numeric, { color: colors.textPrimary }]}>{attendanceDate(entry.date)}</Text>
            <Badge label={entry.status === 'PRESENT' ? 'Present' : 'Absent'} tone={entry.status === 'PRESENT' ? 'success' : 'error'} />
          </View>) : <StateView state="empty" title="No attendance yet" message="Completed attendance records for this class will appear here." />}
        </View>

        <Button label="View history" variant="secondary" accessibilityHint="Opens the existing attendance history" onPress={() => router.push('/hod/history' as Href)} />
      </> : null}
    </PageContainer>
  </HodShell>;
}
