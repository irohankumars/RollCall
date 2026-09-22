import React from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { router, type Href, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, Button, IconButton } from '@/design-system/components/core';
import { Skeleton, StateView } from '@/design-system/components/states';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { AppShell, CompactHeader } from '@/shell/app-shell';
import { useAuth } from '@/auth/auth-provider';
import type { AuthApiError } from '@/auth/types';
import type { LecturerClass, SessionSummary } from './types';
import { useLecturerUtilities } from './utility-provider';
import { lecturerAccessFor } from './access';
import { useLecturerNotifications } from './notification-provider';

function lecturerNavigation(isClassTeacher: boolean, unreadCount: number) { return { primary: [{ key: 'today', label: 'Today', href: '/lecturer' }, { key: 'classes', label: 'Classes', href: '/lecturer/classes' }, ...(isClassTeacher ? [{ key: 'class-teacher', label: 'My class', href: '/lecturer/class-teacher' }] : []), { key: 'history', label: 'History', href: '/lecturer/history' }, { key: 'notifications', label: 'Notifications', href: '/lecturer/notifications', badge: unreadCount || undefined }] } as const; }

function AccountAction({ name, onPress }: { name: string; onPress: () => void }) {
  const { colors } = useRollCallTheme(); const { isExpanded } = useResponsive(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open account menu for ${name}`} accessibilityHint="Opens profile, settings, support, and sign out actions" onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.full, paddingHorizontal: isExpanded ? spacing.sm : spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}><Avatar name={name} size="small" />{isExpanded ? <Text style={[typography.label, { color: colors.textSecondary }]}>Account</Text> : null}</Pressable>;
}

function HeaderUtilities({ name }: { name: string }) {
  const { colors } = useRollCallTheme();
  const { openQuickActions, openAccountMenu } = useLecturerUtilities();
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <IconButton label="Open global search" onPress={() => router.push('/lecturer/search' as Href)}><Ionicons name="search-outline" size={sizing.iconMd} color={colors.textSecondary} /></IconButton>
    <IconButton label="Open quick actions" onPress={openQuickActions}><Ionicons name="add-circle-outline" size={sizing.iconLg} color={colors.primary} /></IconButton>
    <AccountAction name={name} onPress={openAccountMenu} />
  </View>;
}

export function LecturerShell({ activeKey, title, subtitle, back, backFallback = '/lecturer', onBack, children, trailing }: { activeKey: string; title: string; subtitle?: string; back?: boolean; backFallback?: Href; onBack?: () => void; children: React.ReactNode; trailing?: React.ReactNode }) {
  const { session } = useAuth(); const navigation = useNavigation(); const name = session?.user.name ?? 'Lecturer';
  const { unreadCount } = useLecturerNotifications(); const access = lecturerAccessFor(session?.user);
  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (navigation.canGoBack()) { navigation.goBack(); return; }
    router.replace(backFallback);
  };
  return <AppShell navigation={lecturerNavigation(access.isClassTeacher, unreadCount)} activeKey={activeKey} role="lecturer" header={<CompactHeader title={title} subtitle={subtitle} backAction={back ? handleBack : undefined} trailing={trailing ?? <HeaderUtilities name={name} />} />}>{session?.user.role === 'LECTURER' ? children : <StateView state="unauthorized" />}</AppShell>;
}

export function ResourceState({ loading, error, retry }: { loading: boolean; error?: AuthApiError; retry: () => void }) { if (loading) return <StateView state="loading" />; if (error) return <StateView state={error.code === 'NETWORK_ERROR' ? 'offline' : error.code === 'UNAUTHORIZED' ? 'session-expired' : error.status === 403 ? 'unauthorized' : 'error'} message={error.message} onRetry={retry} />; return null; }
export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) { const { colors } = useRollCallTheme(); return <View style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>{title}</Text>{action ? <Button label={action} variant="text" onPress={onAction} /> : null}</View>; }

function formatClassTime(value: string | null) { return value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Schedule unavailable'; }
function formatClassDay(value: string | null) { return value ? new Date(value).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'No upcoming date'; }

export function ClassRow({ item }: { item: LecturerClass }) {
  const { colors } = useRollCallTheme(); const next = item.nextSessionAt ? new Date(item.nextSessionAt).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : item.schedule;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.subjectName}, ${item.batchName}`} accessibilityHint="Opens class details" onPress={() => router.push(`/lecturer/classes/${item.id}` as Href)} style={({ pressed }) => ({ minHeight: 72, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.68 : 1 })}><View style={{ flex: 1, gap: spacing.xs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.subjectCode} · {item.subjectName}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.batchName} · {item.semester}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{next} · {item.studentCount} students</Text></View>{item.requiresAttendance ? <Badge label="Attendance due" tone="warning" /> : <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} />}</Pressable>;
}

export function NextClassPanel({ item }: { item: LecturerClass }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  return <View style={{ borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surface, padding: isCompact ? spacing.lg : spacing.xl, gap: spacing.lg }}><View style={{ flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: spacing.lg }}><View style={{ flex: 1, gap: spacing.sm }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><Ionicons accessibilityElementsHidden name="time-outline" size={sizing.iconSm} color={colors.primary} /><Text style={[typography.label, { color: colors.primary }]}>Next class · {formatClassTime(item.nextSessionAt)}</Text></View><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.subjectName}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{item.subjectCode} · {item.batchName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.schedule}</Text></View><Button label="Start attendance" onPress={() => router.push(`/lecturer/classes/${item.id}/attendance` as Href)} style={isCompact ? { width: '100%' } : undefined} /></View></View>;
}

export function TodayClassRow({ item }: { item: LecturerClass }) {
  const { colors } = useRollCallTheme(); const current = item.requiresAttendance; const status = current ? 'Attendance due' : 'Scheduled';
  return <Pressable accessibilityRole="button" accessibilityLabel={`${formatClassTime(item.nextSessionAt)}, ${item.subjectName}, ${item.batchName}, ${status}`} accessibilityHint="Opens class details" onPress={() => router.push(`/lecturer/classes/${item.id}` as Href)} style={({ pressed }) => ({ minHeight: 76, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, opacity: pressed ? 0.68 : 1 })}><View style={{ width: 68 }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{formatClassTime(item.nextSessionAt)}</Text></View><View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.subjectName}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.subjectCode} · {item.batchName}</Text></View><Badge label={status} tone={current ? 'info' : 'neutral'} /><Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} /></Pressable>;
}

export function ActivityRow({ item }: { item: SessionSummary }) {
  const { colors } = useRollCallTheme(); const percentage = item.total ? Math.round(item.present * 100 / item.total) : 0;
  return <View accessibilityLabel={`${item.subjectName}, attendance completed, ${item.present} of ${item.total} present`} style={{ paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}><View accessibilityElementsHidden style={{ width: 36, height: 36, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successSurface }}><Ionicons name="checkmark" size={sizing.iconMd} color={colors.success} /></View><View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.subjectCode} · {item.batchName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{new Date(item.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · Attendance completed</Text></View><Text style={[typography.numeric, { color: colors.textSecondary }]}>{percentage}%</Text></View>;
}

export function LecturerClassRow({ item }: { item: LecturerClass }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={`${item.subjectName}, ${item.batchName}, ${item.studentCount} students`} accessibilityHint="Opens class details" onPress={() => router.push(`/lecturer/classes/${item.id}` as Href)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 92, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, marginHorizontal: -spacing.md, borderRadius: radii.sm, borderWidth: 2, borderColor: focused ? colors.focusRing : 'transparent', borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: isCompact ? spacing.md : spacing.xl, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.76 : 1 })}><View style={{ flex: 1, gap: spacing.xs }}><Text style={[typography.heading, { color: colors.textPrimary }]}>{item.subjectName}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.subjectCode} · {item.batchName} · {item.semester}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.schedule}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl }}><View style={{ gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{item.studentCount}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Students</Text></View><View style={{ gap: spacing.xxs }}><Text style={[typography.numeric, { color: colors.textPrimary }]}>{item.completedSessions}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Sessions</Text></View><View style={{ minWidth: 92, alignItems: 'flex-end', gap: spacing.xxs }}><Text style={[typography.label, { color: colors.primary }]}>{formatClassDay(item.nextSessionAt)}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{formatClassTime(item.nextSessionAt)}</Text></View><Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} /></View></Pressable>;
}

export function ClassSearch({ value, onChangeText, ...props }: { value: string; onChangeText: (value: string) => void } & Omit<TextInputProps, 'value' | 'onChangeText'>) {
  const { colors } = useRollCallTheme();
  return <View style={{ minHeight: sizing.inputHeight, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md, overflow: 'hidden' }}><Ionicons accessibilityElementsHidden name="search" size={sizing.iconMd} color={colors.textMuted} /><TextInput {...props} accessibilityLabel="Search classes" placeholder="Search subject or class" placeholderTextColor={colors.textMuted} value={value} onChangeText={onChangeText} returnKeyType="search" style={[typography.body, { flex: 1, minHeight: sizing.inputHeight, paddingHorizontal: spacing.md, color: colors.textPrimary }, props.style]} />{value ? <IconButton label="Clear class search" onPress={() => onChangeText('')}><Ionicons name="close-circle" size={sizing.iconMd} color={colors.textMuted} /></IconButton> : null}</View>;
}

export function LecturerPageSkeleton({ rows = 3 }: { rows?: number }) {
  return <View accessibilityLabel="Loading lecturer information" style={{ gap: spacing.xl }}><View style={{ gap: spacing.sm }}><Skeleton width="34%" height={14} /><Skeleton width="62%" height={28} /><Skeleton width="48%" height={16} /></View><View style={{ padding: spacing.xl, gap: spacing.md }}><Skeleton width="30%" height={14} /><Skeleton width="74%" height={26} /><Skeleton width="52%" /></View><View style={{ gap: spacing.lg }}>{Array.from({ length: rows }, (_, index) => <View key={index} style={{ gap: spacing.sm, paddingVertical: spacing.md }}><Skeleton width="66%" height={20} /><Skeleton width="44%" /><Skeleton width="82%" height={12} /></View>)}</View></View>;
}
