import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { AttendanceHistoryRow, AttendanceTrend, StudentAttendanceSummary } from '@/student/attendance-components';
import { studentClient } from '@/student/student-data';
import { StudentShell } from '@/student/shell';
import { useStudentFinal } from '@/student/final-provider';

export default function StudentSubjectAttendance() {
  const { colors } = useRollCallTheme(); const { recordRecent } = useStudentFinal(); const { subjectId } = useLocalSearchParams<{ subjectId: string }>(); const resource = useResource(() => studentClient.subjectAttendance(subjectId), [subjectId]); const item = resource.data;
  useEffect(() => { if (item) recordRecent({ id: item.id, kind: 'SUBJECT', title: item.name, detail: item.code, href: `/student/subjects/${item.id}` }); }, [item, recordRecent]);
  return <StudentShell activeKey="attendance" title={item?.name ?? 'Subject Attendance'} subtitle={item ? `${item.code} · ${item.lecturer}` : 'Attendance by subject'} back backFallback={'/student/attendance' as Href}><PageContainer width="standard" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
    {resource.loading ? <StateView state="loading" /> : null}
    {resource.error ? <StateView state="error" message={resource.error.message} onRetry={resource.retry} /> : null}
    {!resource.loading && !resource.error && !item ? <StateView state="empty" title="Subject not found" message="This subject is not available in your enrolled attendance records." /> : null}
    {item ? <><StudentAttendanceSummary item={item} /><View style={{ gap: spacing.sm }}><SectionHeading title="Attendance trend" /><AttendanceTrend sessions={item.recentSessions} /></View><View style={{ gap: spacing.sm }}><SectionHeading title="Recent sessions" action="View full history" onAction={() => router.push(`/student/attendance/history?subjectId=${item.id}` as Href)} />{item.recentSessions.length ? <Card style={{ paddingVertical: spacing.sm }}>{item.recentSessions.map((session, index) => <AttendanceHistoryRow key={session.id} item={session} last={index === item.recentSessions.length - 1} />)}</Card> : <StateView state="empty" title="No recorded sessions" message="Sessions will appear after attendance is recorded." />}</View><View style={{ gap: spacing.md }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>Actions</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}><Button label="View Full History" variant="secondary" onPress={() => router.push(`/student/attendance/history?subjectId=${item.id}` as Href)} /><Button label="Report Attendance Issue" onPress={() => router.push(`/student/attendance/report?subjectId=${item.id}` as Href)} /></View></View></> : null}
  </PageContainer></StudentShell>;
}
