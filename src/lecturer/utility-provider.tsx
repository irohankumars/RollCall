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
import { lecturerClient } from './lecturer-client';
import { useLecturerProfile } from './profile-provider';
import type { LecturerClass } from './types';
import { lecturerAccessFor } from './access';
import { AdaptiveUtilityMenu, UtilityMenuLoading, UtilityMenuRow } from './utility-components';

type LecturerUtilitiesValue = { openQuickActions: () => void; openAccountMenu: () => void; requestLogout: () => void };
const LecturerUtilitiesContext = createContext<LecturerUtilitiesValue | null>(null);

export function LecturerUtilityProvider({ children }: React.PropsWithChildren) {
  const { colors } = useRollCallTheme();
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const { profile } = useLecturerProfile();
  const overlays = useGlobalOverlays();
  const [menu, setMenu] = useState<'quick' | 'account' | null>(null);
  const [classes, setClasses] = useState<LecturerClass[]>();
  const [classError, setClassError] = useState<AuthApiError>();
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const token = session?.token ?? '';
  const access = lecturerAccessFor(session?.user);

  React.useEffect(() => {
    if (process.env.EXPO_OS !== 'web') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      if (pathname === '/lecturer/search') globalThis.window?.dispatchEvent(new Event('rollcall-focus-search'));
      else router.push('/lecturer/search' as Href);
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

  return <LecturerUtilitiesContext value={{ openQuickActions, openAccountMenu, requestLogout: () => setConfirmLogout(true) }}>
    {children}
    <AdaptiveUtilityMenu visible={menu === 'quick'} title="Quick actions" onDismiss={() => setMenu(null)}>
      {loadingClasses ? <UtilityMenuLoading label="Loading actions" /> : null}
      {!loadingClasses && classError ? <View style={{ gap: spacing.md, padding: spacing.md }}><Text accessibilityRole="alert" style={[typography.bodySmall, { color: colors.error }]}>{classError.message}</Text><Button label="Try again" variant="secondary" onPress={() => void loadClasses()} /></View> : null}
      {!loadingClasses && !classError ? <View accessibilityRole="menu" style={{ gap: spacing.xs }}>
        <UtilityMenuRow icon="checkbox-outline" title="Start attendance" detail={preferredClass ? `${preferredClass.subjectCode} · ${preferredClass.batchName}` : 'No assigned class available'} disabled={!preferredClass} onPress={() => preferredClass && navigate(`/lecturer/classes/${preferredClass.id}/attendance` as Href)} />
        <UtilityMenuRow icon="school-outline" title="Open classes" detail="View assigned subjects" onPress={() => navigate('/lecturer/classes' as Href)} />
        <UtilityMenuRow icon="time-outline" title="Attendance history" detail="Review completed sessions" onPress={() => navigate('/lecturer/history' as Href)} />
        {access.isClassTeacher ? <UtilityMenuRow icon="people-outline" title="Class teacher workspace" detail={classes?.find((item) => item.subjectCode === access.classTeacherSubjectCode)?.batchName ?? 'Assignment unavailable'} disabled={!classes?.some((item) => item.subjectCode === access.classTeacherSubjectCode)} onPress={() => navigate('/lecturer/class-teacher' as Href)} /> : null}
      </View> : null}
    </AdaptiveUtilityMenu>
    <AdaptiveUtilityMenu visible={menu === 'account'} title="Account" onDismiss={() => setMenu(null)}>
      <View style={{ borderRadius: radii.md, backgroundColor: colors.surfaceSecondary, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Avatar name={profile.displayName} /><View style={{ flex: 1, gap: spacing.xxs }}><Text numberOfLines={1} style={[typography.subheading, { color: colors.textPrimary }]}>{profile.displayName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Lecturer · {session?.user.college?.name ?? 'College'}</Text></View></View>
      <View accessibilityRole="menu" style={{ gap: spacing.xs }}>
        <UtilityMenuRow icon="pulse-outline" title="Activity" detail="Review personal account history" onPress={() => navigate('/lecturer/activity' as Href)} />
        <UtilityMenuRow icon="person-outline" title="Profile" detail="View and edit your profile" onPress={() => navigate('/lecturer/profile' as Href)} />
        <UtilityMenuRow icon="settings-outline" title="Settings" detail="Account and app preferences" onPress={() => navigate('/lecturer/settings' as Href)} />
        <UtilityMenuRow icon="help-circle-outline" title="Help & Support" detail="Guidance and contact options" onPress={() => navigate('/lecturer/settings/help' as Href)} />
        <UtilityMenuRow icon="information-circle-outline" title="About" detail="Product and version information" onPress={() => navigate('/lecturer/settings/about' as Href)} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <UtilityMenuRow icon="log-out-outline" title="Sign out" detail="Return to the login screen" destructive onPress={() => { setMenu(null); setConfirmLogout(true); }} />
      </View>
    </AdaptiveUtilityMenu>
    <Confirmation visible={confirmLogout} title="Sign out?" message="You will need to sign in again to access RollCall." confirmLabel="Sign out" destructive onDismiss={() => setConfirmLogout(false)} onConfirm={() => void signOut()} />
  </LecturerUtilitiesContext>;
}

export function useLecturerUtilities() {
  const value = React.use(LecturerUtilitiesContext);
  if (!value) throw new Error('useLecturerUtilities must be used within LecturerUtilityProvider');
  return value;
}
