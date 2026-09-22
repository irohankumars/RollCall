import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Button, Card, Statistic } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { breakpoints, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { AttendanceOverviewCard, DailySummary, NextClassCard, RecentActivityRow, StudentHomeSkeleton, StudentIdentity, StudentQuickActions, SubjectAttendanceRow, TodaySchedule } from '@/student/components';
import { studentClient } from '@/student/student-data';
import { StudentShell } from '@/student/shell';
import { useStudentFinal } from '@/student/final-provider';
import { useStudentNotifications } from '@/student/notification-provider';
import { studentAcademicInfo } from '@/student/s3-data';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

export default function StudentHome() {
  const { colors } = useRollCallTheme(); const { width } = useResponsive(); const { session } = useAuth();
  const { profile, pinnedSubjectIds, recentItems, dismissedImportantIds, dismissImportant } = useStudentFinal(); const { notifications } = useStudentNotifications();
  const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'no-attendance' | 'error' | 'offline' }>();
  const resource = useResource(studentClient.home, []); const isWide = width >= breakpoints.wide;
  const data = resource.data ? { ...resource.data, student: { ...resource.data.student, name: profile.displayName || session?.user.name || resource.data.student.name }, subjects: [...resource.data.subjects].sort((a, b) => Number(pinnedSubjectIds.includes(b.id)) - Number(pinnedSubjectIds.includes(a.id))), today: state === 'empty' ? [] : resource.data.today, attendance: state === 'no-attendance' ? undefined : resource.data.attendance } : undefined;
  const nextClass = data?.today.find((item) => item.status === 'upcoming');
  const currentClass = data?.today.find((item) => item.status === 'current'); const important = notifications.find((item) => item.priority === 'HIGH' && !dismissedImportantIds.includes(item.id));
  const date = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const retry = () => { if (state) router.replace('/student' as Href); else resource.retry(); };

  return <StudentShell activeKey="home" title="Today" subtitle={date}>
    <PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
      {resource.loading || state === 'loading' ? <StudentHomeSkeleton /> : null}
      {state === 'error' || resource.error ? <StateView state={resource.error?.code === 'NETWORK_ERROR' ? 'offline' : 'error'} title="Student home unavailable" message={resource.error?.message ?? 'Your student overview could not be loaded.'} onRetry={retry} /> : null}
      {data && state !== 'loading' && state !== 'error' && !resource.error ? <>
        {state === 'offline' ? <AlertBanner title="You are offline" message="Showing the latest student information available on this device." tone="warning" /> : null}
        {important ? <AlertBanner title={important.title} message={important.preview} tone="warning" action={<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}><Button label={important.actionLabel ?? 'View'} variant="text" onPress={() => important.destination && router.push(important.destination as Href)} /><Button label="Dismiss" variant="text" onPress={() => dismissImportant(important.id)} /></View>} /> : null}
        <View style={{ flexDirection: width >= 600 ? 'row' : 'column', alignItems: width >= 600 ? 'center' : 'stretch', justifyContent: 'space-between', gap: spacing.lg }}><View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>{greeting()}, {data.student.name.split(' ')[0]}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Here is your attendance and academic day at a glance.</Text></View><View style={{ minWidth: 220 }}><StudentIdentity student={data.student} compact /></View></View>

        <View style={{ flexDirection: isWide ? 'row' : 'column', alignItems: 'stretch', gap: spacing.xl }}><View style={{ flex: 1 }}>{data.attendance ? <AttendanceOverviewCard summary={data.attendance} /> : <StateView state="empty" title="Attendance not available yet" message="Your schedule is available while attendance information is being prepared." />}</View>{currentClass || nextClass ? <View style={{ width: isWide ? 344 : '100%', gap: spacing.sm }}><Text style={[typography.label, { color: currentClass ? colors.success : colors.primary }]}>{currentClass ? 'Class in progress' : `Next class at ${nextClass?.time}`}</Text><NextClassCard item={currentClass ?? nextClass!} /></View> : null}</View>

        <View style={{ gap: spacing.sm }}><SectionHeading title="Academic progress" action="View academic information" onAction={() => router.push('/student/academic' as Href)} /><Card><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.xl }}><Statistic value={studentAcademicInfo.semester} label="Current semester" /><Statistic value={String(data.subjects.length)} label="Active subjects" /><Statistic value={`${data.attendance?.percentage ?? 0}%`} label="Overall attendance" /></View><Text style={[typography.caption, { color: colors.textMuted }]}>{studentAcademicInfo.currentPeriod} · {studentAcademicInfo.academicYear}</Text></Card></View>

        <View style={{ flexDirection: isWide ? 'row' : 'column', alignItems: 'flex-start', gap: isWide ? spacing.giant : spacing.xxl }}><View style={{ flex: 1, width: '100%', gap: spacing.sm }}><SectionHeading title="Today's classes" action="View schedule" onAction={() => router.push('/student/schedule' as Href)} />{data.today.length ? <TodaySchedule classes={data.today} /> : <StateView state="empty" title="No classes scheduled today" message="Your schedule is clear for today." />}</View><View style={{ width: isWide ? 344 : '100%', gap: spacing.sm }}><SectionHeading title="Today summary" />{data.today.length ? <DailySummary classes={data.today} /> : <Card><Text style={[typography.bodySmall, { color: colors.textMuted }]}>No class activity to summarize today.</Text></Card>}<View style={{ marginTop: spacing.lg, gap: spacing.sm }}><SectionHeading title="Quick actions" /><StudentQuickActions /></View></View></View>

        <View style={{ flexDirection: isWide ? 'row' : 'column', alignItems: 'flex-start', gap: isWide ? spacing.giant : spacing.xxl }}><View style={{ flex: 1, width: '100%', gap: spacing.sm }}><SectionHeading title="Subject attendance" action="View all subjects" onAction={() => router.push('/student/subjects' as Href)} /><Card style={{ paddingVertical: spacing.sm }}>{data.subjects.slice(0, 3).map((item, index) => <SubjectAttendanceRow key={item.id} item={item} pinned={pinnedSubjectIds.includes(item.id)} last={index === Math.min(3, data.subjects.length) - 1} />)}</Card></View><View style={{ width: isWide ? 344 : '100%', gap: spacing.sm }}><SectionHeading title="Recent activity" />{data.activity.length ? <Card style={{ paddingVertical: spacing.sm }}>{data.activity.slice(0, 3).map((item, index) => <RecentActivityRow key={item.id} item={item} last={index === Math.min(3, data.activity.length) - 1} />)}</Card> : <Text style={[typography.bodySmall, { color: colors.textMuted }]}>Attendance activity will appear here.</Text>}</View></View>
        <View style={{ gap: spacing.sm }}><SectionHeading title="Recently viewed" />{recentItems.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{recentItems.slice(0, 4).map((item) => <Button key={`${item.kind}-${item.id}`} label={item.title} variant="secondary" onPress={() => router.push(item.href as Href)} />)}</View> : <Text style={[typography.bodySmall, { color: colors.textMuted }]}>Subjects, attendance sessions, and academic events you open will appear here.</Text>}</View>
      </> : null}
    </PageContainer>
  </StudentShell>;
}
