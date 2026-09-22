/* eslint-disable react-hooks/set-state-in-effect -- route mock data initializes the editable local review draft */
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
import { AttendanceFilterControl, AttendanceSummary, ReviewAttendanceRow, SessionHeader, type AttendanceMethod, type ReviewFilter } from '@/lecturer/attendance-flow-components';
import { DetailPageSkeleton } from '@/hod/detail-components';
import { HodShell, ResourceState, SectionHeading } from '@/hod/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import type { AttendanceMark } from '@/lecturer/types';
import { useResource } from '@/lecturer/use-resource';

function parseIds(value?: string) {
  return new Set((value ?? '').split(',').filter(Boolean));
}

export default function ReviewAttendance() {
  const { colors } = useRollCallTheme();
  const { sessionId = '', classId = '', present, review, method = 'FACE' } = useLocalSearchParams<{ sessionId: string; classId: string; present?: string; review?: string; method?: AttendanceMethod }>();
  const { session } = useAuth(); const token = session?.token ?? '';
  const classResource = useResource(() => lecturerClient.classDetails(token, classId), [token, classId]);
  const rosterResource = useResource(() => lecturerClient.roster(token, classId), [token, classId]);
  const [marks, setMarks] = useState<Record<string, AttendanceMark>>({});
  const [needsReview, setNeedsReview] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<ReviewFilter>('ALL');
  const [confirm, setConfirm] = useState(false);
  const students = useMemo(() => rosterResource.data ?? [], [rosterResource.data]); const item = classResource.data;
  const loading = classResource.loading || rosterResource.loading;

  useEffect(() => {
    if (!students.length || Object.keys(marks).length) return;
    const presentIds = parseIds(present);
    setMarks(Object.fromEntries(students.map((student) => [student.id, presentIds.has(student.id) ? 'PRESENT' : 'ABSENT'])));
    setNeedsReview(parseIds(review));
  }, [marks, present, review, students]);

  const presentCount = Object.values(marks).filter((status) => status === 'PRESENT').length;
  const absentCount = students.length - presentCount;
  const visible = students.filter((student) => filter === 'ALL' || filter === 'REVIEW' && needsReview.has(student.id) || marks[student.id] === filter);
  const changeMark = (studentId: string, status: AttendanceMark) => {
    setMarks((current) => ({ ...current, [studentId]: status }));
    setNeedsReview((current) => { const next = new Set(current); next.delete(studentId); return next; });
  };
  const confirmLocal = () => {
    const presentIds = Object.entries(marks).filter(([, status]) => status === 'PRESENT').map(([studentId]) => studentId).join(',');
    const query = `classId=${encodeURIComponent(classId)}&present=${encodeURIComponent(presentIds)}&confirmedAt=${encodeURIComponent(new Date().toISOString())}&method=${encodeURIComponent(method)}`;
    setConfirm(false);
    router.replace(`/hod/attendance/${sessionId}/complete?${query}` as Href);
  };

  return <HodShell activeKey="classes" title="Review attendance" subtitle={item?.subjectCode} back backFallback={`/hod/attendance/${sessionId}/face?classId=${encodeURIComponent(classId)}&method=${method}` as Href}>
    <PageContainer width="standard" fixedActions={!loading && item ? <Button label="Confirm attendance" disabled={!students.length} accessibilityHint="Confirms attendance on this device. No attendance is submitted." onPress={() => setConfirm(true)} /> : undefined}>
      {loading ? <DetailPageSkeleton rows={6} /> : null}
      {!loading && !classId ? <StateView state="error" title="Review unavailable" message="The local attendance review is missing its class context." /> : null}
      {!loading && classResource.error ? <ResourceState loading={false} error={classResource.error} retry={classResource.retry} /> : null}
      {!loading && !classResource.error && rosterResource.error ? <ResourceState loading={false} error={rosterResource.error} retry={rosterResource.retry} /> : null}
      {!loading && item ? <>
        <SessionHeader item={item} date={new Date()} />
        <View style={{ paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle }}><AttendanceSummary present={presentCount} absent={absentCount} total={students.length} /></View>
        <View style={{ gap: spacing.sm }}><SectionHeading title="Students" /><AttendanceFilterControl value={filter} onChange={setFilter} /><Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{visible.length} of {students.length} students</Text></View>
        <View>
          {visible.map((student) => <ReviewAttendanceRow key={student.id} item={student} status={marks[student.id] ?? 'ABSENT'} needsReview={needsReview.has(student.id)} onChange={(status) => changeMark(student.id, status)} />)}
          {!visible.length ? <StateView state="empty" title="No matching students" message="Choose another attendance filter to continue reviewing." /> : null}
        </View>
      </> : null}
    </PageContainer>
    <Dialog visible={confirm} title="Confirm attendance?" message={`${presentCount} present and ${absentCount} absent. This saves the session on this device and does not submit it to an external service.`} confirmLabel="Confirm" onDismiss={() => setConfirm(false)} onConfirm={confirmLocal} />
  </HodShell>;
}
