import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, type ScrollViewProps } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton, Header } from '@/design-system/components/navigation';
import { breakpoints, radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { resolveNavigation, type AppRole, type NavigationConfiguration, type NavigationDestination } from './navigation-config';

export type PageWidth = 'compact' | 'standard' | 'detail' | 'full';
const pageWidths: Record<PageWidth, number | '100%'> = { compact: 620, standard: 840, detail: sizing.contentReadable, full: '100%' };

export function PageContainer({ children, width = 'standard', scrollable = true, fixedActions, contentContainerStyle, ...scrollProps }: React.PropsWithChildren<{ width?: PageWidth; scrollable?: boolean; fixedActions?: React.ReactNode } & ScrollViewProps>) {
  const { colors } = useRollCallTheme(); const responsive = useResponsive(); const insets = useSafeAreaInsets();
  const content = <View style={[{ width: '100%', maxWidth: pageWidths[width], alignSelf: 'center', paddingHorizontal: responsive.contentPadding, paddingTop: spacing.lg, paddingBottom: fixedActions ? spacing.xl : Math.max(spacing.xxl, insets.bottom), gap: spacing.xl }, contentContainerStyle]}>{children}</View>;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{scrollable ? <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'} contentInsetAdjustmentBehavior="automatic" {...scrollProps} contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : content}{fixedActions ? <View style={{ borderTopWidth: 1, borderTopColor: colors.borderSubtle, backgroundColor: colors.surface, paddingHorizontal: responsive.contentPadding, paddingTop: spacing.md, paddingBottom: Math.max(spacing.md, insets.bottom) }}>{fixedActions}</View> : null}</View>;
}

export function CompactHeader({ title, subtitle, backAction, leading, trailing }: { title: string; subtitle?: string; backAction?: () => void; leading?: React.ReactNode; trailing?: React.ReactNode }) {
  const { colors } = useRollCallTheme(); const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: Math.max(insets.top, spacing.sm), paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, backgroundColor: colors.background }}><Header title={title} subtitle={subtitle} leading={backAction ? <BackButton onPress={backAction} /> : leading} trailing={trailing} /></View>;
}

type NavigationMode = 'bottom' | 'rail' | 'sidebar';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const navigationIcons: Record<string, { active: IconName; inactive: IconName }> = {
  today: { active: 'home', inactive: 'home-outline' },
  home: { active: 'home', inactive: 'home-outline' },
  classes: { active: 'school', inactive: 'school-outline' },
  department: { active: 'business', inactive: 'business-outline' },
  'class-teacher': { active: 'people', inactive: 'people-outline' },
  attendance: { active: 'checkbox', inactive: 'checkbox-outline' },
  schedule: { active: 'calendar', inactive: 'calendar-outline' },
  history: { active: 'time', inactive: 'time-outline' },
  notifications: { active: 'notifications', inactive: 'notifications-outline' },
  activity: { active: 'pulse', inactive: 'pulse-outline' },
  account: { active: 'person-circle', inactive: 'person-circle-outline' },
  profile: { active: 'person-circle', inactive: 'person-circle-outline' },
  shell: { active: 'apps', inactive: 'apps-outline' },
  routes: { active: 'git-branch', inactive: 'git-branch-outline' },
  overlays: { active: 'layers', inactive: 'layers-outline' },
  'design-system': { active: 'color-palette', inactive: 'color-palette-outline' },
  protected: { active: 'shield-checkmark', inactive: 'shield-checkmark-outline' },
};

function NavigationIcon({ destination, active }: { destination: NavigationDestination; active: boolean }) {
  const { colors } = useRollCallTheme(); const icon = navigationIcons[destination.key] ?? { active: 'grid', inactive: 'grid-outline' };
  return <Ionicons accessibilityElementsHidden importantForAccessibility="no" name={active ? icon.active : icon.inactive} size={sizing.iconMd} color={active ? colors.primary : colors.textMuted} />;
}

function NavItem({ destination, active, mode }: { destination: NavigationDestination; active: boolean; mode: NavigationMode }) {
  const { colors } = useRollCallTheme(); const showLabel = mode !== 'rail'; const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole={mode === 'bottom' ? 'tab' : 'link'} accessibilityLabel={destination.label} accessibilityState={{ selected: active, disabled: destination.disabled }} aria-selected={mode === 'bottom' ? active : undefined} aria-current={mode !== 'bottom' && active ? 'page' : undefined} disabled={destination.disabled} onPress={() => router.navigate(destination.href as Href)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ position: 'relative', minWidth: mode === 'bottom' ? 56 : undefined, minHeight: sizing.touchTarget, flex: mode === 'bottom' ? 1 : undefined, flexBasis: mode === 'bottom' ? 0 : undefined, borderRadius: mode === 'sidebar' ? radii.sm : 0, flexDirection: mode === 'sidebar' ? 'row' : 'column', alignItems: 'center', justifyContent: mode === 'sidebar' ? 'flex-start' : 'center', paddingHorizontal: mode === 'sidebar' ? spacing.md : spacing.xs, gap: mode === 'sidebar' ? spacing.md : spacing.xxs, backgroundColor: active || pressed ? colors.surfaceSecondary : 'transparent', borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, opacity: destination.disabled ? 0.42 : pressed ? 0.72 : 1 })}>{mode === 'sidebar' && active ? <View accessibilityElementsHidden style={{ position: 'absolute', left: 0, top: spacing.sm, bottom: spacing.sm, width: 3, borderRadius: radii.full, backgroundColor: colors.primary }} /> : null}<NavigationIcon destination={destination} active={active} />{showLabel ? <Text numberOfLines={1} maxFontSizeMultiplier={1.5} style={[mode === 'bottom' ? typography.caption : typography.label, { color: active ? colors.primary : colors.textSecondary }]}>{destination.label}</Text> : null}{destination.badge ? <View accessibilityLabel={`${destination.badge} notifications`} style={{ position: mode === 'sidebar' ? 'relative' : 'absolute', top: mode === 'sidebar' ? undefined : 2, right: mode === 'sidebar' ? undefined : 6, marginLeft: mode === 'sidebar' ? 'auto' : undefined, minWidth: 18, height: 18, borderRadius: radii.full, paddingHorizontal: spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.error }}><Text style={[typography.caption, { color: colors.textInverse, fontSize: 10 }]}>{destination.badge > 99 ? '99+' : destination.badge}</Text></View> : null}</Pressable>;
}

function NavigationRegion({ configuration, activeKey, mode }: { configuration: NavigationConfiguration; activeKey: string; mode: NavigationMode }) {
  const { colors } = useRollCallTheme(); const insets = useSafeAreaInsets(); const primary = configuration.primary; const secondary = mode === 'sidebar' ? configuration.secondary ?? [] : [];
  if (mode === 'bottom') return <View accessibilityRole="tablist" accessibilityLabel="Primary navigation" style={{ width: '100%', flexShrink: 0, flexDirection: 'row', minHeight: 56 + insets.bottom, paddingHorizontal: spacing.xs, paddingTop: spacing.xxs, paddingBottom: Math.max(insets.bottom, spacing.xxs), borderTopWidth: 1, borderTopColor: colors.borderSubtle, backgroundColor: colors.surface }}>{primary.map((destination) => <NavItem key={destination.key} destination={destination} active={destination.key === activeKey} mode={mode} />)}</View>;
  return <View accessibilityLabel="Primary navigation" style={{ width: mode === 'rail' ? 72 : 224, paddingTop: Math.max(insets.top, spacing.md), paddingBottom: Math.max(insets.bottom, spacing.md), paddingHorizontal: mode === 'rail' ? spacing.sm : spacing.md, borderRightWidth: 1, borderRightColor: colors.borderSubtle, backgroundColor: colors.surface }}><View style={{ minHeight: mode === 'rail' ? spacing.lg : 52, justifyContent: 'center', paddingHorizontal: spacing.md }}>{mode === 'sidebar' ? <Text numberOfLines={1} style={[typography.heading, { color: colors.textPrimary }]}>RollCall</Text> : null}</View><View style={{ gap: spacing.xs }}>{primary.map((destination) => <NavItem key={destination.key} destination={destination} active={destination.key === activeKey} mode={mode} />)}</View>{secondary.length ? <View style={{ marginTop: 'auto', gap: spacing.xs }}>{secondary.map((destination) => <NavItem key={destination.key} destination={destination} active={destination.key === activeKey} mode={mode} />)}</View> : null}</View>;
}

export function AppShell({ navigation, activeKey, header, children, role, permissions = [] }: React.PropsWithChildren<{ navigation: NavigationConfiguration; activeKey: string; header?: React.ReactNode; role?: AppRole; permissions?: readonly string[] }>) {
  const { colors } = useRollCallTheme(); const { width } = useResponsive(); const [keyboardVisible, setKeyboardVisible] = React.useState(false); const mode: NavigationMode = width >= breakpoints.expanded ? 'sidebar' : width >= breakpoints.medium ? 'rail' : 'bottom'; const resolvedNavigation = React.useMemo(() => resolveNavigation(navigation, role, permissions), [navigation, role, permissions]);
  React.useEffect(() => { const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true)); const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false)); return () => { show.remove(); hide.remove(); }; }, []);
  return <KeyboardAvoidingView style={{ flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden', backgroundColor: colors.background }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}><View style={{ flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden', flexDirection: mode === 'bottom' ? 'column' : 'row' }}>{mode === 'bottom' ? null : <NavigationRegion configuration={resolvedNavigation} activeKey={activeKey} mode={mode} />}<View style={{ flex: 1, minWidth: 0 }}>{header}{children}</View>{mode === 'bottom' && !keyboardVisible ? <NavigationRegion configuration={resolvedNavigation} activeKey={activeKey} mode={mode} /> : null}</View></KeyboardAvoidingView>;
}
