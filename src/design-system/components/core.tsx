import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type ViewStyle } from 'react-native';
import { elevation, radii, sizing, spacing, typography } from '../tokens';
import { useRollCallTheme } from '../theme-provider';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'text';
export function Button({ label, variant = 'primary', loading = false, icon, ...props }: PressableProps & { label: string; variant?: ButtonVariant; loading?: boolean; icon?: React.ReactNode }) {
  const { colors } = useRollCallTheme();
  const [focused, setFocused] = React.useState(false);
  const disabled = props.disabled || loading;
  const background = variant === 'primary' ? colors.primary : variant === 'destructive' ? colors.error : variant === 'secondary' ? colors.surfaceSecondary : 'transparent';
  const foreground = variant === 'primary' || variant === 'destructive' ? colors.textInverse : variant === 'text' ? colors.primary : colors.textPrimary;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, busy: loading }} {...props} onFocus={(event) => { setFocused(true); props.onFocus?.(event); }} onBlur={(event) => { setFocused(false); props.onBlur?.(event); }} disabled={disabled} style={(state) => [styles.button, { backgroundColor: background, borderColor: focused ? colors.focusRing : variant === 'secondary' ? colors.border : background, borderWidth: focused ? 2 : 1, opacity: disabled ? 0.48 : state.pressed ? 0.78 : 1 }, typeof props.style === 'function' ? props.style(state) : props.style]}>
    {loading ? <ActivityIndicator color={foreground} /> : icon}<Text maxFontSizeMultiplier={1.8} style={[typography.label, { color: foreground }]}>{label}</Text>
  </Pressable>;
}

export function IconButton({ label, children, ...props }: PressableProps & { label: string; children: React.ReactNode }) {
  const { colors } = useRollCallTheme();
  const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} {...props} onFocus={(event) => { setFocused(true); props.onFocus?.(event); }} onBlur={(event) => { setFocused(false); props.onBlur?.(event); }} style={(state) => [{ width: sizing.touchTarget, height: sizing.touchTarget, borderRadius: radii.full, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, alignItems: 'center', justifyContent: 'center', backgroundColor: state.pressed ? colors.surfaceSecondary : 'transparent', opacity: props.disabled ? 0.48 : 1 }, typeof props.style === 'function' ? props.style(state) : props.style]}>{children}</Pressable>;
}

export function Card({ children, elevated = false, style }: React.PropsWithChildren<{ elevated?: boolean; style?: ViewStyle }>) {
  const { colors } = useRollCallTheme();
  return <View style={[styles.card, { backgroundColor: elevated ? colors.surfaceElevated : colors.surface, borderColor: colors.borderSubtle }, elevated ? elevation.low : elevation.none, style]}>{children}</View>;
}

export function ListItem({ title, detail, leading, trailing, onPress }: { title: string; detail?: string; leading?: React.ReactNode; trailing?: React.ReactNode; onPress?: () => void }) {
  const { colors } = useRollCallTheme();
  const [focused, setFocused] = React.useState(false);
  const content = <><View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md }}>{leading}<View style={{ flex: 1, gap: spacing.xs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{title}</Text>{detail ? <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{detail}</Text> : null}</View>{trailing}</View></>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={(state) => [styles.listItem, { backgroundColor: state.pressed ? colors.surfaceSecondary : colors.surface, borderColor: focused ? colors.focusRing : colors.borderSubtle, borderWidth: focused ? 2 : StyleSheet.hairlineWidth }]}>{content}</Pressable> : <View style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>{content}</View>;
}

export function Avatar({ name, size = 'medium' }: { name: string; size?: 'small' | 'medium' | 'large' }) {
  const { colors } = useRollCallTheme();
  const px = size === 'small' ? sizing.avatarSm : size === 'large' ? sizing.avatarLg : sizing.avatarMd;
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <View accessibilityLabel={`${name} avatar`} style={{ width: px, height: px, borderRadius: radii.full, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}><Text style={[typography.label, { color: colors.primary }]}>{initials}</Text></View>;
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info' }) {
  const { colors } = useRollCallTheme();
  const foreground = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : tone === 'error' ? colors.error : tone === 'info' ? colors.info : colors.textSecondary;
  const background = tone === 'success' ? colors.successSurface : tone === 'warning' ? colors.warningSurface : tone === 'error' ? colors.errorSurface : tone === 'info' ? colors.infoSurface : colors.surfaceSecondary;
  return <View style={{ alignSelf: 'flex-start', minHeight: 28, borderRadius: radii.full, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: background }}><View style={{ width: 7, height: 7, borderRadius: radii.full, backgroundColor: foreground }} /><Text style={[typography.caption, { color: foreground }]}>{label}</Text></View>;
}

export function Statistic({ value, label }: { value: string; label: string }) { const { colors } = useRollCallTheme(); return <View style={{ gap: spacing.xs }}><Text selectable style={[typography.statistic, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>{value}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text></View>; }

export function Progress({ value, label, tone = 'primary' }: { value: number; label: string; tone?: 'primary' | 'good' | 'warning' | 'low' }) {
  const { colors } = useRollCallTheme(); const color = tone === 'good' ? colors.attendanceGood : tone === 'warning' ? colors.attendanceWarning : tone === 'low' ? colors.attendanceLow : colors.primary; const safe = Math.min(100, Math.max(0, value));
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: safe, text: `${label}, ${safe}%` }} style={{ gap: spacing.sm }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}><Text style={[typography.label, { color: colors.textPrimary }]}>{label}</Text><Text style={[typography.numeric, { color }]}>{safe}%</Text></View><View style={{ height: 8, borderRadius: radii.full, backgroundColor: colors.surfaceSecondary, overflow: 'hidden' }}><View style={{ width: `${safe}%`, height: '100%', backgroundColor: color, borderRadius: radii.full }} /></View></View>;
}

const styles = StyleSheet.create({
  button: { minHeight: sizing.buttonHeight, borderRadius: radii.md, borderCurve: 'continuous', borderWidth: 1, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  card: { borderRadius: radii.lg, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, padding: spacing.xl, gap: spacing.lg },
  listItem: { minHeight: 64, borderRadius: radii.md, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, justifyContent: 'center' },
});
