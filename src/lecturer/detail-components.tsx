import React from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceStatusIndicator } from '@/design-system/components/attendance';
import { Avatar, Badge, Button, IconButton } from '@/design-system/components/core';
import { Skeleton } from '@/design-system/components/states';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import type { LecturerClass, LecturerStudent, SessionSummary } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function sessionDate(value: string) {
  return new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function nextSession(value: string | null) {
  return value ? new Date(value).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not scheduled';
}

export function ClassDetailHeader({ item }: { item: LecturerClass }) {
  const { colors } = useRollCallTheme();
  return <View style={{ gap: spacing.sm }}>
    <Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>{item.subjectName}</Text>
    <Text style={[typography.subheading, { color: colors.textSecondary }]}>{item.subjectCode} · {item.batchName}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md }}>
      <Text style={[typography.bodySmall, { color: colors.textMuted }]}>{item.semester}</Text>
      <Text accessibilityLabel={`${item.studentCount} students`} style={[typography.bodySmall, { color: colors.textMuted }]}>{item.studentCount} students</Text>
      {item.requiresAttendance ? <Badge label="Attendance due" tone="warning" /> : null}
    </View>
  </View>;
}

function InformationRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const { colors } = useRollCallTheme();
  return <View style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
    <View accessibilityElementsHidden style={{ width: 36, height: 36, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSecondary }}><Ionicons name={icon} size={sizing.iconMd} color={colors.primary} /></View>
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text><Text style={[typography.body, { color: colors.textPrimary }]}>{value}</Text></View>
  </View>;
}

export function ClassInformation({ item }: { item: LecturerClass }) {
  return <View>
    <InformationRow icon="calendar-outline" label="Schedule" value={item.schedule} />
    <InformationRow icon="time-outline" label="Next session" value={nextSession(item.nextSessionAt)} />
    <InformationRow icon="school-outline" label="Teaching group" value={`${item.batchName}, ${item.semester}`} />
  </View>;
}

export function ClassAttendanceSummary({ percentage, students, completedSessions }: { percentage: number | null; students: number; completedSessions: number }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel={percentage === null ? 'No attendance data yet' : `Class attendance ${percentage} percent`} style={{ borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surface, padding: spacing.xl, gap: spacing.lg }}>
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.percentage, { color: percentage === null ? colors.textMuted : colors.textPrimary }]}>{percentage === null ? 'N/A' : `${percentage}%`}</Text>
      <Text style={[typography.label, { color: colors.textSecondary }]}>Class attendance</Text>
    </View>
    <View style={{ flexDirection: 'row', gap: spacing.giant }}>
      <View style={{ gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{students}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Students</Text></View>
      <View style={{ gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{completedSessions}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Completed sessions</Text></View>
    </View>
    {percentage === null ? <Text style={[typography.bodySmall, { color: colors.textMuted }]}>Attendance will appear after the first completed session.</Text> : null}
  </View>;
}

export function StudentAccessRow({ classId, count }: { classId: string; count: number }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${count} students`} accessibilityHint="Opens the student roster for this class" onPress={() => router.push(`/lecturer/classes/${classId}/students` as Href)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 72, borderRadius: radii.md, borderWidth: 2, borderColor: focused ? colors.focusRing : 'transparent', marginHorizontal: -spacing.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.76 : 1 })}>
    <View accessibilityElementsHidden style={{ width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.infoSurface }}><Ionicons name="people-outline" size={sizing.iconMd} color={colors.primary} /></View>
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>Students</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{count} enrolled</Text></View>
    <Text style={[typography.label, { color: colors.primary }]}>View students</Text>
    <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} />
  </Pressable>;
}

export function RecentSessionRow({ item }: { item: SessionSummary }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const [focused, setFocused] = React.useState(false); const percentage = item.total ? Math.round(item.present * 100 / item.total) : 0;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${sessionDate(item.scheduledAt)}, ${item.present} of ${item.total} present, ${percentage} percent`} accessibilityHint="Opens the attendance session" onPress={() => router.push(`/lecturer/attendance/${item.id}` as Href)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 68, paddingVertical: spacing.md, paddingHorizontal: spacing.md, marginHorizontal: -spacing.md, borderRadius: radii.sm, borderWidth: 2, borderColor: focused ? colors.focusRing : 'transparent', borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.76 : 1 })}>
    <View style={{ width: 58 }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{sessionDate(item.scheduledAt)}</Text></View>
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.subjectName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.present} / {item.total} present{isCompact ? ' · Completed' : ''}</Text></View>
    <Text style={[typography.numeric, { color: colors.textSecondary }]}>{percentage}%</Text>
    {isCompact ? null : <Badge label="Completed" tone="success" />}
    <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} />
  </Pressable>;
}

export function StudentSearch({ value, onChangeText, ...props }: { value: string; onChangeText: (value: string) => void } & Omit<TextInputProps, 'value' | 'onChangeText'>) {
  const { colors } = useRollCallTheme();
  return <View style={{ minHeight: sizing.inputHeight, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md, overflow: 'hidden' }}>
    <Ionicons accessibilityElementsHidden name="search" size={sizing.iconMd} color={colors.textMuted} />
    <TextInput {...props} accessibilityLabel="Search students" placeholder="Search name or student ID" placeholderTextColor={colors.textMuted} value={value} onChangeText={onChangeText} returnKeyType="search" style={[typography.body, { flex: 1, minHeight: sizing.inputHeight, paddingHorizontal: spacing.md, color: colors.textPrimary }, props.style]} />
    {value ? <IconButton label="Clear student search" onPress={() => onChangeText('')}><Ionicons name="close-circle" size={sizing.iconMd} color={colors.textMuted} /></IconButton> : null}
  </View>;
}

export function StudentRosterRow({ item, classId }: { item: LecturerStudent; classId: string }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.rollNumber}, attendance ${item.attendancePercentage} percent`} accessibilityHint="Opens student attendance details" onPress={() => router.push(`/lecturer/classes/${classId}/students/${item.id}` as Href)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 76, paddingVertical: spacing.md, paddingHorizontal: spacing.md, marginHorizontal: -spacing.md, borderRadius: radii.sm, borderWidth: 2, borderColor: focused ? colors.focusRing : 'transparent', borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.76 : 1 })}>
    <Avatar name={item.name} size="small" />
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.name}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.rollNumber}</Text>{isCompact ? <View style={{ marginTop: spacing.xs }}><AttendanceStatusIndicator status={item.attendanceStatus} /></View> : null}</View>
    <View style={{ minWidth: 58, alignItems: 'flex-end', gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{item.attendancePercentage}%</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Attendance</Text></View>
    {isCompact ? null : <View style={{ width: 164 }}><AttendanceStatusIndicator status={item.attendanceStatus} /></View>}
    <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} />
  </Pressable>;
}

export function DetailPageSkeleton({ rows = 3 }: { rows?: number }) {
  return <View accessibilityLabel="Loading class information" style={{ gap: spacing.xxl }}>
    <View style={{ gap: spacing.sm }}><Skeleton width="56%" height={34} /><Skeleton width="38%" height={18} /><Skeleton width="30%" /></View>
    <View style={{ gap: spacing.md }}><Skeleton width="26%" height={20} />{Array.from({ length: rows }, (_, index) => <View key={index} style={{ paddingVertical: spacing.md, gap: spacing.sm }}><Skeleton width="44%" height={16} /><Skeleton width="72%" /></View>)}</View>
  </View>;
}

export function AttendanceAction({ classId }: { classId: string }) {
  return <Button label="Start attendance" onPress={() => router.push(`/lecturer/classes/${classId}/attendance` as Href)} />;
}
