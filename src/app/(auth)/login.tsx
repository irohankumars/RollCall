import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { Checkbox, TextField } from '@/design-system/components/forms';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';

const rememberedIdentifierKey = 'rollcall.remembered-login';
const collegeAdminEmail = 'admin@development.local';

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel="RollCall" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
    <View accessibilityElementsHidden style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: inverse ? 'rgba(255,255,255,0.14)' : colors.infoSurface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark-done" size={sizing.iconLg} color={inverse ? '#FFFFFF' : colors.primary} /></View>
    <Text style={[typography.heading, { color: inverse ? '#FFFFFF' : colors.textPrimary }]}>RollCall</Text>
  </View>;
}

export default function LoginScreen() {
  const { colors, scheme } = useRollCallTheme(); const { isExpanded, contentPadding } = useResponsive(); const insets = useSafeAreaInsets(); const { login, status, error, clearError } = useAuth();
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [remember, setRemember] = useState(false); const [providerMessage, setProviderMessage] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<{ loginIdentifier?: string; password?: string }>({});

  useEffect(() => { let active = true; void readLocalPreference(rememberedIdentifierKey).then((stored) => { if (!active || !stored) return; setIdentifier(stored); setRemember(true); }); return () => { active = false; }; }, []);

  const submit = async () => {
    const next: typeof fieldErrors = {};
    if (!identifier.trim()) next.loginIdentifier = 'Enter your email or login identifier.';
    if (!password) next.password = 'Enter your password.';
    setFieldErrors(next); if (Object.keys(next).length) return;
    try {
      await login(identifier, password);
      await writeLocalPreference(rememberedIdentifierKey, remember ? identifier.trim() : '');
      router.replace('/protected' as Href);
    } catch { /* AuthProvider exposes the safe error. */ }
  };

  const sessionExpired = status === 'session-expired' || error?.code === 'UNAUTHORIZED';
  const errorTitle = sessionExpired ? 'Session expired' : error?.code === 'ACCOUNT_DISABLED' ? 'Account disabled' : error?.code === 'NETWORK_ERROR' ? 'Connection unavailable' : error?.code === 'INVALID_CREDENTIALS' ? 'Incorrect credentials' : error?.code === 'RATE_LIMITED' ? 'Try again later' : error ? 'Unable to sign in' : '';
  const errorMessage = sessionExpired ? 'Your session has expired. Please sign in again.' : error?.message ?? '';
  const contactAdmin = () => void Linking.openURL(`mailto:${collegeAdminEmail}?subject=${encodeURIComponent('RollCall account access')}`);
  const providerEntry = (provider: string) => { clearError(); setProviderMessage(`${provider} sign-in is managed by your college. Contact your college administrator if it is not enabled for your account.`); };

  const form = <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center', gap: spacing.xl }}>
    <View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Welcome back</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Sign in with the access provided by your institution.</Text></View>
    {error ? <AlertBanner title={errorTitle} message={errorMessage} tone="error" action={<Button label="Dismiss" variant="text" onPress={clearError} />} /> : null}
    {providerMessage ? <AlertBanner title="Institution-managed access" message={providerMessage} tone="info" action={<Button label="Dismiss" variant="text" onPress={() => setProviderMessage(undefined)} />} /> : null}
    <View style={{ gap: spacing.lg }}>
      <TextField label="Email or login identifier" value={identifier} onChangeText={(value) => { setIdentifier(value); setFieldErrors((current) => ({ ...current, loginIdentifier: undefined })); }} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="username" autoComplete="username" returnKeyType="next" error={fieldErrors.loginIdentifier} required />
      <TextField label="Password" value={password} onChangeText={(value) => { setPassword(value); setFieldErrors((current) => ({ ...current, password: undefined })); }} password textContentType="password" autoComplete="current-password" returnKeyType="done" onSubmitEditing={submit} error={fieldErrors.password} required />
    </View>
    <View style={{ minHeight: sizing.touchTarget, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm }}><Checkbox label="Remember me" checked={remember} onChange={setRemember} /><Button label="Forgot password?" variant="text" onPress={contactAdmin} /></View>
    <Button label="Sign in" loading={status === 'authenticating'} disabled={!identifier.trim() || !password} onPress={submit} />
    <View accessibilityLabel="Alternative sign-in methods" style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><View style={{ height: 1, flex: 1, backgroundColor: colors.borderSubtle }} /><Text style={[typography.caption, { color: colors.textMuted }]}>OR CONTINUE WITH</Text><View style={{ height: 1, flex: 1, backgroundColor: colors.borderSubtle }} /></View>
      <View style={{ flexDirection: isExpanded ? 'row' : 'column', gap: spacing.sm }}><Button label="Continue with Google" variant="secondary" icon={<Ionicons accessibilityElementsHidden name="logo-google" size={sizing.iconMd} color={colors.textPrimary} />} onPress={() => providerEntry('Google')} style={{ flex: 1 }} /><Button label="Continue with Apple" variant="secondary" icon={<Ionicons accessibilityElementsHidden name="logo-apple" size={sizing.iconMd} color={colors.textPrimary} />} onPress={() => providerEntry('Apple')} style={{ flex: 1 }} /></View>
    </View>
    <View style={{ alignItems: 'center', gap: spacing.xs }}><Text style={[typography.bodySmall, { color: colors.textMuted, textAlign: 'center' }]}>Need access to RollCall?</Text><Button label="Contact College Admin" variant="text" icon={<Ionicons accessibilityElementsHidden name="mail-outline" size={sizing.iconMd} color={colors.primary} />} onPress={contactAdmin} /></View>
  </View>;

  if (isExpanded) return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={{ flex: 1, flexDirection: 'row' }}>
    <View style={{ flex: 1.05, minWidth: 420, backgroundColor: '#112D4E', paddingTop: Math.max(insets.top, spacing.xxxl), paddingBottom: Math.max(insets.bottom, spacing.xxxl), paddingHorizontal: spacing.giant, justifyContent: 'space-between' }}><BrandMark inverse /><View style={{ maxWidth: 520, gap: spacing.xl }}><View accessibilityElementsHidden style={{ width: 64, height: 4, borderRadius: radii.full, backgroundColor: '#85B0E0' }} /><Text style={[typography.display, { color: '#FFFFFF', maxWidth: 520 }]}>Attendance, kept clear and accountable.</Text><Text style={[typography.body, { color: '#DBE2EF', maxWidth: 460 }]}>A focused workspace for lecturers to manage classes and attendance with confidence.</Text></View><Text style={[typography.caption, { color: '#AFC4DA' }]}>Secure institutional access</Text></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ minHeight: '100%', flexGrow: 1, justifyContent: 'center', paddingVertical: Math.max(insets.top, spacing.giant), paddingHorizontal: Math.max(contentPadding, spacing.giant) }} style={{ flex: 1, backgroundColor: colors.background }}>{form}</ScrollView>
  </View></KeyboardAvoidingView>;

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#112D4E' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} contentContainerStyle={{ flexGrow: 1, paddingTop: Math.max(insets.top, spacing.xl) }}><View style={{ minHeight: 132, paddingHorizontal: contentPadding, paddingBottom: spacing.xxl, justifyContent: 'center' }}><BrandMark inverse /></View><View style={{ flexGrow: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: scheme === 'dark' ? colors.background : colors.surfaceElevated, paddingHorizontal: contentPadding, paddingTop: spacing.xxxl, paddingBottom: Math.max(insets.bottom, spacing.xxxl) }}>{form}</View></ScrollView></KeyboardAvoidingView>;
}
