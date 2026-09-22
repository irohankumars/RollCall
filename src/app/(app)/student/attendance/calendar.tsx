import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { type Href } from 'expo-router';
import { Card } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { useResource } from '@/lecturer/use-resource';
import { AttendanceCalendar, AttendanceHistoryRow } from '@/student/attendance-components';
import { studentClient } from '@/student/student-data';
import { StudentShell } from '@/student/shell';

export default function StudentAttendanceCalendar() {
  const { colors } = useRollCallTheme(); const { isExpanded } = useResponsive(); const resource = useResource(studentClient.attendanceHistory, []);
  const [month, setMonth] = useState(() => new Date(2026, 8, 1)); const [selectedDate, setSelectedDate] = useState<string | undefined>('2026-09-19');
  const sessions = useMemo(() => (resource.data ?? []).filter((item) => item.date === selectedDate), [resource.data, selectedDate]);
  const moveMonth = (amount: number) => { setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)); setSelectedDate(undefined); };
  const selectedLabel = selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date';
  return <StudentShell activeKey="attendance" title="Attendance Calendar" subtitle="Browse attendance by date" back backFallback={'/student/attendance' as Href}><PageContainer width="full" contentContainerStyle={{ maxWidth: sizing.contentMax }}>
    <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Attendance Calendar</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Select a date to review your recorded sessions.</Text></View>
    {resource.loading ? <StateView state="loading" /> : null}{resource.error ? <StateView state="error" message={resource.error.message} onRetry={resource.retry} /> : null}
    {resource.data ? <View style={{ flexDirection: isExpanded ? 'row' : 'column', alignItems: 'flex-start', gap: spacing.xxl }}><View style={{ flex: 1, width: '100%' }}><AttendanceCalendar month={month} sessions={resource.data} selectedDate={selectedDate} onSelectDate={setSelectedDate} onPreviousMonth={() => moveMonth(-1)} onNextMonth={() => moveMonth(1)} /></View><View style={{ width: isExpanded ? 380 : '100%', gap: spacing.sm }}><SectionHeading title={selectedLabel} />{selectedDate ? sessions.length ? <Card style={{ paddingVertical: spacing.sm }}>{sessions.map((item, index) => <AttendanceHistoryRow key={item.id} item={item} last={index === sessions.length - 1} />)}</Card> : <StateView state="empty" title="No sessions for this date" message="This date has no recorded attendance sessions." /> : <StateView state="empty" title="Select a date" message="Choose a calendar date to see your sessions." />}</View></View> : null}
  </PageContainer></StudentShell>;
}
