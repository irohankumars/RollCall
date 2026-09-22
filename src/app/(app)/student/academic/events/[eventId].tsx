import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { useResource } from '@/lecturer/use-resource';
import { AcademicEventCategoryBadge, MetadataList } from '@/student/s3-components';
import { studentS3Client } from '@/student/s3-data';
import { StudentShell } from '@/student/shell';
import { useStudentFinal } from '@/student/final-provider';

export default function StudentAcademicEventDetails() {
  const { colors } = useRollCallTheme(); const { recordRecent } = useStudentFinal(); const { eventId = '', from } = useLocalSearchParams<{ eventId: string; from?: string }>(); const resource = useResource(() => studentS3Client.academicEvent(eventId), [eventId]); const item = resource.data;
  useEffect(() => { if (item) recordRecent({ id: item.id, kind: 'ACADEMIC_EVENT', title: item.title, detail: item.date, href: `/student/academic/events/${item.id}` }); }, [item, recordRecent]);
  const date = item ? new Date(`${item.date}T12:00:00`).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const notificationId = from ?? item?.notificationId;
  return <StudentShell activeKey="schedule" title="Academic Event" subtitle={item?.title ?? 'Event details'} back backFallback={'/student/academic/dates' as Href}><PageContainer width="compact" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
    {resource.loading ? <StateView state="loading" /> : null}{resource.error ? <StateView state="error" message={resource.error.message} onRetry={resource.retry} /> : null}{!resource.loading && !resource.error && !item ? <StateView state="empty" title="Academic event unavailable" message="This academic event is not available on this device." /> : null}
    {item ? <><Card><View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md }}><Text accessibilityRole="header" style={[typography.title, { flex: 1, minWidth: 220, color: colors.textPrimary }]}>{item.title}</Text><AcademicEventCategoryBadge category={item.category} /></View><Text style={[typography.body, { color: colors.textPrimary }]}>{item.description}</Text></Card><MetadataList rows={[{ label: 'Date', value: date }, ...(item.time ? [{ label: 'Time', value: item.time }] : []), ...(item.location ? [{ label: 'Location', value: item.location }] : []), ...(item.information ? [{ label: 'Information', value: item.information }] : [])]} /><View style={{ gap: spacing.sm }}><Button label="View Important Dates" variant="secondary" onPress={() => router.push('/student/academic/dates' as Href)} />{notificationId ? <Button label="View Related Notification" variant="text" onPress={() => router.push(`/student/notifications/${notificationId}` as Href)} /> : null}</View></> : null}
  </PageContainer></StudentShell>;
}
