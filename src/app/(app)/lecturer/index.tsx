import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { StateView } from '@/design-system/components/states';
import { breakpoints, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { ActivityRow, LecturerPageSkeleton, LecturerShell, NextClassPanel, ResourceState, SectionHeading, TodayClassRow } from '@/lecturer/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

function familiarName(name?: string) {
  if (!name) return 'Lecturer';
  const parts = name.trim().split(/\s+/);
  return parts[0]?.toLowerCase().replace('.', '') === 'dr' ? parts.slice(0, 2).join(' ') : parts[0];
}

export default function LecturerHome() {
  const { colors } = useRollCallTheme();
  const { width } = useResponsive();
  const { session } = useAuth();
  const token = session?.token ?? '';
  const resource = useResource(() => lecturerClient.overview(token), [token]);
  const date = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const isWide = width >= breakpoints.wide;

  return <LecturerShell activeKey="today" title="Today" subtitle={date}>
    <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
      {resource.loading ? <LecturerPageSkeleton /> : null}
      <ResourceState loading={false} error={resource.error} retry={resource.retry} />
      {resource.data ? <>
        <View style={{ gap: spacing.xs }}>
          <Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>{greeting()}, {familiarName(session?.user.name)}</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{resource.data.today.length === 0 ? 'Your schedule is clear today.' : resource.data.today.length === 1 ? 'You have one class scheduled today.' : `You have ${resource.data.today.length} classes scheduled today.`}</Text>
        </View>

        {resource.data.upcoming[0] ? <View style={{ gap: spacing.sm }}>
          <SectionHeading title="Next class" />
          <NextClassPanel item={resource.data.upcoming[0]} />
        </View> : null}

        <View style={{ flexDirection: isWide ? 'row' : 'column', alignItems: 'flex-start', gap: isWide ? spacing.giant : spacing.xxl }}>
          <View style={{ flex: 1, width: '100%', gap: spacing.sm }}>
            <SectionHeading title="Today's schedule" action="All classes" onAction={() => router.push('/lecturer/classes' as Href)} />
            {resource.data.today.length ? resource.data.today.map((item) => <TodayClassRow key={item.id} item={item} />) : <StateView state="empty" title="No classes today" message="You have no assigned classes scheduled for today." />}
          </View>

          <View style={{ width: isWide ? 344 : '100%', gap: spacing.sm }}>
            <SectionHeading title="Recent activity" action="History" onAction={() => router.push('/lecturer/history' as Href)} />
            {resource.data.recentSessions.length ? resource.data.recentSessions.slice(0, 4).map((item) => <ActivityRow key={item.id} item={item} />) : <Text style={[typography.bodySmall, { color: colors.textMuted, paddingVertical: spacing.lg }]}>Completed attendance sessions will appear here.</Text>}
          </View>
        </View>
      </> : null}
    </PageContainer>
  </LecturerShell>;
}
