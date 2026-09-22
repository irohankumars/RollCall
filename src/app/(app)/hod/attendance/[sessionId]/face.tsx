/* eslint-disable react-hooks/set-state-in-effect -- loaded mock roster initializes the local demo session */
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { Dialog } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { AttendanceSummary, RecognitionPanel, SessionHeader, StudentProgressRow, type AttendanceMethod } from '@/lecturer/attendance-flow-components';
import { DetailPageSkeleton } from '@/hod/detail-components';
import { HodShell, ResourceState, SectionHeading } from '@/hod/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import type { LecturerStudent } from '@/lecturer/types';
import { useResource } from '@/lecturer/use-resource';

export default function LiveAttendance() {
  const { colors } = useRollCallTheme();
  const { sessionId = '', classId = '', method = 'FACE' } = useLocalSearchParams<{ sessionId: string; classId: string; method?: AttendanceMethod }>();
  const { session } = useAuth(); const token = session?.token ?? '';
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const rosterResource = useResource(() => lecturerClient.roster(token, classId), [token, classId]);
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [lastRecognized, setLastRecognized] = useState<LecturerStudent>();
  const [showAll, setShowAll] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const students = useMemo(() => rosterResource.data ?? [], [rosterResource.data]); const item = classResource.data;
  const loading = classResource.loading || rosterResource.loading;

  useEffect(() => {
    if (students.length && presentIds.length === 0) {
      const initial = students.slice(0, Math.min(2, students.length));
      setPresentIds(initial.map((student) => student.id));
      setLastRecognized(initial.at(-1));
    }
  }, [students, presentIds.length]);

  const remaining = students.filter((student) => !presentIds.includes(student.id));
  const markNext = () => { const next = remaining[0]; if (!next) return; setPresentIds((current) => [...current, next.id]); setLastRecognized(next); };
  const endSession = () => {
    const query = `classId=${encodeURIComponent(classId)}&present=${encodeURIComponent(presentIds.join(','))}&review=${encodeURIComponent(remaining.slice(0, 1).map((student) => student.id).join(','))}&method=${encodeURIComponent(method)}`;
    setConfirmEnd(false);
    router.replace(`/hod/attendance/${sessionId}/review?${query}` as Href);
  };

  return <HodShell activeKey="classes" title="Live attendance" subtitle={item?.subjectCode} back backFallback={`/hod/classes/${classId}` as Href}>
    <PageContainer width="standard" fixedActions={!loading && item ? <Button label="End attendance" variant="destructive" accessibilityHint="Opens the local attendance review" onPress={() => setConfirmEnd(true)} /> : undefined}>
      {loading ? <DetailPageSkeleton rows={5} /> : null}
      {!loading && !classId ? <StateView state="error" title="Session unavailable" message="The local attendance session is missing its class context." /> : null}
      {!loading && classResource.error ? <ResourceState loading={false} error={classResource.error} retry={classResource.retry} /> : null}
      {!loading && !classResource.error && rosterResource.error ? <ResourceState loading={false} error={rosterResource.error} retry={rosterResource.retry} /> : null}
      {!loading && item ? <>
        <SessionHeader item={item} date={new Date()} status="In progress" />
        <View style={{ paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle }}><AttendanceSummary present={presentIds.length} remaining={remaining.length} total={students.length} /></View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeading title={method === 'MANUAL' ? 'Manual check-in' : 'Recognition area'} />
          <RecognitionPanel student={lastRecognized} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Button label={method === 'MANUAL' ? 'Mark next present' : 'Recognize next student'} disabled={!remaining.length} onPress={markNext} style={{ flexGrow: 1 }} />
            {method === 'FACE' ? <Button label="Manual fallback" variant="secondary" disabled={!remaining.length} accessibilityHint="Marks the next waiting student present using the local manual fallback" onPress={markNext} /> : null}
          </View>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Camera processing and attendance submission are not connected in this build. Changes remain local.</Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeading title="Students" action={showAll ? 'Show fewer' : `View all ${students.length}`} onAction={() => setShowAll((current) => !current)} />
          {(showAll ? students : students.slice(0, 4)).map((student) => <StudentProgressRow key={student.id} item={student} present={presentIds.includes(student.id)} />)}
        </View>
      </> : null}
    </PageContainer>
    <Dialog visible={confirmEnd} title="End this attendance session?" message={`${presentIds.length} present and ${remaining.length} remaining. You can change every attendance status on the review screen.`} confirmLabel="Review attendance" onDismiss={() => setConfirmEnd(false)} onConfirm={endSession} />
  </HodShell>;
}
