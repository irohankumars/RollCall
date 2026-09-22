import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Button, Card } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { AcademicEventRow, AcademicInfoCard } from '@/student/s3-components';
import { studentAcademicEvents, studentS3Client } from '@/student/s3-data';
import { StudentShell } from '@/student/shell';

export default function StudentAcademicOverview() {
  const { colors } = useRollCallTheme(); const resource = useResource(studentS3Client.academicInfo, []); const upcoming = studentAcademicEvents.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  return <StudentShell activeKey="schedule" title="Academic Overview" subtitle="Your current academic information" back backFallback={'/student/schedule' as Href}><PageContainer width="standard" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
    <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Academic Overview</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Your programme, semester, and current academic period.</Text></View>
    {resource.loading ? <StateView state="loading" /> : null}{resource.error ? <StateView state="error" message={resource.error.message} onRetry={resource.retry} /> : null}{resource.data ? <><AcademicInfoCard info={resource.data} /><Card><Text style={[typography.bodySmall, { color: colors.textMuted }]}>This academic profile uses local sample information for the current frontend build.</Text></Card><View style={{ gap: spacing.sm }}><SectionHeading title="Upcoming academic dates" action="View all" onAction={() => router.push('/student/academic/dates' as Href)} /><Card style={{ paddingVertical: spacing.sm }}>{upcoming.map((item, index) => <AcademicEventRow key={item.id} item={item} last={index === upcoming.length - 1} onPress={() => router.push(`/student/academic/events/${item.id}` as Href)} />)}</Card></View><Button label="Return to Schedule" variant="secondary" onPress={() => router.push('/student/schedule' as Href)} /></> : null}
  </PageContainer></StudentShell>;
}
