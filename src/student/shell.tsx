import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/auth-provider';
import { Avatar, IconButton } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { AppShell, CompactHeader } from '@/shell/app-shell';
import { studentHomeData } from './student-data';
import { useStudentUtilities } from './utility-provider';
import { useStudentNotifications } from './notification-provider';
import { useStudentFinal } from './final-provider';

function studentNavigation(unreadCount: number) { return { primary: [
  { key: 'home', label: 'Home', href: '/student', allowedRoles: ['student'] },
  { key: 'attendance', label: 'Attendance', href: '/student/attendance', allowedRoles: ['student'] },
  { key: 'subjects', label: 'Subjects', href: '/student/subjects', allowedRoles: ['student'] },
  { key: 'schedule', label: 'Schedule', href: '/student/schedule', allowedRoles: ['student'] },
  { key: 'notifications', label: 'Notifications', href: '/student/notifications', allowedRoles: ['student'], badge: unreadCount || undefined },
] } as const; }

function AccountAction({ name, onPress }: { name: string; onPress: () => void }) {
  const { colors } = useRollCallTheme(); const { isExpanded } = useResponsive();
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open account menu for ${name}`} accessibilityHint="Opens profile, settings, support, and logout actions" onPress={onPress} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.full, paddingHorizontal: isExpanded ? spacing.sm : spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}><Avatar name={name} size="small" />{isExpanded ? <Text style={[typography.label, { color: colors.textSecondary }]}>Account</Text> : null}</Pressable>;
}

function NotificationAction() {
  const { colors } = useRollCallTheme(); const { unreadCount: count } = useStudentNotifications();
  return <View style={{ position: 'relative' }}><IconButton label={count ? `Open notifications, ${count} unread` : 'Open notifications, no unread notifications'} onPress={() => router.push('/student/notifications' as Href)}><Ionicons name="notifications-outline" size={sizing.iconMd} color={colors.textSecondary} /></IconButton>{count ? <View accessibilityElementsHidden style={{ position: 'absolute', top: 3, right: 2, minWidth: 18, height: 18, borderRadius: radii.full, paddingHorizontal: spacing.xs, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' }}><Text style={[typography.caption, { color: colors.textInverse, fontSize: 10 }]}>{count > 99 ? '99+' : count}</Text></View> : null}</View>;
}

function HeaderUtilities({ name }: { name: string }) {
  const { colors } = useRollCallTheme(); const { openAccountMenu } = useStudentUtilities();
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}><IconButton label="Open student search" onPress={() => router.push('/student/search' as Href)}><Ionicons name="search-outline" size={sizing.iconMd} color={colors.textSecondary} /></IconButton><NotificationAction /><AccountAction name={name} onPress={openAccountMenu} /></View>;
}

export function StudentShell({ activeKey, title, subtitle, back, backFallback = '/student', onBack, children, trailing }: { activeKey: string; title: string; subtitle?: string; back?: boolean; backFallback?: Href | string; onBack?: () => void; children: React.ReactNode; trailing?: React.ReactNode }) {
  const { session } = useAuth(); const navigation = useNavigation(); const { profile } = useStudentFinal(); const name = profile.displayName || session?.user.name || studentHomeData.student.name; const { unreadCount } = useStudentNotifications();
  const handleBack = () => { if (onBack) onBack(); else if (navigation.canGoBack()) navigation.goBack(); else router.replace(backFallback as Href); };
  return <AppShell navigation={studentNavigation(unreadCount)} activeKey={activeKey} role="student" header={<CompactHeader title={title} subtitle={subtitle} backAction={back ? handleBack : undefined} trailing={trailing ?? <HeaderUtilities name={name} />} />}>{session?.user.role === 'STUDENT' ? children : <StateView state="unauthorized" />}</AppShell>;
}
