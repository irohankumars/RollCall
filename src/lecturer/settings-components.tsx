import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function SummaryRow({ label, value, tone = 'neutral', last = false }: { label: string; value: string; tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info'; last?: boolean }) {
  const { colors } = useRollCallTheme();
  return <View style={{ minHeight: sizing.touchTarget, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle }}><Text style={[typography.body, { flex: 1, color: colors.textPrimary }]}>{label}</Text><Badge label={value} tone={tone} /></View>;
}

export type MockSession = { id: string; device: string; detail: string; activity: string; current?: boolean };

export function SessionRow({ session, onPress, last = false }: { session: MockSession; onPress: () => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  const icon: IconName = session.device.toLowerCase().includes('iphone') ? 'phone-portrait-outline' : session.device.toLowerCase().includes('android') ? 'logo-android' : 'desktop-outline';
  return <Pressable accessibilityRole="button" accessibilityLabel={`${session.device}, ${session.detail}, ${session.activity}`} accessibilityHint="Shows session details" onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 68, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm, borderRadius: radii.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, borderBottomWidth: last || focused ? (focused ? 2 : 0) : 1, borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}><View accessibilityElementsHidden style={{ width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSecondary }}><Ionicons name={icon} size={sizing.iconMd} color={colors.primary} /></View><View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{session.device}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{session.detail} · {session.activity}</Text></View>{session.current ? <Badge label="Current" tone="success" /> : null}<Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} /></Pressable>;
}

export type ProviderState = 'connected' | 'not-connected' | 'failed' | 'reauth';

const providerLabels: Record<ProviderState, string> = { connected: 'Connected', 'not-connected': 'Not connected', failed: 'Connection failed', reauth: 'Re-authentication required' };

export function AuthenticationMethodRow({ icon, name, state, locked = false, onAction, last = false }: { icon: IconName; name: string; state: ProviderState; locked?: boolean; onAction?: () => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const action = state === 'connected' ? 'Disconnect' : state === 'reauth' ? 'Re-authenticate' : 'Connect';
  const tone = state === 'connected' ? 'success' : state === 'failed' || state === 'reauth' ? 'warning' : 'neutral';
  return <View accessibilityLabel={`${name}, ${providerLabels[state]}`} style={{ minHeight: 76, paddingVertical: spacing.md, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle }}><View accessibilityElementsHidden style={{ width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSecondary }}><Ionicons name={icon} size={sizing.iconLg} color={colors.textPrimary} /></View><View style={{ flex: 1, minWidth: 150, gap: spacing.xs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{name}</Text><Badge label={providerLabels[state]} tone={tone} /></View>{locked ? <Text style={[typography.caption, { color: colors.textMuted }]}>Primary method</Text> : <Button label={action} variant="text" onPress={onAction} />}</View>;
}

export function PreferenceRow({ label, detail, value, onChange, disabled = false, last = false }: { label: string; detail?: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean; last?: boolean }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  return <View style={{ minHeight: 64, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, opacity: disabled ? 0.48 : 1 }}><View style={{ flex: 1, gap: spacing.xs }}><Text style={[typography.body, { color: colors.textPrimary }]}>{label}</Text>{detail ? <Text style={[typography.caption, { color: colors.textMuted }]}>{detail}</Text> : null}</View><Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityHint={detail} accessibilityState={{ checked: value, disabled }} aria-checked={value} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onPress={() => onChange(!value)} style={({ pressed }) => ({ width: 52, minHeight: sizing.touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radii.full, opacity: pressed ? 0.72 : 1, outlineColor: focused ? colors.focusRing : 'transparent', outlineWidth: focused ? 2 : 0 })}><View style={{ width: 48, height: 28, borderRadius: radii.full, padding: 3, justifyContent: 'center', backgroundColor: value ? colors.primary : colors.border }}><View style={{ width: 22, height: 22, borderRadius: radii.full, alignSelf: value ? 'flex-end' : 'flex-start', backgroundColor: colors.surfaceElevated }} /></View></Pressable></View>;
}

export function FAQRow({ question, answer, expanded, onPress, last = false }: { question: string; answer: string; expanded: boolean; onPress: () => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityState={{ expanded }} aria-expanded={expanded} accessibilityLabel={question} accessibilityHint={expanded ? 'Collapses the answer' : 'Expands the answer'} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 60, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm, borderRadius: radii.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, borderBottomWidth: last || focused ? (focused ? 2 : 0) : 1, borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, gap: spacing.sm, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Text style={[typography.subheading, { flex: 1, color: colors.textPrimary }]}>{question}</Text><Ionicons accessibilityElementsHidden name={expanded ? 'chevron-up' : 'chevron-down'} size={sizing.iconMd} color={colors.textMuted} /></View>{expanded ? <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{answer}</Text> : null}</Pressable>;
}

export function AppInfoRow({ label, value, onPress, last = false }: { label: string; value?: string; onPress?: () => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const content = <><Text style={[typography.body, { flex: 1, color: colors.textPrimary }]}>{label}</Text>{value ? <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{value}</Text> : null}{onPress ? <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} /> : null}</>;
  const style = ({ pressed = false }: { pressed?: boolean }) => ({ minHeight: sizing.touchTarget, paddingVertical: spacing.md, paddingHorizontal: onPress ? spacing.sm : 0, marginHorizontal: onPress ? -spacing.sm : 0, borderRadius: radii.sm, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' });
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={style}>{content}</Pressable> : <View accessibilityLabel={`${label}: ${value}`} style={style({})}>{content}</View>;
}
