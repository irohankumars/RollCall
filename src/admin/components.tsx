import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/auth-provider';
import { Avatar, IconButton } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { AppShell, CompactHeader } from '@/shell/app-shell';
import { AdaptiveUtilityMenu, UtilityMenuRow } from '@/lecturer/utility-components';
import { useAdminUtilities } from './utility-provider';

const navigation = { primary: [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'people', label: 'People', href: '/admin/people' },
  { key: 'academic', label: 'Academic', href: '/admin/academic' },
  { key: 'departments', label: 'Departments', href: '/admin/departments' },
  { key: 'invitations', label: 'Invitations', href: '/admin/invitations' },
], secondary: [{ key: 'workspace', label: 'Workspace', href: '/admin/workspace' }, { key: 'account', label: 'Settings', href: '/admin/settings' }] } as const;

function AccountAction({ name, onPress }: { name: string; onPress: () => void }) { const { colors } = useRollCallTheme(); const { isExpanded } = useResponsive(); return <Pressable accessibilityRole="button" accessibilityLabel={`Open account menu for ${name}`} onPress={onPress} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.full, paddingHorizontal: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? .72 : 1 })}><Avatar name={name} size="small" />{isExpanded ? <Text style={[typography.label, { color: colors.textSecondary }]}>Account</Text> : null}</Pressable>; }

export function AdminShell({ activeKey, title, subtitle, back, backFallback = '/admin', children, trailing }: { activeKey: string; title: string; subtitle?: string; back?: boolean; backFallback?: Href | string; children: React.ReactNode; trailing?: React.ReactNode }) {
  const { colors } = useRollCallTheme(); const { session } = useAuth(); const nav = useNavigation(); const utilities = useAdminUtilities(); const name = session?.user.name ?? 'College Admin';
  const headerActions = <View style={{ flexDirection: 'row', alignItems: 'center' }}><IconButton label="Search college workspace" onPress={() => router.push('/admin/search' as Href)}><Ionicons name="search-outline" size={sizing.iconMd} color={colors.textSecondary} /></IconButton><IconButton label="Open management quick actions" onPress={utilities.openQuickActions}><Ionicons name="add-circle-outline" size={sizing.iconLg} color={colors.primary} /></IconButton><AccountAction name={name} onPress={utilities.openAccountMenu} /></View>;
  const handleBack = () => nav.canGoBack() ? nav.goBack() : router.replace(backFallback as Href);
  return <AppShell navigation={navigation} activeKey={activeKey} role="college-admin" header={<CompactHeader title={title} subtitle={subtitle} backAction={back ? handleBack : undefined} trailing={trailing ?? headerActions} />}>{children}</AppShell>;
}

export function AdminOverlays() {
  const { session, logout } = useAuth(); const utilities = useAdminUtilities(); const name = session?.user.name ?? 'College Admin';
  const closeAndGo = (href: string, menu: 'quick' | 'account') => { if (menu === 'quick') utilities.closeQuickActions(); else utilities.closeAccountMenu(); router.push(href as Href); };
  return <>
    <AdaptiveUtilityMenu visible={utilities.quickActionsOpen} title="Quick actions" onDismiss={utilities.closeQuickActions}>
      <UtilityMenuRow icon="business-outline" title="Add Department" onPress={() => closeAndGo('/admin/departments/new', 'quick')} />
      <UtilityMenuRow icon="person-add-outline" title="Add HOD" onPress={() => closeAndGo('/admin/hods/new', 'quick')} />
      <UtilityMenuRow icon="person-add-outline" title="Add Lecturer" onPress={() => closeAndGo('/admin/lecturers/new', 'quick')} />
      <UtilityMenuRow icon="person-add-outline" title="Add Student" onPress={() => closeAndGo('/admin/students/new', 'quick')} />
      <UtilityMenuRow icon="cloud-upload-outline" title="Import Students" onPress={() => closeAndGo('/admin/students/import', 'quick')} />
      <UtilityMenuRow icon="book-outline" title="Add Subject" onPress={() => closeAndGo('/admin/subjects/new', 'quick')} />
      <UtilityMenuRow icon="school-outline" title="Create Class" onPress={() => closeAndGo('/admin/classes/new', 'quick')} />
      <UtilityMenuRow icon="mail-outline" title="View Invitations" onPress={() => closeAndGo('/admin/invitations', 'quick')} />
      <UtilityMenuRow icon="checkmark-done-outline" title="View Attendance" onPress={() => closeAndGo('/admin/attendance', 'quick')} />
      <UtilityMenuRow icon="alert-circle-outline" title="Review Attendance Issues" onPress={() => closeAndGo('/admin/attendance/issues', 'quick')} />
      <UtilityMenuRow icon="calendar-outline" title="View Schedule" onPress={() => closeAndGo('/admin/schedule', 'quick')} />
      <UtilityMenuRow icon="document-text-outline" title="View Reports" onPress={() => closeAndGo('/admin/reports', 'quick')} />
      <UtilityMenuRow icon="notifications-outline" title="Create Notification" onPress={() => closeAndGo('/admin/notifications/new', 'quick')} />
    </AdaptiveUtilityMenu>
    <AdaptiveUtilityMenu visible={utilities.accountMenuOpen} title="Account" onDismiss={utilities.closeAccountMenu}>
      <UtilityMenuRow icon="person-circle-outline" title="Profile" detail={name} onPress={() => closeAndGo('/admin/profile', 'account')} />
      <UtilityMenuRow icon="pulse-outline" title="Activity" onPress={() => closeAndGo('/admin/activity', 'account')} />
      <UtilityMenuRow icon="settings-outline" title="Settings" onPress={() => closeAndGo('/admin/settings', 'account')} />
      <UtilityMenuRow icon="help-circle-outline" title="Help & Support" onPress={() => closeAndGo('/admin/settings/help', 'account')} />
      <UtilityMenuRow icon="log-out-outline" title="Sign out" destructive onPress={() => { utilities.closeAccountMenu(); void logout(); }} />
    </AdaptiveUtilityMenu>
  </>;
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) { const { colors } = useRollCallTheme(); return <View style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>{title}</Text>{action ? <Pressable accessibilityRole="button" onPress={onAction}><Text style={[typography.label, { color: colors.primary }]}>{action}</Text></Pressable> : null}</View>; }
