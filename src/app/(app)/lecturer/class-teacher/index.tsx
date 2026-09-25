import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { ClassTeacherIdentity, DailyClassTotals, DailySessionRow } from '@/lecturer/class-teacher-components';
import { classTeacherDate, createDailySessions, loadClassTeacherWorkspace } from '@/lecturer/class-teacher-data';
import { LecturerPageSkeleton, LecturerShell, ResourceState, SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { lecturerAccessFor } from '@/lecturer/access';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

function familiarName(name?: string) {
  if (!name) return 'Lecturer';
  const parts = name.trim().split(/\s+/);
  return parts[0]?.toLowerCase().replace('.', '') === 'dr' ? parts.slice(0, 2).join(' ') : parts[0];
}

export default function ClassTeacherDashboard() {
  const { colors } = useRollCallTheme(); const { session } = useAuth(); const token = session?.token ?? '';
  const access = lecturerAccessFor(session?.user);
  const resource = useResource(() => loadClassTeacherWorkspace(token, access), [token, access.isClassTeacher, access.classTeacherSubjectCode]);
  const assignedClass = resource.data?.assignedClass; const students = resource.data?.students ?? [];
  const sessions = createDailySessions(students);

  return <LecturerShell activeKey="class-teacher" title="Class teacher" subtitle={classTeacherDate()}>
    <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
      {resource.loading ? <LecturerPageSkeleton rows={5} /> : null}
      {!resource.loading && resource.error ? <ResourceState loading={false} error={resource.error} retry={resource.retry} /> : null}
      {!resource.loading && !resource.error && !assignedClass ? <StateView state={access.isClassTeacher ? 'empty' : 'unauthorized'} title={access.isClassTeacher ? 'Assignment unavailable' : 'Class Teacher access required'} message={access.isClassTeacher ? 'Your Class Teacher assignment is not available in the current class list.' : 'This workspace is available only to lecturers assigned as Class Teacher.'} /> : null}
      {!resource.loading && !resource.error && assignedClass ? <>
        <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>{greeting()}, {familiarName(session?.user.name)}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Here is today&apos;s attendance status for your assigned class.</Text></View>
        <ClassTeacherIdentity item={assignedClass} />
        <View style={{ paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle, gap: spacing.lg }}><SectionHeading title="Today&apos;s attendance" /><DailyClassTotals sessions={sessions} /></View>
        <View style={{ gap: spacing.sm }}><SectionHeading title="Class schedule" />{sessions.map((item) => <DailySessionRow key={item.id} item={item} students={students} />)}</View>
        <AlertBanner title="Daily summary is ready" message="Attendance data is available for 4 of 5 classes. One class was not conducted, and the daily summary can still be prepared." tone="info" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}><Button label="Open class timetable" onPress={() => router.push('/lecturer/class-teacher/timetable' as Href)} /><Button label="View daily summary" variant="secondary" onPress={() => router.push('/lecturer/class-teacher/daily-summary' as Href)} /></View>
      </> : null}
    </PageContainer>
  </LecturerShell>;
}
