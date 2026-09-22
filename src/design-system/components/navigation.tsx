import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { IconButton } from './core';
import { radii, sizing, spacing, typography } from '../tokens';
import { useRollCallTheme } from '../theme-provider';

export function Header({ title, subtitle, leading, trailing }: { title: string; subtitle?: string; leading?: React.ReactNode; trailing?: React.ReactNode }) {
  const { colors } = useRollCallTheme(); return <View style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><View>{leading}</View><View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}><Text accessibilityRole="header" numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.6} style={[typography.title, { color: colors.textPrimary }]}>{title}</Text>{subtitle ? <Text numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.5} style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text> : null}</View><View style={{ flexShrink: 0 }}>{trailing}</View></View>;
}
export function BackButton({ onPress }: { onPress?: () => void }) { const { colors } = useRollCallTheme(); return <IconButton label="Go back" onPress={onPress}><Text style={[typography.title, { color: colors.primary }]}>‹</Text></IconButton>; }
export function NavigationItem({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) { const { colors } = useRollCallTheme(); return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.md, paddingHorizontal: spacing.lg, justifyContent: 'center', backgroundColor: selected || pressed ? colors.surfaceSecondary : 'transparent' })}><Text style={[typography.label, { color: selected ? colors.primary : colors.textSecondary }]}>{label}</Text></Pressable>; }
export const TabPrimitive = NavigationItem;

export function Drawer({ visible, title, children, onDismiss }: React.PropsWithChildren<{ visible: boolean; title: string; onDismiss: () => void }>) {
  const { colors, reduceMotion } = useRollCallTheme(); return <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={onDismiss}><Pressable accessibilityRole="button" accessibilityLabel="Dismiss drawer" onPress={onDismiss} style={{ flex: 1, backgroundColor: colors.overlay }}><Pressable accessibilityViewIsModal onPress={(event) => event.stopPropagation()} style={{ width: '82%', maxWidth: 360, height: '100%', padding: spacing.xxl, paddingTop: spacing.giant, gap: spacing.xl, backgroundColor: colors.surfaceElevated }}><Header title={title} />{children}</Pressable></Pressable></Modal>;
}
