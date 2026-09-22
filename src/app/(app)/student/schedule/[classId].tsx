import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { useResource } from '@/lecturer/use-resource';
import { MetadataList, ScheduleStatus } from '@/student/s3-components';
import { studentS3Client } from '@/student/s3-data';
import { StudentShell } from '@/student/shell';

export default function StudentScheduleClassDetails() {
  const { colors } = useRollCallTheme(); const { classId = '' } = useLocalSearchParams<{ classId: string }>(); const resource = useResource(() => studentS3Client.scheduleClass(classId), [classId]); const item = resource.data;
  const date = item ? new Date(`${item.date}T12:00:00`).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return <StudentShell activeKey="schedule" title="Class Details" subtitle={item?.subject ?? 'Academic schedule'} back backFallback={'/student/schedule' as Href}><PageContainer width="compact" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
    {resource.loading ? <StateView state="loading" /> : null}{resource.error ? <StateView state="error" message={resource.error.message} onRetry={resource.retry} /> : null}{!resource.loading && !resource.error && !item ? <StateView state="empty" title="Class unavailable" message="This scheduled class is no longer available." /> : null}
    {item ? <><Card><View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md }}><View style={{ flex: 1, minWidth: 220, gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.subject}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{item.code} · {item.lecturer}</Text></View><ScheduleStatus status={item.status} /></View><Text style={[typography.bodySmall, { color: colors.textMuted }]}>{date} · {item.startTime}–{item.endTime}</Text></Card><MetadataList rows={[{ label: 'Date', value: date }, { label: 'Start time', value: item.startTime }, { label: 'End time', value: item.endTime }, { label: 'Location', value: item.room ?? 'Room to be announced' }, { label: 'Academic information', value: item.academicInformation ?? 'Not provided' }]} /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}><Button label="View Attendance" onPress={() => router.push(`/student/attendance/history?subjectId=${item.subjectId}` as Href)} /><Button label="View Subject" variant="secondary" onPress={() => router.push(`/student/subjects/${item.subjectId}` as Href)} /></View></> : null}
  </PageContainer></StudentShell>;
}
