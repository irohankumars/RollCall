import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, Statistic } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import type { LecturerClass, LecturerStudent } from './types';
import { latestDailyMark, type DailySession, type DailySessionStatus } from './class-teacher-data';

function statusPresentation(status: DailySessionStatus) {
  if (status === 'COMPLETED') return { label: 'Completed', tone: 'success' as const };
  if (status === 'PENDING') return { label: 'Pending', tone: 'warning' as const };
  return { label: 'Not conducted', tone: 'neutral' as const };
}

export function ClassTeacherIdentity({ item }: { item: LecturerClass }) {
  const { colors } = useRollCallTheme();
  return <View style={{ gap: spacing.xs }}>
    <Badge label="Class Teacher" tone="info" />
    <Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.batchName}</Text>
    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.semester} · {item.studentCount} students</Text>
  </View>;
}

export function DailyClassTotals({ sessions }: { sessions: DailySession[] }) {
  const completed = sessions.filter((session) => session.status === 'COMPLETED').length;
  const notConducted = sessions.filter((session) => session.status === 'NOT_CONDUCTED').length;
  const pending = sessions.filter((session) => session.status === 'PENDING').length;
  return <View accessibilityLabel={`${sessions.length} classes, ${completed} conducted, ${notConducted} not conducted${pending ? `, ${pending} pending` : ''}`} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxxl }}>
    <Statistic value={String(sessions.length)} label="Classes" />
    <Statistic value={String(completed)} label="Conducted" />
    <Statistic value={String(notConducted)} label="Not conducted" />
    {pending ? <Statistic value={String(pending)} label="Pending" /> : null}
  </View>;
}

export function DailySessionRow({ item, students }: { item: DailySession; students: LecturerStudent[] }) {
  const { colors } = useRollCallTheme(); const responsive = useResponsive(); const status = statusPresentation(item.status);
  const present = Object.values(item.records).filter((mark) => mark === 'PRESENT').length;
  const absent = Object.values(item.records).filter((mark) => mark === 'ABSENT').length;
  return <View accessibilityLabel={`${item.time}, ${item.subjectName}, ${status.label}${item.status === 'COMPLETED' ? `, ${present} present, ${absent} absent` : ''}`} style={{ minHeight: 78, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, flexDirection: responsive.isCompact ? 'column' : 'row', alignItems: responsive.isCompact ? 'stretch' : 'center', gap: spacing.md }}>
    <Text style={[typography.numeric, { width: responsive.isCompact ? undefined : 84, color: colors.textPrimary }]}>{item.time}</Text>
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.subjectName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.subjectCode}{item.status === 'COMPLETED' ? ` · ${present} of ${students.length} present` : ''}</Text></View>
    <Badge label={status.label} tone={status.tone} />
  </View>;
}

function markPresentation(session: DailySession, studentId: string) {
  if (session.status === 'NOT_CONDUCTED') return { icon: 'remove' as const, label: 'Not conducted', colorKey: 'textMuted' as const };
  if (session.status === 'PENDING') return { icon: 'time-outline' as const, label: 'Pending', colorKey: 'warning' as const };
  if (session.records[studentId] === 'PRESENT') return { icon: 'checkmark' as const, label: 'Present', colorKey: 'success' as const };
  return { icon: 'close' as const, label: 'Absent', colorKey: 'error' as const };
}

export function StudentDailyRow({ student, sessions }: { student: LecturerStudent; sessions: DailySession[] }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const overall = latestDailyMark(student.id, sessions);
  return <View accessibilityLabel={`${student.name}, daily status ${overall === 'PRESENT' ? 'present' : 'absent'}`} style={{ paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, gap: spacing.md }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Avatar name={student.name} size="small" /><View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{student.name}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{student.rollNumber}</Text></View><Badge label={overall === 'PRESENT' ? 'Present today' : 'Absent today'} tone={overall === 'PRESENT' ? 'success' : 'error'} /></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{sessions.map((session) => { const mark = markPresentation(session, student.id); return <View key={session.id} accessibilityLabel={`${session.subjectCode}, ${mark.label}`} style={{ minWidth: isCompact ? 58 : 72, minHeight: sizing.touchTarget, borderRadius: radii.sm, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs, paddingHorizontal: spacing.sm }}><Ionicons accessibilityElementsHidden name={mark.icon} size={sizing.iconSm} color={colors[mark.colorKey]} /><Text numberOfLines={1} style={[typography.caption, { color: colors.textSecondary }]}>{session.subjectCode}</Text></View>; })}</View>
  </View>;
}

export function DailyNotificationPreview({ item, students, sessions }: { item: LecturerClass; students: LecturerStudent[]; sessions: DailySession[] }) {
  const { colors } = useRollCallTheme(); const sample = students[0];
  const completed = sessions.filter((session) => session.status === 'COMPLETED').length;
  const notConducted = sessions.filter((session) => session.status === 'NOT_CONDUCTED').length;
  return <View style={{ gap: spacing.md }}>
    <View style={{ gap: spacing.xs }}><Text style={[typography.label, { color: colors.textPrimary }]}>Daily attendance summary</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.batchName} · {new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</Text></View>
    <View style={{ paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs }}><Text style={[typography.bodySmall, { color: colors.textPrimary }]}>{completed} classes completed. {notConducted} class not conducted.</Text>{sample ? <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{sample.name} ({sample.rollNumber}) · {latestDailyMark(sample.id, sessions) === 'PRESENT' ? 'Present today' : 'Absent today'}</Text> : null}</View>
    <Text style={[typography.caption, { color: colors.textMuted }]}>Preview only. Nothing will be sent from this screen.</Text>
  </View>;
}

export function NotificationRow({ title, message, related, timestamp, unread, onPress }: { title: string; message: string; related: string; timestamp: string; unread: boolean; onPress: () => void }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${unread ? 'Unread' : 'Read'} notification, ${title}, ${message}, ${timestamp}`} accessibilityHint="Opens notification details" onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 92, marginHorizontal: -spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radii.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, borderBottomWidth: focused ? 2 : 1, borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, backgroundColor: pressed ? colors.surfaceSecondary : unread ? colors.infoSurface : 'transparent', flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, opacity: pressed ? 0.76 : 1 })}>
    <View style={{ flex: 1, gap: spacing.xs }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}><Text style={[unread ? typography.subheading : typography.label, { color: colors.textPrimary }]}>{title}</Text>{unread ? <Badge label="Unread" tone="info" /> : null}</View><Text numberOfLines={2} style={[typography.bodySmall, { color: colors.textSecondary }]}>{message}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{related} · {timestamp}</Text></View><Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} />
  </Pressable>;
}
