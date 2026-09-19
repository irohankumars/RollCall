import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { Button, Card } from './core';
import { elevation, radii, sizing, spacing, typography } from '../tokens';
import { useRollCallTheme } from '../theme-provider';

type FeedbackTone = 'info' | 'success' | 'warning' | 'error';
export function AlertBanner({ title, message, tone = 'info', action }: { title: string; message: string; tone?: FeedbackTone; action?: React.ReactNode }) {
  const { colors } = useRollCallTheme(); const color = colors[tone]; const background = colors[`${tone}Surface` as const];
  return <View accessibilityRole="alert" style={{ borderRadius: radii.md, borderCurve: 'continuous', padding: spacing.lg, gap: spacing.sm, backgroundColor: background, borderLeftWidth: 4, borderLeftColor: color }}><Text style={[typography.subheading, { color }]}>{title}</Text><Text style={[typography.bodySmall, { color: colors.textPrimary }]}>{message}</Text>{action}</View>;
}

export function Toast({ message, tone = 'info' }: { message: string; tone?: FeedbackTone }) {
  const { colors } = useRollCallTheme(); return <View accessibilityLiveRegion="polite" style={[{ minHeight: sizing.touchTarget, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', borderRadius: radii.full, paddingHorizontal: spacing.lg, backgroundColor: colors.textPrimary }, elevation.medium]}><Text style={[typography.label, { color: colors.textInverse }]}>{message}</Text></View>;
}

export function Dialog({ visible, title, message, confirmLabel = 'Confirm', destructive = false, onConfirm, onDismiss }: { visible: boolean; title: string; message: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void; onDismiss: () => void }) {
  const { colors } = useRollCallTheme(); return <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}><Pressable accessibilityRole="button" accessibilityLabel="Dismiss dialog" onPress={onDismiss} style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xxl }}><Pressable accessibilityRole="none" onPress={(event) => event.stopPropagation()}><Card elevated style={{ maxWidth: 480, width: '100%', alignSelf: 'center' }}><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{title}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{message}</Text><View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}><Button label="Cancel" variant="text" onPress={onDismiss} /><Button label={confirmLabel} variant={destructive ? 'destructive' : 'primary'} onPress={onConfirm} /></View></Card></Pressable></Pressable></Modal>;
}

export function BottomSheet({ visible, title, children, onDismiss }: React.PropsWithChildren<{ visible: boolean; title: string; onDismiss: () => void }>) {
  const { colors } = useRollCallTheme(); return <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}><Pressable accessibilityLabel="Dismiss sheet" accessibilityRole="button" onPress={onDismiss} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }}><Pressable onPress={(event) => event.stopPropagation()} style={{ borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, backgroundColor: colors.surfaceElevated, padding: spacing.xxl, paddingBottom: spacing.giant, gap: spacing.lg }}><View style={{ width: 36, height: 5, borderRadius: radii.full, backgroundColor: colors.border, alignSelf: 'center' }} /><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{title}</Text>{children}</Pressable></Pressable></Modal>;
}

export function ProcessingIndicator({ label = 'Processing' }: { label?: string }) { const { colors } = useRollCallTheme(); return <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><ActivityIndicator color={colors.primary} /><Text style={[typography.body, { color: colors.textSecondary }]}>{label}</Text></View>; }

export const Confirmation = Dialog;
