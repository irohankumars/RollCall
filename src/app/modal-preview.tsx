import { router } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '@/design-system/components/core';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';

export default function ModalPreview() { const { colors } = useRollCallTheme(); return <PageContainer width="compact"><Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>Modal route structure</Text><Text style={[typography.body, { color: colors.textSecondary }]}>Structural placeholder only. Future contextual flows can use native modal presentation without duplicating shell logic.</Text><Button label="Close" onPress={() => router.back()} style={{ marginTop: spacing.md }} /></PageContainer>; }
