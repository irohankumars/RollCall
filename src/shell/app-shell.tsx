import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View, type ScrollViewProps } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/design-system/components/navigation';
import { breakpoints, radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import type { NavigationConfiguration, NavigationDestination } from './navigation-config';

export type PageWidth = 'compact' | 'standard' | 'detail' | 'full';
const pageWidths: Record<PageWidth, number | '100%'> = { compact: 620, standard: 840, detail: sizing.contentReadable, full: '100%' };

export function PageContainer({ children, width = 'standard', scrollable = true, fixedActions, contentContainerStyle, ...scrollProps }: React.PropsWithChildren<{ width?: PageWidth; scrollable?: boolean; fixedActions?: React.ReactNode } & ScrollViewProps>) {
  const { colors } = useRollCallTheme(); const responsive = useResponsive(); const insets = useSafeAreaInsets();
  const content = <View style={[{ width: '100%', maxWidth: pageWidths[width], alignSelf: 'center', paddingHorizontal: responsive.contentPadding, paddingTop: spacing.lg, paddingBottom: fixedActions ? spacing.xl : Math.max(spacing.xxl, insets.bottom), gap: spacing.xl }, contentContainerStyle]}>{children}</View>;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{scrollable ? <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'} contentInsetAdjustmentBehavior="automatic" {...scrollProps} contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : content}{fixedActions ? <View style={{ borderTopWidth: 1, borderTopColor: colors.borderSubtle, backgroundColor: colors.surface, paddingHorizontal: responsive.contentPadding, paddingTop: spacing.md, paddingBottom: Math.max(spacing.md, insets.bottom) }}>{fixedActions}</View> : null}</View>;
}

export function CompactHeader({ title, subtitle, backAction, leading, trailing }: { title: string; subtitle?: string; backAction?: () => void; leading?: React.ReactNode; trailing?: React.ReactNode }) {
  const { colors } = useRollCallTheme(); const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: Math.max(insets.top, spacing.sm), paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, backgroundColor: colors.background }}><Header title={title} subtitle={subtitle} leading={backAction ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={backAction} style={({ pressed }) => ({ minWidth: sizing.touchTarget, minHeight: sizing.touchTarget, alignItems: 'flex-start', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}><Text style={[typography.title, { color: colors.primary }]}>‹</Text></Pressable> : leading} trailing={trailing} /></View>;
}

function NavMark({ label, active }: { label: string; active: boolean }) { const { colors } = useRollCallTheme(); return <View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.surfaceSecondary }}><Text style={[typography.caption, { color: active ? colors.textInverse : colors.textSecondary }]}>{label.slice(0, 1)}</Text></View>; }

function NavItem({ destination, active, mode }: { destination: NavigationDestination; active: boolean; mode: 'bottom' | 'rail' | 'sidebar' }) {
  const { colors } = useRollCallTheme(); const showLabel = mode !== 'rail'; const [focused, setFocused] = React.useState(false);
  return <Link href={destination.href as never} asChild><Pressable accessibilityRole="link" accessibilityLabel={destination.label} accessibilityState={{ selected: active, disabled: destination.disabled }} disabled={destination.disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minWidth: mode === 'bottom' ? 64 : undefined, minHeight: sizing.touchTarget, flex: mode === 'bottom' ? 1 : undefined, borderRadius: radii.md, flexDirection: mode === 'sidebar' ? 'row' : 'column', alignItems: 'center', justifyContent: mode === 'sidebar' ? 'flex-start' : 'center', paddingHorizontal: mode === 'sidebar' ? spacing.md : spacing.sm, gap: mode === 'sidebar' ? spacing.md : spacing.xs, backgroundColor: active ? colors.surfaceSecondary : pressed ? colors.surfaceSecondary : 'transparent', borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, opacity: destination.disabled ? 0.42 : 1 })}>{destination.icon ?? <NavMark label={destination.label} active={active} />}{showLabel ? <Text numberOfLines={1} maxFontSizeMultiplier={1.5} style={[mode === 'bottom' ? typography.caption : typography.label, { color: active ? colors.primary : colors.textSecondary }]}>{destination.label}</Text> : null}{destination.badge ? <View accessibilityLabel={`${destination.badge} notifications`} style={{ position: mode === 'sidebar' ? 'relative' : 'absolute', top: mode === 'sidebar' ? undefined : 3, right: mode === 'sidebar' ? undefined : 7, minWidth: 18, height: 18, borderRadius: radii.full, paddingHorizontal: spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error }}><Text style={[typography.caption, { color: colors.textInverse, fontSize: 10 }]}>{destination.badge > 99 ? '99+' : destination.badge}</Text></View> : null}</Pressable></Link>;
}

function NavigationRegion({ configuration, activeKey, mode }: { configuration: NavigationConfiguration; activeKey: string; mode: 'bottom' | 'rail' | 'sidebar' }) {
  const { colors } = useRollCallTheme(); const insets = useSafeAreaInsets(); const destinations = [...configuration.primary, ...(mode === 'sidebar' ? configuration.secondary ?? [] : [])];
  if (mode === 'bottom') return <View accessibilityRole="tablist" style={{ flexDirection: 'row', minHeight: 58 + insets.bottom, paddingHorizontal: spacing.sm, paddingTop: spacing.xs, paddingBottom: Math.max(insets.bottom, spacing.xs), borderTopWidth: 1, borderTopColor: colors.borderSubtle, backgroundColor: colors.surface }}>{destinations.map((destination) => <NavItem key={destination.key} destination={destination} active={destination.key === activeKey} mode={mode} />)}</View>;
  return <View accessibilityLabel="Primary navigation" style={{ width: mode === 'rail' ? 76 : 224, paddingTop: Math.max(insets.top, spacing.xl), paddingBottom: Math.max(insets.bottom, spacing.xl), paddingHorizontal: mode === 'rail' ? spacing.sm : spacing.md, gap: spacing.sm, borderRightWidth: 1, borderRightColor: colors.borderSubtle, backgroundColor: colors.surface }}><View style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.sm }}><Text numberOfLines={1} style={[mode === 'rail' ? typography.heading : typography.title, { color: colors.textPrimary }]}>{mode === 'rail' ? 'R' : 'RollCall'}</Text></View>{destinations.map((destination) => <NavItem key={destination.key} destination={destination} active={destination.key === activeKey} mode={mode} />)}</View>;
}

export function AppShell({ navigation, activeKey, header, children }: React.PropsWithChildren<{ navigation: NavigationConfiguration; activeKey: string; header?: React.ReactNode }>) {
  const { colors } = useRollCallTheme(); const { width } = useResponsive(); const mode = width >= breakpoints.expanded ? 'sidebar' : width >= breakpoints.medium ? 'rail' : 'bottom';
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}><View style={{ flex: 1, flexDirection: mode === 'bottom' ? 'column' : 'row' }}>{mode === 'bottom' ? null : <NavigationRegion configuration={navigation} activeKey={activeKey} mode={mode} />}<View style={{ flex: 1, minWidth: 0 }}>{header}{children}</View>{mode === 'bottom' ? <NavigationRegion configuration={navigation} activeKey={activeKey} mode={mode} /> : null}</View></KeyboardAvoidingView>;
}
