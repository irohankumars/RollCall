import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { AlertBanner } from '@/design-system/components/feedback';
import { Card } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { breakpoints, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { AttendanceOverviewCard, StudentHomeSkeleton, SubjectAttendanceRow } from '@/student/components';
import { AttendanceActions } from '@/student/attendance-components';
import { studentClient } from '@/student/student-data';
import { StudentShell } from '@/student/shell';

export default function StudentAttendanceOverview() {
  const { colors } = useRollCallTheme(); const { width } = useResponsive(); const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'error' | 'offline' }>();
  const resource = useResource(studentClient.attendanceOverview, []); const data = resource.data; const subjects = state === 'empty' ? [] : data?.subjects ?? []; const wide = width >= breakpoints.wide;
  const retry = () => state ? router.replace('/student/attendance' as Href) : resource.retry();
  return <StudentShell activeKey="attendance" title="Attendance" subtitle="Your attendance overview"><PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
    <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Attendance Overview</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Your current standing across all enrolled subjects.</Text></View>
    {state === 'offline' ? <AlertBanner title="You are offline" message="Showing attendance information available on this device." tone="warning" /> : null}
    {resource.loading || state === 'loading' ? <StudentHomeSkeleton /> : null}
    {state === 'error' || resource.error ? <StateView state={resource.error?.code === 'NETWORK_ERROR' ? 'offline' : 'error'} title="Attendance unavailable" message={resource.error?.message ?? 'Your attendance overview could not be loaded.'} onRetry={retry} /> : null}
    {data && state !== 'loading' && state !== 'error' && !resource.error ? <><AttendanceOverviewCard summary={data.summary} /><View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'flex-start', gap: wide ? spacing.giant : spacing.xxl }}><View style={{ flex: 1, width: '100%', gap: spacing.sm }}><SectionHeading title="Subject attendance" />{subjects.length ? <Card style={{ paddingVertical: spacing.sm }}>{subjects.map((item, index) => <SubjectAttendanceRow key={item.id} item={item} last={index === subjects.length - 1} />)}</Card> : <StateView state="empty" title="No attendance records" message="Subject attendance will appear after your first recorded session." />}</View><View style={{ width: wide ? 344 : '100%', gap: spacing.sm }}><SectionHeading title="History and calendar" /><AttendanceActions /><Text style={[typography.bodySmall, { color: colors.textMuted }]}>Review individual sessions or browse attendance by date.</Text></View></View></> : null}
  </PageContainer></StudentShell>;
}
