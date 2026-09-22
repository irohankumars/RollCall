import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { AlertBanner, Confirmation } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerPageSkeleton, LecturerShell, SectionHeading } from '@/lecturer/components';
import { AuthenticationMethodRow, type ProviderState } from '@/lecturer/settings-components';

type Provider = 'google' | 'apple';

export default function SignInMethods() {
  const { colors } = useRollCallTheme();
  const { state, google, apple, action } = useLocalSearchParams<{ state?: 'loading' | 'error' | 'session-expired' | 'unauthorized'; google?: ProviderState; apple?: ProviderState; action?: 'failed' }>();
  const [methods, setMethods] = useState<Record<Provider, ProviderState>>({ google: google ?? 'connected', apple: apple ?? 'not-connected' });
  const [pendingDisconnect, setPendingDisconnect] = useState<Provider>();
  const [message, setMessage] = useState<{ title: string; text: string; tone: 'success' | 'error' }>();

  const updateMethod = (provider: Provider) => {
    if (methods[provider] === 'connected') {
      setPendingDisconnect(provider);
      return;
    }
    if (action === 'failed') {
      setMessage({ title: 'Connection failed', text: `${provider === 'google' ? 'Google' : 'Apple'} could not be connected. Your existing sign-in methods were not changed.`, tone: 'error' });
      return;
    }
    setMethods((current) => ({ ...current, [provider]: 'connected' }));
    setMessage({ title: 'Method connected', text: `${provider === 'google' ? 'Google' : 'Apple'} is now linked to this RollCall identity.`, tone: 'success' });
  };

  const disconnect = () => {
    if (!pendingDisconnect) return;
    const provider = pendingDisconnect;
    setPendingDisconnect(undefined);
    if (action === 'failed') {
      setMessage({ title: 'Disconnection failed', text: 'The method remains connected. Try again.', tone: 'error' });
      return;
    }
    setMethods((current) => ({ ...current, [provider]: 'not-connected' }));
    setMessage({ title: 'Method disconnected', text: `${provider === 'google' ? 'Google' : 'Apple'} was removed. Your RollCall account remains active.`, tone: 'success' });
  };

  return <LecturerShell activeKey="settings" title="Sign-in Methods" subtitle="Linked ways to access RollCall" back backFallback="/lecturer/settings/security">
    <PageContainer width="compact">
      {state === 'loading' ? <LecturerPageSkeleton rows={4} /> : null}
      {state === 'error' ? <StateView state="error" message="Sign-in methods are temporarily unavailable." onRetry={() => router.replace('/lecturer/settings/security/sign-in-methods' as Href)} /> : null}
      {state === 'session-expired' ? <StateView state="session-expired" /> : null}
      {state === 'unauthorized' ? <StateView state="unauthorized" /> : null}
      {!state ? <>
        {message ? <AlertBanner title={message.title} message={message.text} tone={message.tone} /> : null}
        <View style={{ gap: spacing.xs }}>
          <SectionHeading title="One RollCall identity" />
          <Text style={[typography.body, { color: colors.textSecondary }]}>Each method below opens the same lecturer account. Connecting a provider does not create a second RollCall account.</Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          <SectionHeading title="Available methods" />
          <AuthenticationMethodRow icon="business-outline" name="Institution account" state="connected" locked />
          <AuthenticationMethodRow icon="logo-google" name="Google" state={methods.google} onAction={() => updateMethod('google')} />
          <AuthenticationMethodRow icon="logo-apple" name="Apple" state={methods.apple} onAction={() => updateMethod('apple')} last />
        </View>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Provider buttons in this frontend build demonstrate connection states only. No external account is contacted.</Text>
      </> : null}
    </PageContainer>
    <Confirmation visible={Boolean(pendingDisconnect)} title={`Disconnect ${pendingDisconnect === 'google' ? 'Google' : 'Apple'}?`} message="You will no longer be able to use this method to sign in. Your RollCall account will remain active." confirmLabel="Disconnect" destructive onDismiss={() => setPendingDisconnect(undefined)} onConfirm={disconnect} />
  </LecturerShell>;
}
