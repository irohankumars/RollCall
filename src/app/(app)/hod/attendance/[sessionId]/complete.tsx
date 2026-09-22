import { Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { AttendanceSummary, type AttendanceMethod } from '@/lecturer/attendance-flow-components';
import { DetailPageSkeleton } from '@/hod/detail-components';
import { HodShell, ResourceState } from '@/hod/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';

function parseIds(value?: string) {
  return new Set((value ?? '').split(',').filter(Boolean));
}

export default function AttendanceComplete() {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  const { sessionId = '', classId = '', present, confirmedAt, method = 'FACE' } = useLocalSearchParams<{ sessionId: string; classId: string; present?: string; confirmedAt?: string; method?: AttendanceMethod }>();
  const { session } = useAuth(); const token = session?.token ?? '';
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const rosterResource = useResource(() => lecturerClient.roster(token, classId), [token, classId]);
  const loading = classResource.loading || rosterResource.loading;
  const item = classResource.data; const students = rosterResource.data ?? [];
  const presentIds = parseIds(present); const presentCount = students.filter((student) => presentIds.has(student.id)).length;
  const absentCount = Math.max(0, students.length - presentCount);
  const confirmed = confirmedAt ? new Date(confirmedAt) : new Date();
  const localQuery = `classId=${encodeURIComponent(classId)}&present=${encodeURIComponent(present ?? '')}&confirmedAt=${encodeURIComponent(confirmed.toISOString())}&method=${encodeURIComponent(method)}`;
  const historyQuery = `demoSessionId=${encodeURIComponent(sessionId)}&${localQuery}`;

  const actions = <View style={{ width: '100%', maxWidth: 620, alignSelf: 'center', flexDirection: isCompact ? 'column' : 'row', gap: spacing.sm }}>
    <Button label="View attendance" accessibilityHint="Opens the read-only attendance record" onPress={() => router.replace(`/hod/attendance/${sessionId}?${localQuery}` as Href)} style={{ flex: isCompact ? undefined : 1 }} />
    <Button label="Done" variant="secondary" accessibilityHint="Opens attendance history" onPress={() => router.replace(`/hod/history?${historyQuery}` as Href)} style={{ flex: isCompact ? undefined : 1 }} />
  </View>;

  return <HodShell activeKey="history" title="Attendance complete" subtitle={item?.subjectCode}>
    <PageContainer width="compact" fixedActions={!loading && item ? actions : undefined} contentContainerStyle={{ justifyContent: 'center' }}>
      {loading ? <DetailPageSkeleton rows={3} /> : null}
      {!loading && !classId ? <StateView state="error" title="Confirmation unavailable" message="This local attendance confirmation is missing its class context." /> : null}
      {!loading && classResource.error ? <ResourceState loading={false} error={classResource.error} retry={classResource.retry} /> : null}
      {!loading && !classResource.error && rosterResource.error ? <ResourceState loading={false} error={rosterResource.error} retry={rosterResource.retry} /> : null}
      {!loading && item ? <View style={{ alignItems: 'center', gap: spacing.xl, paddingVertical: spacing.xl }}>
        <View accessibilityLabel="Attendance complete" style={{ width: 64, height: 64, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successSurface }}>
          <Ionicons accessibilityElementsHidden name="checkmark" size={sizing.iconXl} color={colors.success} />
        </View>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Text accessibilityRole="header" style={[typography.display, { color: colors.textPrimary, textAlign: 'center' }]}>Attendance Complete</Text>
          <Text style={[typography.heading, { color: colors.textPrimary, textAlign: 'center' }]}>{item.subjectName}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{item.subjectCode} · {item.batchName}</Text>
          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>{confirmed.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })} · {confirmed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
        <View style={{ width: '100%', paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle }}>
          <AttendanceSummary present={presentCount} absent={absentCount} total={students.length} />
        </View>
        <Text accessibilityLiveRegion="polite" style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>Attendance confirmed at {confirmed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
      </View> : null}
    </PageContainer>
  </HodShell>;
}
