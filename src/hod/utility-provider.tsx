import React, { createContext, useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, usePathname } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { AuthApiError } from '@/auth/types';
import { Avatar, Button } from '@/design-system/components/core';
import { Confirmation } from '@/design-system/components/feedback';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useGlobalOverlays } from '@/shell/overlay-provider';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useHodProfile } from './profile-provider';
import type { LecturerClass } from '@/lecturer/types';
import { AdaptiveUtilityMenu, UtilityMenuLoading, UtilityMenuRow } from '@/lecturer/utility-components';

type HodUtilitiesValue = { openQuickActions: () => void; openAccountMenu: () => void; requestLogout: () => void };
const HodUtilitiesContext = createContext<HodUtilitiesValue | null>(null);

export function HodUtilityProvider({ children }: React.PropsWithChildren) {
  const { colors } = useRollCallTheme();
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const { profile } = useHodProfile();
  const overlays = useGlobalOverlays();
  const [menu, setMenu] = useState<'quick' | 'account' | null>(null);
  const [classes, setClasses] = useState<LecturerClass[]>();
  const [classError, setClassError] = useState<AuthApiError>();
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const token = session?.token ?? '';

  React.useEffect(() => {
    if (process.env.EXPO_OS !== 'web') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      if (pathname === '/hod/search') globalThis.window?.dispatchEvent(new Event('rollcall-focus-search'));
      else router.push('/hod/search' as Href);
    };
    globalThis.window?.addEventListener('keydown', onKeyDown);
    return () => globalThis.window?.removeEventListener('keydown', onKeyDown);
  }, [pathname]);

  React.useEffect(() => {
    if (!session?.expiresAt) return;
    const warningAt = Date.parse(session.expiresAt) - Date.now() - 5 * 60 * 1000;
    if (warningAt <= 0 || warningAt > 2_147_000_000) return;
    const timer = setTimeout(() => overlays.showAlert({ title: 'Session ending soon', message: 'Your session will expire in about five minutes. Save any changes before signing in again.' }), warningAt);
    return () => clearTimeout(timer);
  }, [overlays, session?.expiresAt]);

  const loadClasses = useCallback(async () => {
    setLoadingClasses(true); setClassError(undefined);
    try { setClasses(await lecturerClient.classes(token)); }
    catch (reason) { setClassError(reason instanceof AuthApiError ? reason : new AuthApiError('SERVER_ERROR', 'Quick actions could not be loaded.')); }
    finally { setLoadingClasses(false); }
  }, [token]);

  const openQuickActions = () => { setMenu('quick'); void loadClasses(); };
  const openAccountMenu = () => setMenu('account');
  const navigate = (href: Href) => { setMenu(null); router.push(href); };
  const preferredClass = classes?.find((item) => item.requiresAttendance) ?? classes?.[0];
  const signOut = async () => {
    setConfirmLogout(false); overlays.setLoading(true);
    try { await logout(); }
    catch { overlays.showAlert({ title: "Couldn't sign out", message: 'Try again. Your local session remains protected.' }); }
    finally { overlays.setLoading(false); }
  };

  return <HodUtilitiesContext value={{ openQuickActions, openAccountMenu, requestLogout: () => setConfirmLogout(true) }}>
    {children}
    <AdaptiveUtilityMenu visible={menu === 'quick'} title="Quick actions" onDismiss={() => setMenu(null)}>
      {loadingClasses ? <UtilityMenuLoading label="Loading actions" /> : null}
      {!loadingClasses && classError ? <View style={{ gap: spacing.md, padding: spacing.md }}><Text accessibilityRole="alert" style={[typography.bodySmall, { color: colors.error }]}>{classError.message}</Text><Button label="Try again" variant="secondary" onPress={() => void loadClasses()} /></View> : null}
      {!loadingClasses && !classError ? <View accessibilityRole="menu" style={{ gap: spacing.xs }}>
        <UtilityMenuRow icon="checkbox-outline" title="Start attendance" detail={preferredClass ? `${preferredClass.subjectCode} · ${preferredClass.batchName}` : 'No assigned class available'} disabled={!preferredClass} onPress={() => preferredClass && navigate(`/hod/classes/${preferredClass.id}/attendance` as Href)} />
        <UtilityMenuRow icon="school-outline" title="My classes" detail="View assigned subjects" onPress={() => navigate('/hod/classes' as Href)} />
        <UtilityMenuRow icon="time-outline" title="Attendance history" detail="Review completed teaching sessions" onPress={() => navigate('/hod/history' as Href)} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <UtilityMenuRow icon="person-add-outline" title="Add student" detail="Create a department student account" onPress={() => navigate('/hod/management/students/new' as Href)} />
        <UtilityMenuRow icon="mail-outline" title="Add lecturer" detail="Send a department invitation" onPress={() => navigate('/hod/management/lecturers/new' as Href)} />
        <UtilityMenuRow icon="book-outline" title="Add subject" detail="Configure an academic subject" onPress={() => navigate('/hod/management/subjects/new' as Href)} />
        <UtilityMenuRow icon="layers-outline" title="Create class" detail="Add a department section" onPress={() => navigate('/hod/management/classes/new' as Href)} />
        <UtilityMenuRow icon="git-branch-outline" title="Assign lecturer" detail="Connect subject, class, and lecturer" onPress={() => navigate('/hod/management/assignments' as Href)} />
        <UtilityMenuRow icon="people-outline" title="Assign Class Teacher" detail="Set class responsibility" onPress={() => navigate('/hod/management/class-teachers' as Href)} />
        <UtilityMenuRow icon="calendar-outline" title="Create schedule" detail="Add a department timetable entry" onPress={() => navigate('/hod/management/schedule/new' as Href)} />
        <UtilityMenuRow icon="alert-circle-outline" title="Review attendance issue" detail="Open the department correction inbox" onPress={() => navigate('/hod/management/issues' as Href)} />
        <UtilityMenuRow icon="document-text-outline" title="View reports" detail="Open department attendance reports" onPress={() => navigate('/hod/management/reports' as Href)} />
        <UtilityMenuRow icon="megaphone-outline" title="Send department notification" detail="Message an authorized department audience" onPress={() => navigate('/hod/management/notifications/new' as Href)} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <UtilityMenuRow icon="search-outline" title="Search" detail="Find teaching and department information" onPress={() => navigate('/hod/search' as Href)} />
      </View> : null}
    </AdaptiveUtilityMenu>
    <AdaptiveUtilityMenu visible={menu === 'account'} title="Account" onDismiss={() => setMenu(null)}>
      <View style={{ borderRadius: radii.md, backgroundColor: colors.surfaceSecondary, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Avatar name={profile.displayName} /><View style={{ flex: 1, gap: spacing.xxs }}><Text numberOfLines={1} style={[typography.subheading, { color: colors.textPrimary }]}>{profile.displayName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>HOD · {session?.user.college?.name ?? 'College'}</Text></View></View>
      <View accessibilityRole="menu" style={{ gap: spacing.xs }}>
        <UtilityMenuRow icon="person-outline" title="Profile" detail="View and edit your profile" onPress={() => navigate('/hod/profile' as Href)} />
        <UtilityMenuRow icon="settings-outline" title="Settings" detail="Account and app preferences" onPress={() => navigate('/hod/settings' as Href)} />
        <UtilityMenuRow icon="help-circle-outline" title="Help & Support" detail="Guidance and contact options" onPress={() => navigate('/hod/settings/help' as Href)} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <UtilityMenuRow icon="log-out-outline" title="Sign out" detail="Return to the login screen" destructive onPress={() => { setMenu(null); setConfirmLogout(true); }} />
      </View>
    </AdaptiveUtilityMenu>
    <Confirmation visible={confirmLogout} title="Sign out?" message="You will need to sign in again to access RollCall." confirmLabel="Sign out" destructive onDismiss={() => setConfirmLogout(false)} onConfirm={() => void signOut()} />
  </HodUtilitiesContext>;
}

export function useHodUtilities() {
  const value = React.use(HodUtilitiesContext);
  if (!value) throw new Error('useHodUtilities must be used within HodUtilityProvider');
  return value;
}
