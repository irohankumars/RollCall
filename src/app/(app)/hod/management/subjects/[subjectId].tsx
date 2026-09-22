import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { ManagementRow, RelationshipSection } from '@/hod/management-components';
import { useHodManagement } from '@/hod/management-provider';

export default function SubjectDetail() {
  const { colors } = useRollCallTheme(); const { subjectId } = useLocalSearchParams<{ subjectId: string }>(); const data = useHodManagement(); const subject = data.subjects.find((item) => item.id === subjectId);
  if (!subject) return <HodShell activeKey="department" title="Subject" back><PageContainer><StateView state="empty" title="Subject not found" /></PageContainer></HodShell>;
  const semester = data.semesters.find((item) => item.id === subject.semesterId); const year = data.academicYears.find((item) => item.id === subject.academicYearId); const batch = data.batches.find((item) => item.id === subject.batchId); const assignments = data.assignments.filter((item) => item.subjectId === subject.id && item.active);
  return <HodShell activeKey="department" title="Subject details" subtitle={subject.code} back backFallback="/hod/management/subjects"><PageContainer width="detail"><View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>{subject.name}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{subject.code} · {subject.credits} credits</Text></View><Button label={assignments.length ? 'Change lecturer' : 'Assign lecturer'} onPress={() => router.push(`/hod/management/assignments?subject=${subject.id}` as Href)} style={{ alignSelf: 'flex-start' }} /><RelationshipSection title="Academic context"><ManagementRow title={year?.name ?? 'Academic year'} detail={`${data.department.name} · ${semester?.name}`} meta={batch?.name} /></RelationshipSection><RelationshipSection title="Teaching coverage">{assignments.length ? assignments.map((assignment) => { const lecturer = data.lecturers.find((item) => item.id === assignment.lecturerId); const section = data.sections.find((item) => item.id === assignment.sectionId); return <ManagementRow key={assignment.id} title={section?.name ?? 'Class'} detail={lecturer?.name ?? 'Lecturer'} status="Assigned" onPress={() => router.push(`/hod/management/classes/${section?.id}` as Href)} />; }) : <ManagementRow title="Lecturer not assigned" detail="Add teaching coverage for a class or section." status="Unassigned" onPress={() => router.push(`/hod/management/assignments?subject=${subject.id}` as Href)} />}</RelationshipSection></PageContainer></HodShell>;
}
