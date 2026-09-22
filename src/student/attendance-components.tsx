import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, IconButton, Progress, Statistic } from '@/design-system/components/core';
import { BottomSheet } from '@/design-system/components/feedback';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { AttendanceStatusBadge } from './components';
import type { AttendanceIssueStatus, StudentAttendanceSession, StudentSubjectAttendance } from './types';

export function AttendanceRecordStatus({ value }: { value: StudentAttendanceSession['attendance'] }) {
  return <Badge label={value === 'PRESENT' ? 'Present' : 'Absent'} tone={value === 'PRESENT' ? 'success' : 'error'} />;
}

export function StudentAttendanceSummary({ item }: { item: StudentSubjectAttendance }) {
  const { colors } = useRollCallTheme(); const tone = item.status === 'good' ? 'good' : item.status === 'attention' ? 'warning' : 'low';
  return <Card><View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.lg }}><View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.name}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{item.code} · {item.lecturer}</Text></View><AttendanceStatusBadge status={item.status} /></View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxl }}><Statistic value={`${item.percentage}%`} label="Attendance" /><Statistic value={String(item.present)} label="Present" /><Statistic value={String(item.absent)} label="Absent" /><Statistic value={String(item.total)} label="Total" /></View><Progress value={item.percentage} label={`Required ${item.threshold}%`} tone={tone} /></Card>;
}

export function AttendanceHistoryRow({ item, last = false }: { item: StudentAttendanceSession; last?: boolean }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const date = new Date(`${item.date}T12:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.subject}, ${date}, ${item.startTime}, ${item.attendance === 'PRESENT' ? 'Present' : 'Absent'}`} accessibilityHint="Opens session details" onPress={() => router.push(`/student/attendance/session/${item.id}` as Href)} style={({ pressed }) => ({ minHeight: isCompact ? 98 : 76, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: spacing.md, opacity: pressed ? 0.72 : 1 })}><View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.subject}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.code} · {item.lecturer}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{date} · {item.startTime}–{item.endTime} · {item.information}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><AttendanceRecordStatus value={item.attendance} /><Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} /></View></Pressable>;
}

export function AttendanceTrend({ sessions }: { sessions: StudentAttendanceSession[] }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel="Recent attendance trend" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{sessions.slice(0, 6).reverse().map((session) => { const present = session.attendance === 'PRESENT'; return <View key={session.id} accessibilityLabel={`${new Date(`${session.date}T12:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${present ? 'Present' : 'Absent'}`} style={{ minWidth: 54, minHeight: 52, borderRadius: radii.sm, backgroundColor: present ? colors.successSurface : colors.errorSurface, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs }}><Text style={[typography.label, { color: present ? colors.success : colors.error }]}>{present ? 'P' : 'A'}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{new Date(`${session.date}T12:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Text></View>; })}</View>;
}

export function StudentSessionHeader({ session }: { session: StudentAttendanceSession }) {
  const { colors } = useRollCallTheme(); const date = new Date(`${session.date}T12:00:00`).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return <View style={{ gap: spacing.md }}><View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md }}><View style={{ flex: 1, minWidth: 220, gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{session.subject}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{session.code} · {session.lecturer}</Text></View><AttendanceRecordStatus value={session.attendance} /></View><Text style={[typography.bodySmall, { color: colors.textMuted }]}>{date} · {session.startTime}–{session.endTime}</Text></View>;
}

export function SessionMetadata({ session }: { session: StudentAttendanceSession }) {
  const { colors } = useRollCallTheme(); const rows = [
    ['Session status', session.sessionStatus], ['Confirmation', session.confirmation], ['Duration', session.duration], ['Location', session.room ?? 'Not provided'], ['Session information', session.information], ['Recorded', new Date(session.recordedAt).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })],
  ];
  return <Card>{rows.map(([label, value], index) => <View key={label} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderBottomWidth: index === rows.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}><Text style={[typography.bodySmall, { flex: 1, color: colors.textMuted }]}>{label}</Text><Text style={[typography.label, { flex: 1, textAlign: 'right', color: colors.textPrimary }]}>{value}</Text></View>)}</Card>;
}

export function ChoiceSheet<T extends string>({ visible, title, value, options, onChange, onDismiss }: { visible: boolean; title: string; value: T; options: readonly { label: string; value: T }[]; onChange: (value: T) => void; onDismiss: () => void }) {
  const { colors } = useRollCallTheme();
  return <BottomSheet visible={visible} title={title} onDismiss={onDismiss}><View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>{options.map((option) => { const selected = option.value === value; return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => { onChange(option.value); onDismiss(); }} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: selected || pressed ? colors.surfaceSecondary : 'transparent' })}><Ionicons accessibilityElementsHidden name={selected ? 'radio-button-on' : 'radio-button-off'} size={sizing.iconMd} color={selected ? colors.primary : colors.textMuted} /><Text style={[typography.body, { color: colors.textPrimary }]}>{option.label}</Text></Pressable>; })}</View></BottomSheet>;
}

type CalendarDay = { key: string; day: number; inMonth: boolean; state: 'present' | 'absent' | 'no-class' | 'no-data'; sessions: StudentAttendanceSession[] };
const dayStateCopy = { present: 'Present', absent: 'Absent', 'no-class': 'No class', 'no-data': 'No attendance data' } as const;

function calendarDays(month: Date, records: StudentAttendanceSession[]): CalendarDay[] {
  const year = month.getFullYear(); const monthIndex = month.getMonth(); const first = new Date(year, monthIndex, 1); const gridStart = new Date(year, monthIndex, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => { const date = new Date(gridStart); date.setDate(gridStart.getDate() + index); const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; const sessions = records.filter((item) => item.date === key); const weekend = date.getDay() === 0 || date.getDay() === 6; const state = sessions.length ? sessions.some((item) => item.attendance === 'ABSENT') ? 'absent' : 'present' : weekend ? 'no-class' : 'no-data'; return { key, day: date.getDate(), inMonth: date.getMonth() === monthIndex, state, sessions }; });
}

export function AttendanceCalendar({ month, sessions, selectedDate, onSelectDate, onPreviousMonth, onNextMonth }: { month: Date; sessions: StudentAttendanceSession[]; selectedDate?: string; onSelectDate: (date: string) => void; onPreviousMonth: () => void; onNextMonth: () => void }) {
  const { colors } = useRollCallTheme(); const days = calendarDays(month, sessions); const stateColor = { present: colors.success, absent: colors.error, 'no-class': colors.textMuted, 'no-data': colors.warning };
  return <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><IconButton label="Previous month" onPress={onPreviousMonth}><Ionicons name="chevron-back" size={sizing.iconMd} color={colors.primary} /></IconButton><Text accessibilityRole="header" style={[typography.heading, { flex: 1, textAlign: 'center', color: colors.textPrimary }]}>{month.toLocaleDateString([], { month: 'long', year: 'numeric' })}</Text><IconButton label="Next month" onPress={onNextMonth}><Ionicons name="chevron-forward" size={sizing.iconMd} color={colors.primary} /></IconButton></View><View accessibilityLabel="Calendar weekdays" style={{ flexDirection: 'row' }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <Text key={day} style={[typography.caption, { width: `${100 / 7}%`, textAlign: 'center', color: colors.textMuted }]}>{day.slice(0, 1)}</Text>)}</View><View accessibilityLabel="Attendance calendar dates" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{days.map((item) => { const selected = item.key === selectedDate; const color = stateColor[item.state]; return <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={`${new Date(`${item.key}T12:00:00`).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}, ${dayStateCopy[item.state]}`} accessibilityState={{ selected }} onPress={() => onSelectDate(item.key)} style={({ pressed }) => ({ width: `${100 / 7}%`, minHeight: 54, borderRadius: radii.sm, borderWidth: selected ? 2 : 0, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: item.inMonth ? 1 : 0.36 })}><Text style={[typography.label, { color: selected ? colors.primary : colors.textPrimary }]}>{item.day}</Text><Text style={[typography.caption, { color }]}>{item.state === 'present' ? 'P' : item.state === 'absent' ? 'A' : item.state === 'no-class' ? '—' : '·'}</Text></Pressable>; })}</View><View accessibilityLabel="Calendar legend" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>{Object.entries(dayStateCopy).map(([key, label]) => <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}><Text style={[typography.label, { color: stateColor[key as keyof typeof stateColor] }]}>{key === 'present' ? 'P' : key === 'absent' ? 'A' : key === 'no-class' ? '—' : '·'}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text></View>)}</View></Card>;
}

const issueStatusCopy: Record<AttendanceIssueStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'neutral' }> = { SUBMITTED: { label: 'Submitted', tone: 'info' }, UNDER_REVIEW: { label: 'Under review', tone: 'warning' }, RESOLVED: { label: 'Resolved', tone: 'success' }, CLOSED: { label: 'Closed', tone: 'neutral' } };
export function IssueStatus({ status }: { status: AttendanceIssueStatus }) { const copy = issueStatusCopy[status]; return <Badge label={copy.label} tone={copy.tone} />; }

export function AttendanceActions({ subjectId }: { subjectId?: string }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}><Button label="Attendance History" variant="secondary" onPress={() => router.push((subjectId ? `/student/attendance/history?subjectId=${subjectId}` : '/student/attendance/history') as Href)} /><Button label="Attendance Calendar" variant="secondary" onPress={() => router.push('/student/attendance/calendar' as Href)} /></View>;
}
