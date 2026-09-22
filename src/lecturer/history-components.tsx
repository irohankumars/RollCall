import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import type { AttendanceMark, LecturerStudent, SessionSummary } from './types';

export type HistoryRange = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';
export type SessionAttendanceFilter = 'ALL' | 'PRESENT' | 'ABSENT';

const historyRanges: { label: string; value: HistoryRange }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Today', value: 'TODAY' },
  { label: 'This week', value: 'WEEK' },
  { label: 'This month', value: 'MONTH' },
];

export function HistoryRangeControl({ value, onChange }: { value: HistoryRange; onChange: (value: HistoryRange) => void }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityRole="radiogroup" accessibilityLabel="Attendance history time range" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{historyRanges.map((range) => {
    const selected = value === range.value;
    return <Pressable key={range.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => onChange(range.value)} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.full, borderWidth: 1, borderColor: selected ? colors.primary : colors.borderSubtle, backgroundColor: selected ? colors.infoSurface : pressed ? colors.surfaceSecondary : colors.surface, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.76 : 1 })}><Text style={[typography.label, { color: selected ? colors.primary : colors.textSecondary }]}>{range.label}</Text></Pressable>;
  })}</View>;
}

const sessionFilters: { label: string; value: SessionAttendanceFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Present', value: 'PRESENT' },
  { label: 'Absent', value: 'ABSENT' },
];

export function SessionAttendanceFilterControl({ value, onChange }: { value: SessionAttendanceFilter; onChange: (value: SessionAttendanceFilter) => void }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityRole="radiogroup" accessibilityLabel="Session attendance filters" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{sessionFilters.map((filter) => {
    const selected = value === filter.value;
    return <Pressable key={filter.value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => onChange(filter.value)} style={({ pressed }) => ({ minHeight: sizing.touchTarget, minWidth: 84, borderRadius: radii.full, borderWidth: 1, borderColor: selected ? colors.primary : colors.borderSubtle, backgroundColor: selected ? colors.infoSurface : pressed ? colors.surfaceSecondary : colors.surface, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.76 : 1 })}><Text style={[typography.label, { color: selected ? colors.primary : colors.textSecondary }]}>{filter.label}</Text></Pressable>;
  })}</View>;
}

export function HistorySessionRow({ item, onPress }: { item: SessionSummary; onPress: () => void }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const [focused, setFocused] = React.useState(false);
  const date = new Date(item.scheduledAt);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.subjectName}, ${item.batchName}, ${date.toLocaleDateString()}, ${item.present} present, ${item.absent} absent, completed`} accessibilityHint="Opens the read-only session detail" onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 96, marginHorizontal: -spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.lg, borderRadius: radii.sm, borderWidth: 2, borderColor: focused ? colors.focusRing : 'transparent', borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: isCompact ? spacing.md : spacing.xl, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.76 : 1 })}>
    <View style={{ minWidth: isCompact ? undefined : 70, gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{date.toLocaleDateString([], { day: 'numeric', month: 'short' })}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text></View>
    <View style={{ flex: 1, gap: spacing.xs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.subjectName}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.subjectCode} · {item.batchName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.present} present · {item.absent} absent · {item.total} students</Text></View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: isCompact ? 'space-between' : 'flex-end', gap: spacing.md }}><Badge label="Completed" tone="success" /><Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} /></View>
  </Pressable>;
}

export function HistoricalAttendanceRow({ item, status }: { item: LecturerStudent; status: AttendanceMark }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel={`${item.name}, ${item.rollNumber}, ${status === 'PRESENT' ? 'Present' : 'Absent'}`} style={{ minHeight: 68, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
    <Avatar name={item.name} size="small" />
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.name}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.rollNumber}</Text></View>
    <Badge label={status === 'PRESENT' ? 'Present' : 'Absent'} tone={status === 'PRESENT' ? 'success' : 'error'} />
  </View>;
}
