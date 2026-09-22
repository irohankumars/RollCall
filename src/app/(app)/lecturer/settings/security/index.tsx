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
import { LecturerPageSkeleton, LecturerShell, SectionHeading } from '@/lecturer/components';
import { SettingsRow } from '@/lecturer/profile-components';
import { SessionRow, SummaryRow, type MockSession } from '@/lecturer/settings-components';

const initialSessions: MockSession[] = [
  { id: 'current', device: 'Windows', detail: 'Chrome', activity: 'Current session', current: true },
  { id: 'iphone', device: 'iPhone', detail: 'RollCall app', activity: 'Last active yesterday' },
  { id: 'android', device: 'Android', detail: 'RollCall app', activity: 'Last active 4 days ago' },
];

export default function AccountSecurity() {
  const { colors } = useRollCallTheme(); const { session } = useAuth();
  const { state, action } = useLocalSearchParams<{ state?: 'loading' | 'error' | 'session-expired' | 'unauthorized'; action?: 'failed' }>();
  const [sessions, setSessions] = useState(initialSessions); const [selectedId, setSelectedId] = useState<string>(); const [confirmIds, setConfirmIds] = useState<string[]>(); const [success, setSuccess] = useState<string>(); const [failure, setFailure] = useState<string>();
  const selected = sessions.find((item) => item.id === selectedId); const others = sessions.filter((item) => !item.current);
  const requestSignOut = (ids: string[]) => { setSelectedId(undefined); setConfirmIds(ids); };
  const confirmSignOut = () => { if (!confirmIds) return; if (action === 'failed') { setFailure('The session action could not be completed. Try again.'); setConfirmIds(undefined); return; } setSessions((current) => current.filter((item) => !confirmIds.includes(item.id))); setSuccess(confirmIds.length > 1 ? 'Other sessions signed out.' : 'Session signed out.'); setFailure(undefined); setConfirmIds(undefined); };

  return <LecturerShell activeKey="settings" title="Account & Security" subtitle="Identity and sessions" back backFallback="/lecturer/settings">
    <PageContainer width="compact">
      {state === 'loading' ? <LecturerPageSkeleton rows={5} /> : null}
      {state === 'error' ? <StateView state="error" message="Security information is temporarily unavailable." onRetry={() => router.replace('/lecturer/settings/security' as Href)} /> : null}
      {state === 'session-expired' ? <StateView state="session-expired" /> : null}
      {state === 'unauthorized' ? <StateView state="unauthorized" /> : null}
      {!state ? <>
        {success ? <AlertBanner title="Security updated" message={success} tone="success" /> : null}
        {failure ? <AlertBanner title="Action failed" message={failure} tone="error" action={<Button label="Dismiss" variant="text" onPress={() => setFailure(undefined)} />} /> : null}
        <View style={{ gap: spacing.sm }}><SectionHeading title="Account status" /><View style={{ borderTopWidth: 1, borderTopColor: colors.borderSubtle }}><SummaryRow label="Account" value={session?.user.status === 'ACTIVE' ? 'Active' : 'Disabled'} tone={session?.user.status === 'ACTIVE' ? 'success' : 'error'} /><SummaryRow label="Institution" value={session?.user.college?.status === 'ACTIVE' ? 'Verified' : 'Unavailable'} tone={session?.user.college?.status === 'ACTIVE' ? 'success' : 'warning'} /><SummaryRow label="Signed in as" value={session?.user.loginIdentifier ?? 'Unavailable'} /><SummaryRow label="Primary sign-in" value="Institution account" last /></View></View>
        <View style={{ gap: spacing.sm }}><SectionHeading title="Security" /><SettingsRow icon="key-outline" title="Sign-in Methods" detail="Manage methods linked to this RollCall identity" onPress={() => router.push('/lecturer/settings/security/sign-in-methods' as Href)} /><SettingsRow icon="help-buoy-outline" title="Account Recovery" detail="Learn how institution-managed recovery works" onPress={() => router.push('/lecturer/settings/security/recovery' as Href)} /><SettingsRow icon="shield-checkmark-outline" title="Security information" detail="Review account security guidance" onPress={() => router.push('/lecturer/settings/security/information' as Href)} /><SettingsRow icon="lock-closed-outline" title="Privacy" detail="Review privacy and data handling information" onPress={() => router.push('/lecturer/settings/about/privacy' as Href)} last /></View>
        <View style={{ gap: spacing.sm }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><SectionHeading title="Sessions & devices" /><Button label="Sign out others" variant="text" disabled={!others.length} onPress={() => requestSignOut(others.map((item) => item.id))} /></View>{sessions.map((item, index) => <SessionRow key={item.id} session={item} last={index === sessions.length - 1} onPress={() => setSelectedId(item.id)} />)}</View>
      </> : null}
    </PageContainer>
    <BottomSheet visible={Boolean(selected)} title="Session details" onDismiss={() => setSelectedId(undefined)}>{selected ? <><View style={{ gap: spacing.xs }}><Text style={[typography.heading, { color: colors.textPrimary }]}>{selected.device}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{selected.detail}</Text><Text style={[typography.bodySmall, { color: colors.textMuted }]}>{selected.activity}</Text></View>{selected.current ? <AlertBanner title="Current session" message="This is the session you are using now." tone="info" /> : <Button label="Sign out session" variant="destructive" onPress={() => requestSignOut([selected.id])} />}<Button label="Close" variant="secondary" onPress={() => setSelectedId(undefined)} /></> : null}</BottomSheet>
    <Confirmation visible={Boolean(confirmIds)} title={confirmIds && confirmIds.length > 1 ? 'Sign out of other devices?' : 'Sign out this session?'} message="This removes the selected session from the device list stored in this build." confirmLabel="Sign out" destructive onDismiss={() => setConfirmIds(undefined)} onConfirm={confirmSignOut} />
  </LecturerShell>;
}
