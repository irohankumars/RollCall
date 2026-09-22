import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii, sizing, spacing, typography, elevation } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { useAccessibleModal } from '@/design-system/modal-accessibility';

export function AdaptiveUtilityMenu({ visible, title, onDismiss, children }: React.PropsWithChildren<{ visible: boolean; title: string; onDismiss: () => void }>) {
  const { colors, reduceMotion } = useRollCallTheme();
  const { isCompact } = useResponsive();
  const { contentRef, initialRef } = useAccessibleModal(visible, onDismiss);
  return <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : isCompact ? 'slide' : 'fade'} onRequestClose={onDismiss}>
    <View style={{ flex: 1, justifyContent: isCompact ? 'flex-end' : 'flex-start', alignItems: isCompact ? 'stretch' : 'flex-end', backgroundColor: isCompact ? colors.overlay : 'transparent' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Close ${title}`} onPress={onDismiss} style={{ position: 'absolute', inset: 0 }} />
      <View ref={contentRef} accessibilityViewIsModal style={[{ width: isCompact ? '100%' : 360, maxHeight: '88%', marginTop: isCompact ? 0 : 76, marginRight: isCompact ? 0 : spacing.xxl, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, borderBottomLeftRadius: isCompact ? 0 : radii.lg, borderBottomRightRadius: isCompact ? 0 : radii.lg, borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceElevated, padding: spacing.xl, paddingBottom: isCompact ? spacing.giant : spacing.xl, gap: spacing.md }, elevation.medium]}>
        {isCompact ? <View accessibilityElementsHidden style={{ width: 36, height: 5, borderRadius: radii.full, backgroundColor: colors.border, alignSelf: 'center' }} /> : null}
        <View style={{ minHeight: sizing.touchTarget, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Text ref={initialRef} accessibilityRole="header" style={[typography.title, { flex: 1, color: colors.textPrimary }]}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Close ${title}`} onPress={onDismiss} style={({ pressed }) => ({ width: sizing.touchTarget, height: sizing.touchTarget, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' })}><Ionicons name="close" size={sizing.iconLg} color={colors.textMuted} /></Pressable></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.md }}>{children}</ScrollView>
      </View>
    </View>
  </Modal>;
}

export function UtilityMenuRow({ icon, title, detail, destructive = false, disabled = false, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; detail?: string; destructive?: boolean; disabled?: boolean; onPress: () => void }) {
  const { colors } = useRollCallTheme();
  const [focused, setFocused] = React.useState(false);
  const foreground = destructive ? colors.error : colors.textPrimary;
  return <Pressable accessibilityRole="menuitem" accessibilityLabel={title} accessibilityHint={detail} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 58, borderRadius: radii.md, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: disabled ? 0.44 : pressed ? 0.72 : 1 })}>
    <Ionicons accessibilityElementsHidden name={icon} size={sizing.iconMd} color={destructive ? colors.error : colors.primary} />
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: foreground }]}>{title}</Text>{detail ? <Text style={[typography.caption, { color: colors.textMuted }]}>{detail}</Text> : null}</View>
    {!destructive ? <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} /> : null}
  </Pressable>;
}

export function UtilityMenuLoading({ label }: { label: string }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLiveRegion="polite" style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}><ActivityIndicator color={colors.primary} /><Text style={[typography.bodySmall, { color: colors.textMuted }]}>{label}</Text></View>;
}
