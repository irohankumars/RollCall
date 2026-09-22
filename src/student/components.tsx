import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, Button, Card, IconButton, Progress, Statistic } from '@/design-system/components/core';
import { Skeleton } from '@/design-system/components/states';
import { breakpoints, radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import type { AttendanceSummary, StudentAttendanceStatus, StudentIdentity as StudentIdentityData, StudentRecentActivity, StudentSubject, TodayClass } from './types';

const attendanceStatusCopy: Record<StudentAttendanceStatus, { label: string; explanation: string; tone: 'success' | 'warning' | 'error' }> = {
  good: { label: 'Good', explanation: 'Your attendance is at or above the required threshold.', tone: 'success' },
  attention: { label: 'Attention', explanation: 'A few more attended classes will improve your standing.', tone: 'warning' },
  low: { label: 'Low', explanation: 'Your attendance is below the required threshold.', tone: 'error' },
};

export function StudentIdentity({ student, compact = false }: { student: StudentIdentityData; compact?: boolean }) {
  const { colors } = useRollCallTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Avatar name={student.name} size={compact ? 'small' : 'medium'} /><View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}><Text numberOfLines={1} style={[typography.subheading, { color: colors.textPrimary }]}>{student.name}</Text><Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>{student.rollNumber} · {student.semester}</Text></View></View>;
}

export function AttendanceStatusBadge({ status, explanation = false }: { status: StudentAttendanceStatus; explanation?: boolean }) {
  const { colors } = useRollCallTheme(); const copy = attendanceStatusCopy[status];
  return <View accessibilityLabel={`${copy.label}. ${copy.explanation}`} style={{ alignItems: 'flex-start', gap: spacing.sm }}><Badge label={copy.label} tone={copy.tone} />{explanation ? <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{copy.explanation}</Text> : null}</View>;
}

export function AttendanceOverviewCard({ summary }: { summary: AttendanceSummary }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  const percentageColor = summary.status === 'good' ? colors.attendanceGood : summary.status === 'attention' ? colors.attendanceWarning : colors.attendanceLow;
  return <Card><View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'flex-start', gap: spacing.xl }}><View style={{ flex: 1, gap: spacing.md }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>Overall attendance</Text><Text selectable accessibilityLabel={`Overall attendance ${summary.percentage} percent`} style={[typography.percentage, { color: percentageColor }]}>{summary.percentage}%</Text><AttendanceStatusBadge status={summary.status} explanation /></View><View style={{ flex: 1, gap: spacing.lg }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxl }}><Statistic value={String(summary.present)} label="Present" /><Statistic value={String(summary.absent)} label="Absent" /><Statistic value={String(summary.total)} label="Total sessions" /></View><Progress value={summary.percentage} label={`Required ${summary.threshold}%`} tone={summary.status === 'attention' ? 'warning' : summary.status} /></View></View></Card>;
}

const classStatus = {
  completed: { label: 'Completed', tone: 'neutral' as const },
  current: { label: 'Now', tone: 'info' as const },
  upcoming: { label: 'Upcoming', tone: 'neutral' as const },
};

export function TodayClassRow({ item, last = false }: { item: TodayClass; last?: boolean }) {
  const { colors } = useRollCallTheme(); const status = classStatus[item.status];
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.time}, ${item.subject}, ${status.label}${item.attendance ? `, ${item.attendance}` : ''}`} accessibilityHint="Opens subject attendance" onPress={() => router.push(`/student/subjects/${item.subjectId}` as Href)} style={({ pressed }) => ({ minHeight: 84, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, opacity: pressed ? 0.72 : 1 })}><View style={{ width: 72, gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{item.time}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.duration}</Text></View><View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}><Text numberOfLines={1} style={[typography.subheading, { color: colors.textPrimary }]}>{item.subject}</Text><Text numberOfLines={1} style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.code} · {item.lecturer}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.room ?? 'Room to be announced'}</Text></View><View style={{ alignItems: 'flex-end', gap: spacing.sm }}><Badge label={item.context ?? status.label} tone={status.tone} />{item.attendance ? <Text style={[typography.caption, { color: item.attendance === 'Present' ? colors.success : colors.error }]}>{item.attendance}</Text> : null}</View></Pressable>;
}

export function TodaySchedule({ classes }: { classes: TodayClass[] }) {
  return <Card style={{ paddingVertical: spacing.sm }}>{classes.map((item, index) => <TodayClassRow key={item.id} item={item} last={index === classes.length - 1} />)}</Card>;
}

export function NextClassCard({ item }: { item: TodayClass }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  return <View style={{ borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surface, padding: isCompact ? spacing.lg : spacing.xl, gap: spacing.md }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><Ionicons accessibilityElementsHidden name="time-outline" size={sizing.iconSm} color={colors.primary} /><Text style={[typography.label, { color: colors.primary }]}>{item.context ?? 'Next'} · {item.time}</Text></View><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.subject}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{item.lecturer}</Text><Text style={[typography.bodySmall, { color: colors.textMuted }]}>{item.room ?? 'Room to be announced'} · {item.duration}</Text></View>;
}

export function DailySummary({ classes }: { classes: TodayClass[] }) {
  const attended = classes.filter((item) => item.attendance === 'Present').length;
  const remaining = classes.filter((item) => item.status !== 'completed').length;
  return <Card><View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.xl }}><Statistic value={String(classes.length)} label="Classes today" /><Statistic value={String(attended)} label="Attended" /><Statistic value={String(remaining)} label="Remaining" /></View></Card>;
}

export function SubjectAttendanceRow({ item, last = false, pinned = false, onTogglePin }: { item: StudentSubject; last?: boolean; pinned?: boolean; onTogglePin?: () => void }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.code}, ${item.percentage} percent attendance, ${attendanceStatusCopy[item.status].label}${pinned ? ', pinned' : ''}`} accessibilityHint="Opens subject attendance" onPress={() => router.push(`/student/subjects/${item.id}` as Href)} style={({ pressed }) => ({ minHeight: isCompact ? 116 : 92, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: spacing.md, opacity: pressed ? 0.72 : 1 })}><View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.name}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.code} · {item.lecturer}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.present} Present · {item.absent} Absent · {item.total} Sessions</Text></View><View style={{ minWidth: isCompact ? undefined : 160, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><Text selectable style={[typography.statistic, { color: colors.textPrimary }]}>{item.percentage}%</Text><AttendanceStatusBadge status={item.status} />{onTogglePin ? <IconButton label={pinned ? `Unpin ${item.name}` : `Pin ${item.name}`} onPress={(event) => { event.stopPropagation(); onTogglePin(); }}><Ionicons name={pinned ? 'pin' : 'pin-outline'} size={sizing.iconSm} color={pinned ? colors.primary : colors.textMuted} /></IconButton> : null}<Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} /></View></Pressable>;
}

export function RecentActivityRow({ item, last = false }: { item: StudentRecentActivity; last?: boolean }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel={`${item.subject}, ${item.detail}, ${item.timestamp}`} style={{ minHeight: 70, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><View accessibilityElementsHidden style={{ width: 36, height: 36, borderRadius: radii.full, backgroundColor: item.status === 'updated' ? colors.warningSurface : colors.successSurface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={item.status === 'updated' ? 'refresh-outline' : 'checkmark'} size={sizing.iconMd} color={item.status === 'updated' ? colors.warning : colors.success} /></View><View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.subject}</Text><Text style={[typography.caption, { color: colors.textSecondary }]}>{item.detail}</Text></View><Text style={[typography.caption, { maxWidth: 92, textAlign: 'right', color: colors.textMuted }]}>{item.timestamp}</Text></View>;
}

const quickActions = [
  { label: 'Attendance', href: '/student/attendance', icon: 'checkbox-outline' },
  { label: "Today's Schedule", href: '/student/schedule', icon: 'calendar-outline' },
  { label: 'Notifications', href: '/student/notifications', icon: 'notifications-outline' },
  { label: 'Report Attendance Issue', href: '/student/attendance/report', icon: 'flag-outline' },
  { label: 'Search', href: '/student/search', icon: 'search-outline' },
] as const;

export function StudentQuickActions() {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel="Quick actions" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{quickActions.map((action) => <Button key={action.href} label={action.label} variant="secondary" icon={<Ionicons accessibilityElementsHidden name={action.icon} size={sizing.iconSm} color={colors.primary} />} onPress={() => router.push(action.href as Href)} style={{ flexGrow: 1 }} />)}</View>;
}

export function StudentHomeSkeleton() {
  const { width } = useResponsive(); const wide = width >= breakpoints.wide;
  return <View accessibilityLabel="Loading student home" style={{ gap: spacing.xxl }}><View style={{ gap: spacing.sm }}><Skeleton width="48%" height={30} /><Skeleton width="34%" /></View><View style={{ flexDirection: wide ? 'row' : 'column', gap: spacing.xl }}><View style={{ flex: 1 }}><Skeleton height={220} /></View><View style={{ width: wide ? 344 : '100%' }}><Skeleton height={220} /></View></View><Skeleton height={180} /><Skeleton height={260} /></View>;
}

export function SubjectsSkeleton() {
  return <View accessibilityLabel="Loading subjects" style={{ gap: spacing.md }}>{Array.from({ length: 4 }, (_, index) => <View key={index} style={{ gap: spacing.sm, paddingVertical: spacing.lg }}><Skeleton width="52%" height={22} /><Skeleton width="38%" /><Skeleton width="72%" /></View>)}</View>;
}
