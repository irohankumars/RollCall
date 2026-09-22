import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { useResource } from '@/lecturer/use-resource';
import { SessionMetadata, StudentSessionHeader } from '@/student/attendance-components';
import { studentClient } from '@/student/student-data';
import { StudentShell } from '@/student/shell';
import { useStudentFinal } from '@/student/final-provider';

export default function StudentAttendanceSessionDetails() {
  const { colors } = useRollCallTheme();
  const { sessionId = '' } = useLocalSearchParams<{ sessionId: string }>();
  const { recordRecent } = useStudentFinal();
  const resource = useResource(() => studentClient.attendanceSession(sessionId), [sessionId]);
  const session = resource.data;
  useEffect(() => { if (session) recordRecent({ id: session.id, kind: 'ATTENDANCE', title: session.subject, detail: `${session.date} · ${session.attendance}`, href: `/student/attendance/session/${session.id}` }); }, [recordRecent, session]);

  return <StudentShell activeKey="attendance" title="Session Details" subtitle="Your recorded attendance" back backFallback={'/student/attendance/history' as Href}>
    <PageContainer width="compact" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
      {resource.loading ? <StateView state="loading" /> : null}
      {resource.error ? <StateView state="error" message={resource.error.message} onRetry={resource.retry} /> : null}
      {!resource.loading && !resource.error && !session ? <StateView state="empty" title="Session not found" message="This attendance session is not available in your records." /> : null}
      {session ? <>
        <Card><StudentSessionHeader session={session} /></Card>
        <AlertBanner title="Read-only attendance record" message="Only your attendance result and this session's general information are shown. Contact your lecturer if something is incorrect." tone="info" />
        <View style={{ gap: spacing.sm }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>Session information</Text><SessionMetadata session={session} /></View>
        <Button label="Report Attendance Issue" onPress={() => router.push(`/student/attendance/report?sessionId=${session.id}` as Href)} />
      </> : null}
    </PageContainer>
  </StudentShell>;
}
