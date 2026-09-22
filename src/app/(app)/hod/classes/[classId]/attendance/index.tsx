import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Button, Statistic } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { AttendanceMethodSelector, CameraReadinessPanel, ReadinessStatus, SessionHeader, type AttendanceMethod, type CameraReadiness } from '@/lecturer/attendance-flow-components';
import { DetailPageSkeleton } from '@/hod/detail-components';
import { HodShell, ResourceState, SectionHeading } from '@/hod/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';

const cameraStates: CameraReadiness[] = ['required', 'ready', 'denied', 'unavailable'];

export default function StartAttendance() {
  const { colors } = useRollCallTheme();
  const { classId = '', camera, state } = useLocalSearchParams<{ classId: string; camera?: string; state?: string }>();
  const { session } = useAuth(); const token = session?.token ?? '';
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const rosterResource = useResource(() => lecturerClient.roster(token, classId), [token, classId]);
  const [method, setMethod] = useState<AttendanceMethod>('FACE');
  const [cameraState, setCameraState] = useState<CameraReadiness>(cameraStates.includes(camera as CameraReadiness) ? camera as CameraReadiness : 'required');
  const item = classResource.data; const students = rosterResource.data ?? [];
  const loading = classResource.loading || rosterResource.loading;
  const notFound = classResource.error?.status === 404;
  const alreadyActive = state === 'active';
  const cameraReady = method === 'MANUAL' || cameraState === 'ready';
  const canStart = Boolean(item && students.length && cameraReady && !alreadyActive);
  const now = new Date();

  const start = () => {
    if (!item || !canStart) return;
    const sessionId = `demo-${item.id}`;
    router.replace(`/hod/attendance/${sessionId}/face?classId=${encodeURIComponent(item.id)}&method=${method}` as Href);
  };

  const chooseMethod = (next: AttendanceMethod) => { setMethod(next); if (next === 'MANUAL') setCameraState('required'); };

  return <HodShell activeKey="classes" title="Start attendance" subtitle={item?.subjectCode} back backFallback={`/hod/classes/${classId}` as Href}>
    <PageContainer width="compact" fixedActions={!loading && item && !alreadyActive ? <Button label="Start attendance" disabled={!canStart} accessibilityHint={canStart ? 'Opens the local attendance session' : 'Complete session readiness before starting'} onPress={start} /> : undefined}>
      {loading ? <DetailPageSkeleton rows={4} /> : null}
      {!loading && notFound ? <StateView state="error" title="Session unavailable" message="This class is not available for attendance." /> : null}
      {!loading && !notFound && classResource.error ? <ResourceState loading={false} error={classResource.error} retry={classResource.retry} /> : null}
      {!loading && !classResource.error && rosterResource.error ? <ResourceState loading={false} error={rosterResource.error} retry={rosterResource.retry} /> : null}
      {!loading && item && alreadyActive ? <View style={{ gap: spacing.lg }}><StateView state="success" title="Session already active" message="Resume the local attendance session for this class." /><Button label="Resume attendance" onPress={() => router.replace(`/hod/attendance/demo-${item.id}/face?classId=${encodeURIComponent(item.id)}&method=${method}` as Href)} /></View> : null}
      {!loading && item && !alreadyActive ? <>
        <SessionHeader item={item} date={now} />
        <View style={{ flexDirection: 'row', gap: spacing.giant, flexWrap: 'wrap', paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle }}>
          <Statistic value={String(students.length || item.studentCount)} label="Students" />
          <Statistic value={item.semester.replace('Semester ', '')} label="Semester" />
        </View>
        <View style={{ gap: spacing.xs }}><Text style={[typography.caption, { color: colors.textMuted }]}>HOD</Text><Text style={[typography.body, { color: colors.textPrimary }]}>{session?.user.name ?? 'HOD'}</Text></View>

        <View style={{ gap: spacing.sm }}><SectionHeading title="Attendance method" /><AttendanceMethodSelector value={method} onChange={chooseMethod} /></View>

        {method === 'FACE' ? <View style={{ gap: spacing.sm }}><SectionHeading title="Camera readiness" /><CameraReadinessPanel state={cameraState} actions={<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {cameraState === 'required' ? <><Button label="Allow camera" variant="secondary" onPress={() => setCameraState('ready')} /><Button label="Not now" variant="text" onPress={() => setCameraState('denied')} /></> : null}
          {cameraState === 'ready' ? <Button label="Run check again" variant="text" onPress={() => setCameraState('required')} /> : null}
          {cameraState === 'denied' || cameraState === 'unavailable' ? <><Button label="Retry camera" variant="secondary" onPress={() => setCameraState('ready')} /><Button label="Use manual" variant="text" onPress={() => chooseMethod('MANUAL')} /></> : null}
        </View>} /></View> : null}

        <View style={{ gap: spacing.sm }}><SectionHeading title="Session readiness" /><ReadinessStatus items={[
          { label: 'Correct class', ready: true, detail: `${item.subjectCode}, ${item.batchName}` },
          { label: "Today's session", ready: true, detail: now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' }) },
          { label: 'Student roster', ready: students.length > 0, detail: students.length ? `${students.length} students loaded` : 'No students available' },
          { label: method === 'FACE' ? 'Camera ready' : 'Manual mode ready', ready: cameraReady, detail: method === 'FACE' ? 'Local readiness only' : 'No camera required' },
        ]} /></View>
      </> : null}
    </PageContainer>
  </HodShell>;
}
