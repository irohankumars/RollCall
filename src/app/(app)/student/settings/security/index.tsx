import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { AlertBanner, BottomSheet, Confirmation } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { SettingsRow } from '@/lecturer/profile-components';
import { SessionRow, SummaryRow, type MockSession } from '@/lecturer/settings-components';
import { StudentShell } from '@/student/shell';

const initialSessions: MockSession[] = [
  { id: 'current', device: 'Windows', detail: 'Chrome', activity: 'Current session', current: true },
  { id: 'phone', device: 'Android', detail: 'RollCall app', activity: 'Last active yesterday' },
];

export default function StudentSecurity() {
  const { colors } = useRollCallTheme(); const { session } = useAuth(); const { state } = useLocalSearchParams<{ state?: 'loading' | 'error' | 'session-expired' }>();
  const [sessions, setSessions] = useState(initialSessions); const [selected, setSelected] = useState<MockSession>(); const [confirm, setConfirm] = useState(false); const [saved, setSaved] = useState(false);
  const signOutOthers = () => { setSessions((items) => items.filter((item) => item.current)); setConfirm(false); setSelected(undefined); setSaved(true); };
  return <StudentShell activeKey="home" title="Account & Security" subtitle="Identity and sessions" back backFallback="/student/settings"><PageContainer width="compact">
    {state === 'loading' ? <StateView state="loading" /> : null}{state === 'error' ? <StateView state="error" onRetry={() => router.replace('/student/settings/security' as Href)} /> : null}{state === 'session-expired' ? <StateView state="session-expired" /> : null}
    {!state ? <>{saved ? <AlertBanner title="Security updated" message="Other sessions were signed out on this device." tone="success" /> : null}
      <View style={{ gap: spacing.sm }}><SectionHeading title="Account status" /><SummaryRow label="Account" value={session?.user.status === 'ACTIVE' ? 'Active' : 'Disabled'} tone="success" /><SummaryRow label="Institution" value="Verified" tone="success" /><SummaryRow label="Signed in as" value={session?.user.loginIdentifier ?? 'Institution account'} last /></View>
      <View style={{ gap: spacing.sm }}><SectionHeading title="Sign-in & recovery" /><SettingsRow icon="key-outline" title="Sign-in Methods" detail="Institution-managed sign-in" onPress={() => setSelected(sessions[0])} /><SettingsRow icon="help-buoy-outline" title="Account Recovery" detail="Contact your institution to recover access" onPress={() => setSelected({ id: 'recovery', device: 'Account recovery', detail: 'Institution managed', activity: 'Contact student support' })} /><SettingsRow icon="lock-closed-outline" title="Privacy" detail="Review privacy information" onPress={() => router.push('/student/settings/about/privacy' as Href)} last /></View>
      <View style={{ gap: spacing.sm }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><SectionHeading title="Sessions & devices" /><Button label="Sign out others" variant="text" disabled={sessions.length < 2} onPress={() => setConfirm(true)} /></View>{sessions.map((item, index) => <SessionRow key={item.id} session={item} last={index === sessions.length - 1} onPress={() => setSelected(item)} />)}</View>
    </> : null}
  </PageContainer><BottomSheet visible={Boolean(selected)} title="Account information" onDismiss={() => setSelected(undefined)}>{selected ? <><Text style={[typography.heading, { color: colors.textPrimary }]}>{selected.device}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{selected.detail}</Text><Text style={[typography.bodySmall, { color: colors.textMuted }]}>{selected.activity}</Text><Button label="Close" variant="secondary" onPress={() => setSelected(undefined)} /></> : null}</BottomSheet><Confirmation visible={confirm} title="Sign out other devices?" message="This removes every session except the one you are using now." confirmLabel="Sign out" destructive onDismiss={() => setConfirm(false)} onConfirm={signOutOthers} /></StudentShell>;
}
