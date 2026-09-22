import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type LecturerActivityCategory = 'ATTENDANCE' | 'ACCOUNT';
export type LecturerActivityItem = {
  id: string;
  category: LecturerActivityCategory;
  title: string;
  context: string;
  timestamp: string;
  group: 'Today' | 'Yesterday' | 'Earlier';
  icon: IconName;
  destination: string;
};

export function PersonalActivityRow({ item, onOpen, onMore, last = false }: { item: LecturerActivityItem; onOpen: () => void; onMore: () => void; last?: boolean }) {
  const { colors } = useRollCallTheme(); const [focused, setFocused] = React.useState(false);
  return <View style={{ minHeight: 76, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderSubtle, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}, ${item.context}, ${item.timestamp}`} accessibilityHint="Opens the related page" onPress={onOpen} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ flex: 1, minHeight: 72, marginLeft: -spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radii.sm, borderWidth: focused ? 2 : 0, borderColor: colors.focusRing, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.74 : 1 })}>
      <View accessibilityElementsHidden style={{ width: 36, height: 36, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSecondary }}><Ionicons name={item.icon} size={sizing.iconMd} color={colors.primary} /></View>
      <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{item.title}</Text><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.context}</Text></View>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{item.timestamp}</Text>
    </Pressable>
    <IconButton label={`More actions for ${item.title}`} onPress={onMore}><Ionicons name="ellipsis-horizontal" size={sizing.iconMd} color={colors.textMuted} /></IconButton>
  </View>;
}
