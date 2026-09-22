import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { AlertBanner } from '@/design-system/components/feedback';
import { PermissionNotice } from '@/design-system/components/permissions';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerPageSkeleton, LecturerShell, SectionHeading } from '@/lecturer/components';
import { PreferenceRow } from '@/lecturer/settings-components';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';
import { useAuth } from '@/auth/auth-provider';
import { lecturerAccessFor } from '@/lecturer/access';

type PreferenceKey = 'attendance' | 'classes' | 'classTeacher' | 'security' | 'inApp' | 'push' | 'email';

const initialPreferences: Record<PreferenceKey, boolean> = {
  attendance: true,
  classes: true,
  classTeacher: true,
  security: true,
  inApp: true,
  push: true,
  email: false,
};

export default function NotificationPreferences() {
  const { colors } = useRollCallTheme();
  const { session } = useAuth();
  const access = lecturerAccessFor(session?.user);
  const { state, permission = 'enabled' } = useLocalSearchParams<{ state?: 'loading' | 'error' | 'session-expired' | 'unauthorized'; permission?: 'enabled' | 'disabled' | 'unavailable' }>();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [restoring, setRestoring] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const preferenceKey = `rollcall.notification-preferences.${session?.user.id ?? 'anonymous'}`;
  useEffect(() => { let active = true; void readLocalPreference(preferenceKey).then((value) => { if (!active) return; if (value) { try { setPreferences({ ...initialPreferences, ...JSON.parse(value) as Partial<typeof initialPreferences> }); } catch { /* Ignore invalid local preference data. */ } } setRestoring(false); }); return () => { active = false; }; }, [preferenceKey]);
  const change = (key: PreferenceKey, label: string, value: boolean) => {
    setPreferences((current) => { const next = { ...current, [key]: value }; void writeLocalPreference(preferenceKey, JSON.stringify(next)); return next; });
    setAnnouncement(`${label} ${value ? 'enabled' : 'disabled'}.`);
  };

  return <LecturerShell activeKey="settings" title="Notification Preferences" subtitle="Choose useful updates" back backFallback="/lecturer/settings">
    <PageContainer width="compact">
      {state === 'loading' || restoring ? <LecturerPageSkeleton rows={6} /> : null}
      {state === 'error' ? <StateView state="error" message="Notification preferences are temporarily unavailable." onRetry={() => router.replace('/lecturer/settings/notifications' as Href)} /> : null}
      {state === 'session-expired' ? <StateView state="session-expired" /> : null}
      {state === 'unauthorized' ? <StateView state="unauthorized" /> : null}
      {!state && !restoring ? <>
        <AlertBanner title="Saved on this device" message="Changes apply immediately. Notification delivery remains managed by your institution." tone="info" />
        {permission === 'disabled' ? <PermissionNotice title="Push notifications are off" message="Allow notifications in your device settings before push updates can be delivered." denied onAction={() => void Linking.openSettings()} /> : null}
        {permission === 'unavailable' ? <PermissionNotice title="Push notifications are unavailable" message="This device or browser does not currently support app push notifications." /> : null}
        <View style={{ gap: spacing.sm }}>
          <SectionHeading title="Updates" />
          <PreferenceRow label="Attendance" detail="Session starts, completion, and exceptions" value={preferences.attendance} onChange={(value) => change('attendance', 'Attendance updates', value)} />
          <PreferenceRow label="Classes" detail="Schedule and class changes" value={preferences.classes} onChange={(value) => change('classes', 'Class updates', value)} />
          {access.isClassTeacher ? <PreferenceRow label="Class Teacher" detail="Updates for your assigned class" value={preferences.classTeacher} onChange={(value) => change('classTeacher', 'Class Teacher updates', value)} /> : null}
          <PreferenceRow label="System & security" detail="Account, access, and important service notices" value={preferences.security} onChange={(value) => change('security', 'System and security updates', value)} last />
        </View>
        <View style={{ gap: spacing.sm }}>
          <SectionHeading title="Delivery" />
          <PreferenceRow label="In-app" detail="Show updates inside RollCall" value={preferences.inApp} onChange={(value) => change('inApp', 'In-app delivery', value)} />
          <PreferenceRow label="Push" detail="Show alerts on this device" value={preferences.push} disabled={permission !== 'enabled'} onChange={(value) => change('push', 'Push delivery', value)} />
          <PreferenceRow label="Email" detail="Send updates to your institution email" value={preferences.email} onChange={(value) => change('email', 'Email delivery', value)} last />
        </View>
        <Text accessibilityLiveRegion="polite" style={[typography.bodySmall, { color: colors.textMuted }]}>{announcement || 'Preferences are ready to change.'}</Text>
      </> : null}
    </PageContainer>
  </LecturerShell>;
}
