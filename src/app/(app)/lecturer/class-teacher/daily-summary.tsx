import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { AttendanceSummary } from '@/lecturer/attendance-flow-components';
import { AlertBanner, BottomSheet } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { DailyClassTotals, DailyNotificationPreview, DailySessionRow, StudentDailyRow } from '@/lecturer/class-teacher-components';
import { classTeacherDate, createDailySessions, latestDailyMark, loadClassTeacherWorkspace } from '@/lecturer/class-teacher-data';
import { LecturerPageSkeleton, LecturerShell, ResourceState, SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { lecturerAccessFor } from '@/lecturer/access';

export default function DailyClassSummary() {
  const { colors } = useRollCallTheme(); const { session } = useAuth(); const token = session?.token ?? '';
  const access = lecturerAccessFor(session?.user);
  const [previewVisible, setPreviewVisible] = useState(false);
  const resource = useResource(() => loadClassTeacherWorkspace(token, access), [token, access.isClassTeacher, access.classTeacherSubjectCode]);
  const assignedClass = resource.data?.assignedClass; const students = resource.data?.students ?? [];
  const sessions = createDailySessions(students);
  const present = students.filter((student) => latestDailyMark(student.id, sessions) === 'PRESENT').length;
  const absent = Math.max(0, students.length - present);

  return <LecturerShell activeKey="class-teacher" title="Daily summary" subtitle={assignedClass ? `${assignedClass.batchName} · ${classTeacherDate()}` : classTeacherDate()} back backFallback="/lecturer/class-teacher">
    <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
      {resource.loading ? <LecturerPageSkeleton rows={6} /> : null}
      {!resource.loading && resource.error ? <ResourceState loading={false} error={resource.error} retry={resource.retry} /> : null}
      {!resource.loading && !resource.error && !assignedClass ? <StateView state={access.isClassTeacher ? 'empty' : 'unauthorized'} title={access.isClassTeacher ? 'No daily summary' : 'Class Teacher access required'} message={access.isClassTeacher ? 'The assigned class is not available in the current class list.' : 'Daily summaries are available only to lecturers assigned as Class Teacher.'} /> : null}
      {!resource.loading && !resource.error && assignedClass && !students.length ? <StateView state="empty" title="No enrolled students" message="Students assigned to this class will appear in the daily summary." /> : null}
      {!resource.loading && !resource.error && assignedClass && students.length ? <>
        <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{assignedClass.batchName}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{assignedClass.semester} · {classTeacherDate()}</Text></View>
        <View style={{ paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle, gap: spacing.lg }}><SectionHeading title="Attendance summary" /><AttendanceSummary present={present} absent={absent} total={students.length} /></View>
        <View style={{ gap: spacing.sm }}><SectionHeading title="Session status" /><DailyClassTotals sessions={sessions} />{sessions.map((item) => <DailySessionRow key={item.id} item={item} students={students} />)}</View>
        <AlertBanner title="Summary can be prepared" message="The not-conducted class is recorded separately and does not count as student absence." tone="info" />
        <View style={{ gap: spacing.sm }}><SectionHeading title="Student daily overview" />{students.map((student) => <StudentDailyRow key={student.id} student={student} sessions={sessions} />)}</View>
        <View style={{ gap: spacing.md }}><SectionHeading title="Notification preview" /><DailyNotificationPreview item={assignedClass} students={students} sessions={sessions} /><Button label="Prepare daily notification" onPress={() => setPreviewVisible(true)} /></View>
      </> : null}
    </PageContainer>
    {assignedClass ? <BottomSheet visible={previewVisible} title="Daily notification preview" onDismiss={() => setPreviewVisible(false)}><DailyNotificationPreview item={assignedClass} students={students} sessions={sessions} /><Button label="Close preview" variant="secondary" onPress={() => setPreviewVisible(false)} /></BottomSheet> : null}
  </LecturerShell>;
}
