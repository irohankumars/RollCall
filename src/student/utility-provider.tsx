import React, { createContext, useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Avatar } from '@/design-system/components/core';
import { Confirmation } from '@/design-system/components/feedback';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useGlobalOverlays } from '@/shell/overlay-provider';
import { AdaptiveUtilityMenu, UtilityMenuRow } from '@/lecturer/utility-components';
import { studentHomeData } from './student-data';
import { useStudentFinal } from './final-provider';

type StudentUtilitiesValue = { openAccountMenu: () => void };
const StudentUtilitiesContext = createContext<StudentUtilitiesValue | null>(null);

export function StudentUtilityProvider({ children }: React.PropsWithChildren) {
  const { colors } = useRollCallTheme(); const { session, logout } = useAuth(); const overlays = useGlobalOverlays();
  const { profile } = useStudentFinal();
  const [accountOpen, setAccountOpen] = useState(false); const [confirmLogout, setConfirmLogout] = useState(false);
  const name = profile.displayName || session?.user.name || studentHomeData.student.name;
  const navigate = (href: Href) => { setAccountOpen(false); router.push(href); };
  const signOut = async () => { setConfirmLogout(false); overlays.setLoading(true); try { await logout(); } catch { overlays.showAlert({ title: "Couldn't sign out", message: 'Try again. Your local session remains protected.' }); } finally { overlays.setLoading(false); } };
  return <StudentUtilitiesContext value={{ openAccountMenu: () => setAccountOpen(true) }}>
    {children}
    <AdaptiveUtilityMenu visible={accountOpen} title="Account" onDismiss={() => setAccountOpen(false)}>
      <View style={{ borderRadius: radii.md, backgroundColor: colors.surfaceSecondary, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Avatar name={name} /><View style={{ flex: 1, minWidth: 0, gap: spacing.xxs }}><Text numberOfLines={1} style={[typography.subheading, { color: colors.textPrimary }]}>{name}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>Student · {studentHomeData.student.rollNumber}</Text></View></View>
      <View accessibilityRole="menu" style={{ gap: spacing.xs }}>
        <UtilityMenuRow icon="person-outline" title="Profile" detail="View your student profile" onPress={() => navigate('/student/profile' as Href)} />
        <UtilityMenuRow icon="settings-outline" title="Settings" detail="Account and app preferences" onPress={() => navigate('/student/settings' as Href)} />
        <UtilityMenuRow icon="help-circle-outline" title="Help & Support" detail="Guidance and contact options" onPress={() => navigate('/student/settings/help' as Href)} />
        <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginVertical: spacing.xs }} />
        <UtilityMenuRow icon="log-out-outline" title="Logout" detail="Return to the login screen" destructive onPress={() => { setAccountOpen(false); setConfirmLogout(true); }} />
      </View>
    </AdaptiveUtilityMenu>
    <Confirmation visible={confirmLogout} title="Log out?" message="You will need to sign in again to access RollCall." confirmLabel="Log out" destructive onDismiss={() => setConfirmLogout(false)} onConfirm={() => void signOut()} />
  </StudentUtilitiesContext>;
}

export function useStudentUtilities() {
  const value = React.use(StudentUtilitiesContext);
  if (!value) throw new Error('useStudentUtilities must be used within StudentUtilityProvider');
  return value;
}
