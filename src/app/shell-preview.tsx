import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge, Button } from '@/design-system/components/core';
import { SegmentedControl } from '@/design-system/components/forms';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme, type ThemePreference } from '@/design-system/theme-provider';
import { AppShell, CompactHeader, PageContainer } from '@/shell/app-shell';
import { routeArchitecture, shellPreviewNavigation } from '@/shell/navigation-config';
import { useGlobalOverlays } from '@/shell/overlay-provider';

export default function ShellPreview() {
  const { colors, preference, setPreference } = useRollCallTheme(); const overlays = useGlobalOverlays(); const [width, setWidth] = useState<'compact' | 'standard' | 'detail' | 'full'>('standard');
  const themeOptions = [{ label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }] as const;
  return <AppShell navigation={shellPreviewNavigation} activeKey="shell" header={<CompactHeader title="Shell preview" subtitle="Internal Build 2 route" backAction={() => router.back()} trailing={<Badge label="Development" tone="info" />} />}>
    <PageContainer width={width} fixedActions={<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}><Button label="Primary action area" disabled /></View>}>
      <View style={{ gap: spacing.sm }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>Adaptive frame</Text><Text style={[typography.body, { maxWidth: 640, color: colors.textSecondary }]}>Resize the viewport to switch between bottom navigation, navigation rail, and compact sidebar. This content is intentionally minimal.</Text></View>
      <View style={{ gap: spacing.sm }}><Text style={[typography.label, { color: colors.textPrimary }]}>Page width</Text><SegmentedControl value={width} options={[{ label: 'Compact', value: 'compact' }, { label: 'Standard', value: 'standard' }, { label: 'Detail', value: 'detail' }, { label: 'Full', value: 'full' }]} onChange={setWidth} /></View>
      <View style={{ gap: spacing.sm }}><Text style={[typography.label, { color: colors.textPrimary }]}>Theme</Text><SegmentedControl value={preference} options={themeOptions} onChange={(value) => setPreference(value as ThemePreference)} /></View>
      <View style={{ gap: spacing.sm }}><Text style={[typography.label, { color: colors.textPrimary }]}>Global overlays</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}><Button label="Toast" variant="secondary" onPress={() => overlays.showToast('Global toast is working')} /><Button label="Alert" variant="secondary" onPress={() => overlays.showAlert({ title: 'Global alert', message: 'Alerts render above the active route.' })} /><Button label="Confirm" variant="secondary" onPress={() => overlays.showConfirmation({ title: 'Confirm action', message: 'Confirmation is hosted once by the application shell.' })} /><Button label="Sheet" variant="secondary" onPress={() => overlays.showSheet({ title: 'Global sheet', message: 'Sheets remain available to every future route.' })} /><Button label="Loading" variant="secondary" onPress={() => { overlays.setLoading(true); setTimeout(() => overlays.setLoading(false), 900); }} /></View></View>
      <View style={{ gap: spacing.sm }}><Text style={[typography.label, { color: colors.textPrimary }]}>Route architecture</Text>{Object.entries(routeArchitecture).map(([key, value]) => <View key={key} style={{ minHeight: 38, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}><Text style={[typography.bodySmall, { width: 100, color: colors.textMuted }]}>{key}</Text><Text selectable style={[typography.numeric, { color: colors.textPrimary }]}>{value}</Text></View>)}</View>
    </PageContainer>
  </AppShell>;
}
