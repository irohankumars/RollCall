import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import type { AcademicEventCategory, ScheduleClassStatus, StudentAcademicEvent, StudentAcademicInfo, StudentNotification, StudentNotificationCategory, StudentScheduleClass } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const categoryCopy: Record<StudentNotificationCategory, { label: string; tone: 'info' | 'warning' | 'success' | 'neutral' | 'error'; icon: IconName }> = {
  ATTENDANCE: { label: 'Attendance', tone: 'success', icon: 'checkbox-outline' },
  ATTENDANCE_ISSUE: { label: 'Attendance Issue', tone: 'warning', icon: 'alert-circle-outline' },
  ACADEMIC: { label: 'Academic', tone: 'info', icon: 'school-outline' },
  SYSTEM: { label: 'System', tone: 'neutral', icon: 'settings-outline' },
  IMPORTANT: { label: 'Important', tone: 'error', icon: 'flag-outline' },
};

export function NotificationCategory({ category }: { category: StudentNotificationCategory }) {
  const copy = categoryCopy[category];
  return <Badge label={copy.label} tone={copy.tone} />;
}

export function NotificationRow({ item, onOpen, onMarkRead }: { item: StudentNotification; onOpen: () => void; onMarkRead: () => void }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const copy = categoryCopy[item.category];
  const timestamp = new Date(item.timestamp).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  return <View style={{ borderRadius: radii.lg, borderWidth: 1, borderColor: item.unread ? colors.border : colors.borderSubtle, backgroundColor: item.unread ? colors.infoSurface : colors.surface, overflow: 'hidden' }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.unread ? 'Unread' : 'Read'} ${copy.label} notification. ${item.title}. ${item.preview}. ${timestamp}`} accessibilityHint="Opens notification details" onPress={onOpen} style={({ pressed }) => ({ minHeight: isCompact ? 132 : 112, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, opacity: pressed ? 0.72 : 1 })}>
      <View accessibilityElementsHidden style={{ width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={copy.icon} size={sizing.iconMd} color={item.category === 'IMPORTANT' ? colors.error : colors.primary} /></View>
      <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><Text numberOfLines={1} style={[typography.subheading, { flex: 1, color: colors.textPrimary }]}>{item.title}</Text>{item.unread ? <View accessibilityElementsHidden style={{ width: 8, height: 8, borderRadius: radii.full, backgroundColor: colors.primary }} /> : null}</View><Text numberOfLines={2} style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.preview}</Text><View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm }}><NotificationCategory category={item.category} />{item.priority === 'HIGH' ? <Badge label="High priority" tone="error" /> : null}<Text style={[typography.caption, { color: colors.textMuted }]}>{timestamp}</Text></View></View>
      <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} />
    </Pressable>
    {item.unread ? <Pressable accessibilityRole="button" accessibilityLabel={`Mark ${item.title} as read`} onPress={onMarkRead} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderTopWidth: 1, borderTopColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}><Text style={[typography.label, { color: colors.primary }]}>Mark as read</Text></Pressable> : null}
  </View>;
}

const scheduleStatusCopy: Record<ScheduleClassStatus, { label: string; tone: 'neutral' | 'info' | 'warning' }> = {
  completed: { label: 'Completed', tone: 'neutral' },
  current: { label: 'Current', tone: 'info' },
  next: { label: 'Next', tone: 'warning' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
};

export function ScheduleStatus({ status }: { status: ScheduleClassStatus }) { const copy = scheduleStatusCopy[status]; return <Badge label={copy.label} tone={copy.tone} />; }

export function ScheduleClassRow({ item, onPress, last = false, compact = false }: { item: StudentScheduleClass; onPress: () => void; last?: boolean; compact?: boolean }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const stacked = isCompact || compact;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.startTime} to ${item.endTime}, ${item.subject}, ${scheduleStatusCopy[item.status].label}, ${item.room ?? 'Room to be announced'}`} accessibilityHint="Opens class details" onPress={onPress} style={({ pressed }) => ({ minHeight: stacked ? 112 : 86, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: stacked ? 'column' : 'row', alignItems: stacked ? 'stretch' : 'center', gap: spacing.md, opacity: pressed ? 0.72 : 1 })}>
    <View style={{ width: stacked ? undefined : 118, flexDirection: stacked ? 'row' : 'column', justifyContent: stacked ? 'space-between' : undefined, gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{item.startTime}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.endTime}</Text></View>
    <View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.subject}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.code} · {item.lecturer}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.room ?? 'Room to be announced'}</Text></View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><ScheduleStatus status={item.status} /><Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} /></View>
  </Pressable>;
}

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function ScheduleDaySelector({ weekStart, selectedDate, onSelect }: { weekStart: Date; selectedDate: string; onSelect: (date: string) => void }) {
  const { colors } = useRollCallTheme(); const today = '2026-09-21';
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + index); return { key: dateKey(date), weekday: date.toLocaleDateString([], { weekday: 'short' }), day: date.getDate() }; });
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} accessibilityLabel="Schedule days">{days.map((day) => { const selected = day.key === selectedDate; const current = day.key === today; return <Pressable key={day.key} accessibilityRole="radio" accessibilityLabel={`${day.weekday}, ${day.day}${current ? ', Today' : ''}`} accessibilityState={{ selected, checked: selected }} onPress={() => onSelect(day.key)} style={({ pressed }) => ({ width: 64, minHeight: 72, borderRadius: radii.md, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.primary : colors.borderSubtle, backgroundColor: selected || pressed ? colors.surfaceSecondary : colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, opacity: pressed ? 0.72 : 1 })}><Text style={[typography.caption, { color: selected ? colors.primary : colors.textMuted }]}>{day.weekday}</Text><Text style={[typography.heading, { color: selected ? colors.primary : colors.textPrimary }]}>{day.day}</Text>{current ? <Text style={[typography.caption, { color: colors.primary }]}>Today</Text> : null}</Pressable>; })}</ScrollView>;
}

export function MetadataList({ rows }: { rows: { label: string; value: string }[] }) {
  const { colors } = useRollCallTheme();
  return <Card>{rows.map((row, index) => <View key={row.label} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderBottomWidth: index === rows.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}><Text style={[typography.bodySmall, { flex: 1, color: colors.textMuted }]}>{row.label}</Text><Text style={[typography.label, { flex: 1, textAlign: 'right', color: colors.textPrimary }]}>{row.value}</Text></View>)}</Card>;
}

export function AcademicInfoCard({ info }: { info: StudentAcademicInfo }) {
  return <MetadataList rows={[{ label: 'Department', value: info.department }, { label: 'Programme', value: info.programme }, { label: 'Semester', value: info.semester }, { label: 'Academic year', value: info.academicYear }, { label: 'Batch', value: info.batch }, { label: 'Current period', value: info.currentPeriod }]} />;
}

const eventCategoryCopy: Record<AcademicEventCategory, { label: string; tone: 'info' | 'warning' | 'neutral' | 'success' }> = {
  EXAM: { label: 'Exam', tone: 'warning' }, ACADEMIC: { label: 'Academic', tone: 'info' }, INSTITUTIONAL: { label: 'Institutional', tone: 'neutral' }, MILESTONE: { label: 'Milestone', tone: 'success' },
};
export function AcademicEventCategoryBadge({ category }: { category: AcademicEventCategory }) { const copy = eventCategoryCopy[category]; return <Badge label={copy.label} tone={copy.tone} />; }

export function AcademicEventRow({ item, onPress, last = false }: { item: StudentAcademicEvent; onPress: () => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const date = new Date(`${item.date}T12:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}, ${eventCategoryCopy[item.category].label}, ${date}${item.time ? `, ${item.time}` : ''}`} accessibilityHint="Opens academic event details" onPress={onPress} style={({ pressed }) => ({ minHeight: 94, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.72 : 1 })}><View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.title}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{date}{item.time ? ` · ${item.time}` : ''}</Text><AcademicEventCategoryBadge category={item.category} /></View><Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} /></Pressable>;
}
