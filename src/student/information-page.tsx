import { Text, View } from 'react-native';
import { PageContainer } from '@/shell/app-shell';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { StudentShell } from './shell';
export function StudentInformationPage({ title, subtitle, sections }: { title: string; subtitle: string; sections: { title: string; body: string }[] }) { const { colors } = useRollCallTheme(); return <StudentShell activeKey="home" title={title} subtitle={subtitle} back backFallback="/student/settings/about"><PageContainer width="compact">{sections.map((section) => <View key={section.title} style={{ gap: spacing.sm }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>{section.title}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{section.body}</Text></View>)}</PageContainer></StudentShell>; }
