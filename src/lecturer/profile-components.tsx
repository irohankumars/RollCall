import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, Button } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme, type ThemePreference } from '@/design-system/theme-provider';
import type { LecturerClass } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function ProfileIdentity({ name, designation, department, onEdit }: { name: string; designation: string; department: string; onEdit: () => void }) {
  const { colors } = useRollCallTheme();
  return <View style={{ paddingVertical: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.lg }}>
    <Avatar name={name} size="large" />
    <View style={{ flex: 1, minWidth: 180, gap: spacing.xs }}>
      <Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{name}</Text>
      <Text style={[typography.body, { color: colors.textSecondary }]}>{designation}</Text>
      <Text style={[typography.bodySmall, { color: colors.textMuted }]}>{department}</Text>
    </View>
    <Button label="Edit profile" variant="secondary" onPress={onEdit} />
  </View>;
}

export function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel={`${label}: ${value}`} style={{ minHeight: sizing.touchTarget, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
    <Text style={[typography.bodySmall, { width: 132, color: colors.textMuted }]}>{label}</Text>
    <Text selectable style={[typography.body, { flex: 1, color: colors.textPrimary }]}>{value}</Text>
  </View>;
}

export function RoleSummary({ classTeacherOf }: { classTeacherOf?: string }) {
  const { colors } = useRollCallTheme();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
    <Badge label="Lecturer" tone="info" />
    <View style={{ flex: 1, minWidth: 220, gap: spacing.xs }}>
      <Text style={[typography.label, { color: colors.textPrimary }]}>Class Teacher status</Text>
      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{classTeacherOf ? `Assigned to ${classTeacherOf}` : 'No class teacher assignment'}</Text>
    </View>
  </View>;
}

export function TeachingRow({ item, last = false }: { item: LecturerClass; last?: boolean }) {
  const { colors } = useRollCallTheme();
  return <View style={{ minHeight: 64, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle }}>
    <View accessibilityElementsHidden style={{ width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSecondary }}><Ionicons name="book-outline" size={sizing.iconMd} color={colors.primary} /></View>
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.subjectCode} · {item.subjectName}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.batchName} · {item.semester}</Text></View>
  </View>;
}

export function SettingsRow({ icon, title, detail, value, onPress, last = false }: { icon: IconName; title: string; detail?: string; value?: string; onPress: () => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={value ? `${title}, ${value}` : title} accessibilityHint={detail} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 64, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm, borderRadius: radii.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, borderBottomWidth: last || focused ? (focused ? 2 : 0) : 1, borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}>
    <View accessibilityElementsHidden style={{ width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSecondary }}><Ionicons name={icon} size={sizing.iconMd} color={colors.primary} /></View>
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{title}</Text>{detail ? <Text style={[typography.caption, { color: colors.textMuted }]}>{detail}</Text> : null}</View>
    {value ? <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{value}</Text> : null}
    <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconMd} color={colors.textMuted} />
  </Pressable>;
}

const themeIcons: Record<ThemePreference, IconName> = { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' };

export function ThemeOption({ value, selected, title, detail, onSelect, last = false }: { value: ThemePreference; selected: boolean; title: string; detail: string; onSelect: (value: ThemePreference) => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected, checked: selected }} aria-checked={selected} accessibilityLabel={title} accessibilityHint={detail} onPress={() => onSelect(value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 72, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm, borderRadius: radii.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, borderBottomWidth: last || focused ? (focused ? 2 : 0) : 1, borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed || selected ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}>
    <View accessibilityElementsHidden style={{ width: 40, height: 40, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.infoSurface : colors.surfaceSecondary }}><Ionicons name={themeIcons[value]} size={sizing.iconLg} color={selected ? colors.primary : colors.textSecondary} /></View>
    <View style={{ flex: 1, gap: spacing.xs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{title}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{detail}</Text></View>
    <View accessibilityElementsHidden style={{ width: sizing.controlMd, height: sizing.controlMd, borderRadius: radii.full, borderWidth: 2, borderColor: selected ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>{selected ? <View style={{ width: 12, height: 12, borderRadius: radii.full, backgroundColor: colors.primary }} /> : null}</View>
  </Pressable>;
}
