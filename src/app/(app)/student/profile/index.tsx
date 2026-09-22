import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { AlertBanner } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { DetailRow, ProfileIdentity } from '@/lecturer/profile-components';
import { useStudentFinal } from '@/student/final-provider';
import { studentAcademicInfo } from '@/student/s3-data';
import { studentHomeData } from '@/student/student-data';
import { StudentShell } from '@/student/shell';

export default function StudentProfile() {
  const { colors } = useRollCallTheme(); const { session } = useAuth(); const { profile, loading } = useStudentFinal(); const { saved, state } = useLocalSearchParams<{ saved?: string; state?: 'error' }>();
  return <StudentShell activeKey="home" title="Profile" subtitle="Student identity" back><PageContainer width="detail">
    {loading ? <StateView state="loading" /> : null}{state === 'error' ? <StateView state="error" message="Your profile could not be loaded." onRetry={() => router.replace('/student/profile' as Href)} /> : null}
    {!loading && !state ? <>{saved === '1' ? <AlertBanner title="Profile saved" message="Your permitted profile changes are now visible." tone="success" /> : null}<ProfileIdentity name={profile.displayName} designation="Student" department={studentAcademicInfo.department} onEdit={() => router.push('/student/profile/edit' as Href)} /><View style={{ gap: spacing.sm }}><SectionHeading title="Student identity" /><View style={{ borderTopWidth: 1, borderTopColor: colors.borderSubtle }}><DetailRow label="Student ID" value={studentHomeData.student.rollNumber} /><DetailRow label="Department" value={studentAcademicInfo.department} /><DetailRow label="Programme" value={studentAcademicInfo.programme} /><DetailRow label="Semester" value={studentAcademicInfo.semester} /><DetailRow label="Batch" value={studentAcademicInfo.batch} last /></View></View><View style={{ gap: spacing.sm }}><SectionHeading title="Account information" /><View style={{ borderTopWidth: 1, borderTopColor: colors.borderSubtle }}><DetailRow label="Sign-in" value={session?.user.loginIdentifier ?? 'Not available'} /><DetailRow label="Phone" value={profile.phone || 'Not added'} last /></View><Text style={[typography.caption, { color: colors.textMuted }]}>Academic identity fields are managed by your institution and cannot be edited here.</Text></View></> : null}
  </PageContainer></StudentShell>;
}
