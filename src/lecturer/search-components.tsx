import React from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';

export function GlobalSearchField({ value, onChangeText, inputRef, accessibilityLabel = 'Search the lecturer workspace', placeholder = 'Search data, pages, and actions', ...props }: { value: string; onChangeText: (value: string) => void; inputRef?: React.RefObject<TextInput | null> } & Omit<TextInputProps, 'value' | 'onChangeText'>) {
  const { colors } = useRollCallTheme();
  return <View style={{ minHeight: 54, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg, overflow: 'hidden' }}>
    <Ionicons accessibilityElementsHidden name="search" size={sizing.iconMd} color={colors.textMuted} />
    <TextInput ref={inputRef} {...props} autoFocus accessibilityLabel={accessibilityLabel} placeholder={placeholder} placeholderTextColor={colors.textMuted} value={value} onChangeText={onChangeText} returnKeyType="search" style={[typography.body, { flex: 1, minHeight: 54, paddingHorizontal: spacing.md, color: colors.textPrimary, outlineStyle: 'none' } as never, props.style]} />
    {value ? <IconButton label="Clear global search" onPress={() => onChangeText('')}><Ionicons name="close-circle" size={sizing.iconMd} color={colors.textMuted} /></IconButton> : null}
  </View>;
}

export function SearchResultRow({ icon, title, detail, accessibilityLabel, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; detail: string; accessibilityLabel?: string; onPress: () => void }) {
  const { colors } = useRollCallTheme();
  const [focused, setFocused] = React.useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? `${title}, ${detail}`} accessibilityHint="Opens this result" onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ minHeight: 66, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm, borderRadius: radii.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, borderBottomWidth: focused ? 2 : 1, borderBottomColor: focused ? colors.focusRing : colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.72 : 1 })}>
    <View accessibilityElementsHidden style={{ width: 38, height: 38, borderRadius: radii.md, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon} size={sizing.iconMd} color={colors.primary} /></View>
    <View style={{ flex: 1, gap: spacing.xxs }}><Text numberOfLines={1} style={[typography.subheading, { color: colors.textPrimary }]}>{title}</Text><Text numberOfLines={2} style={[typography.caption, { color: colors.textMuted }]}>{detail}</Text></View>
    <Ionicons accessibilityElementsHidden name="chevron-forward" size={sizing.iconSm} color={colors.textMuted} />
  </Pressable>;
}

export function SearchResultGroup({ title, children }: React.PropsWithChildren<{ title: string }>) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel={`${title} results`} style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>{title}</Text>{children}</View>;
}
