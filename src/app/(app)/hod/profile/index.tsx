import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { AlertBanner } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerPageSkeleton, HodShell, ResourceState, SectionHeading } from '@/hod/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { DetailRow, ProfileIdentity, RoleSummary, TeachingRow } from '@/hod/profile-components';
import { useHodProfile } from '@/hod/profile-provider';
import { useResource } from '@/lecturer/use-resource';
import { hodAccessFor } from '@/hod/access';

export default function LecturerProfile() {
  const { colors } = useRollCallTheme();
  const { session } = useAuth();
  const { profile, loading: profileLoading } = useHodProfile();
  const { saved, state } = useLocalSearchParams<{ saved?: string; state?: 'loading' | 'error' }>();
  const token = session?.token ?? '';
  const access = hodAccessFor(session?.user);
  const classes = useResource(() => lecturerClient.classes(token), [token]);
  const loading = profileLoading || classes.loading || state === 'loading';
  const institution = session?.user.college?.name ?? 'Institution not assigned';
  const employeeId = `FAC-${session?.user.id.slice(0, 6).toUpperCase() ?? '000000'}`;

  const classTeacherClass = classes.data?.find((item) => item.subjectCode === access.classTeacherSubjectCode);

  return <HodShell activeKey="profile" title="Profile" subtitle="HOD account">
    <PageContainer width="detail">
      {loading ? <LecturerPageSkeleton rows={4} /> : null}
      {!loading && state === 'error' ? <StateView state="error" message="Your profile could not be loaded." onRetry={() => router.replace('/hod/profile' as Href)} /> : null}
      {!loading && !state && classes.error ? <ResourceState loading={false} error={classes.error} retry={classes.retry} /> : null}
      {!loading && !state && !classes.error ? <>
        {saved === '1' ? <AlertBanner title="Profile saved" message="Your profile changes are now visible." tone="success" /> : null}
        <ProfileIdentity name={profile.displayName} designation="Head of Department" department="Computer Science and Engineering" onEdit={() => router.push('/hod/profile/edit' as Href)} />

        <View style={{ gap: spacing.sm }}><SectionHeading title="Institution details" /><View style={{ borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
          <DetailRow label="College" value={institution} />
          <DetailRow label="Employee ID" value={employeeId} />
          <DetailRow label="Institutional email" value={session?.user.loginIdentifier ?? 'Not available'} />
          <DetailRow label="Phone" value={profile.phone || 'Not added'} last />
        </View></View>

        <View style={{ gap: spacing.sm }}><SectionHeading title="Role information" /><RoleSummary classTeacherOf={access.isClassTeacher ? classTeacherClass?.batchName : undefined} /></View>

        <View style={{ gap: spacing.sm }}><SectionHeading title="Assigned teaching" />
          {classes.data?.length ? <View style={{ borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>{classes.data.map((item, index) => <TeachingRow key={item.id} item={item} last={index === classes.data!.length - 1} />)}</View> : <Text style={[typography.body, { color: colors.textSecondary }]}>No teaching assignments are available.</Text>}
        </View>
      </> : null}
    </PageContainer>
  </HodShell>;
}
