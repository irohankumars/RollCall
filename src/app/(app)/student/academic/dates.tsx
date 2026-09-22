import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Card } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { SkeletonCard, StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { useResource } from '@/lecturer/use-resource';
import { AcademicEventRow } from '@/student/s3-components';
import { studentS3Client } from '@/student/s3-data';
import { StudentShell } from '@/student/shell';

export default function ImportantAcademicDates() {
  const { colors } = useRollCallTheme(); const { state } = useLocalSearchParams<{ state?: 'loading' | 'empty' | 'error' | 'offline' }>(); const resource = useResource(studentS3Client.academicEvents, []); const events = state === 'empty' ? [] : resource.data ?? []; const retry = () => state ? router.replace('/student/academic/dates' as Href) : resource.retry();
  return <StudentShell activeKey="schedule" title="Important Academic Dates" subtitle="Events and milestones" back backFallback={'/student/academic' as Href}><PageContainer width="standard" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
    <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Important Academic Dates</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Review the academic events available in this frontend build.</Text></View>
    <AlertBanner title="Local sample calendar" message="These dates demonstrate the Student academic experience and are not connected to an institution calendar." tone="info" />
    {state === 'offline' ? <AlertBanner title="You are offline" message="Showing academic dates available on this device." tone="warning" /> : null}{resource.loading || state === 'loading' ? <View style={{ gap: spacing.md }}><SkeletonCard /><SkeletonCard /></View> : null}{resource.error || state === 'error' ? <StateView state="error" title="Academic dates unavailable" message={resource.error?.message ?? 'Academic dates could not be loaded.'} onRetry={retry} /> : null}{!resource.loading && !resource.error && state !== 'loading' && state !== 'error' ? events.length ? <Card style={{ paddingVertical: spacing.sm }}>{events.slice().sort((a, b) => a.date.localeCompare(b.date)).map((item, index) => <AcademicEventRow key={item.id} item={item} last={index === events.length - 1} onPress={() => router.push(`/student/academic/events/${item.id}` as Href)} />)}</Card> : <StateView state="empty" title="No academic dates available" message="Important dates will appear after an academic calendar is connected." /> : null}
  </PageContainer></StudentShell>;
}
