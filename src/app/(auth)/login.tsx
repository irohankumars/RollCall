import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';

export default function LoginScreen() {
  const { colors } = useRollCallTheme(); const { isExpanded, contentPadding } = useResponsive(); const insets = useSafeAreaInsets(); const { login, status, error, clearError } = useAuth();
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [fieldErrors, setFieldErrors] = useState<{ loginIdentifier?: string; password?: string }>({});
  const submit = async () => { const next: typeof fieldErrors = {}; if (!identifier.trim()) next.loginIdentifier = 'Enter your login identifier.'; if (!password) next.password = 'Enter your password.'; setFieldErrors(next); if (Object.keys(next).length) return; try { await login(identifier, password); router.replace('/protected' as Href); } catch { /* AuthProvider exposes the safe error. */ } };
  const errorTitle = error?.code === 'ACCOUNT_DISABLED' ? 'Account disabled' : error?.code === 'NETWORK_ERROR' ? 'Connection unavailable' : error?.code === 'INVALID_CREDENTIALS' ? 'Incorrect credentials' : error?.code === 'RATE_LIMITED' ? 'Try again later' : error ? 'Unable to sign in' : '';
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1, flexDirection: isExpanded ? 'row' : 'column', paddingTop: Math.max(insets.top, spacing.xxl), paddingBottom: Math.max(insets.bottom, spacing.xxl), paddingHorizontal: contentPadding }}>
    {isExpanded ? <View style={{ flex: 1, maxWidth: 520, justifyContent: 'center', paddingRight: spacing.giant, borderRightWidth: 1, borderRightColor: colors.borderSubtle, gap: spacing.md }}><Text style={[typography.largeTitle, { color: colors.textPrimary }]}>RollCall</Text><Text style={[typography.body, { maxWidth: 420, color: colors.textSecondary }]}>Secure access for your institution’s attendance workspace.</Text></View> : null}
    <View style={{ flex: 1, width: '100%', maxWidth: 440, alignSelf: isExpanded ? 'center' : 'stretch', justifyContent: 'center', paddingLeft: isExpanded ? spacing.giant : 0, gap: spacing.xl }}>
      <View style={{ gap: spacing.xs }}>{isExpanded ? null : <Text style={[typography.heading, { color: colors.primary }]}>RollCall</Text>}<Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>Sign in</Text><Text style={[typography.bodySmall, { color: colors.textMuted }]}>Use the login identifier provided by your institution.</Text></View>
      {error ? <AlertBanner title={errorTitle} message={error.message} tone="error" action={<Button label="Dismiss" variant="text" onPress={clearError} />} /> : null}
      <View style={{ gap: spacing.lg }}><TextField label="Login identifier" value={identifier} onChangeText={(value) => { setIdentifier(value); setFieldErrors((current) => ({ ...current, loginIdentifier: undefined })); }} autoCapitalize="none" autoCorrect={false} textContentType="username" autoComplete="username" returnKeyType="next" error={fieldErrors.loginIdentifier} required /><TextField label="Password" value={password} onChangeText={(value) => { setPassword(value); setFieldErrors((current) => ({ ...current, password: undefined })); }} password textContentType="password" autoComplete="current-password" returnKeyType="done" onSubmitEditing={submit} error={fieldErrors.password} required /></View>
      <Button label="Sign in" loading={status === 'authenticating'} disabled={!identifier.trim() || !password} onPress={submit} />
    </View>
  </ScrollView></KeyboardAvoidingView>;
}
