import { Text, View } from 'react-native';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { AppInfoRow } from '@/lecturer/settings-components';
import { StudentShell } from '@/student/shell';
export default function StudentAbout() { const { colors } = useRollCallTheme(); const version = Constants.expoConfig?.version ?? 'Not available'; const build = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode?.toString() ?? 'Not assigned'; return <StudentShell activeKey="home" title="About RollCall" subtitle="App and policy information" back backFallback="/student/settings"><PageContainer width="compact"><View style={{ gap: spacing.xs }}><SectionHeading title="RollCall" /><Text style={[typography.body, { color: colors.textSecondary }]}>A focused attendance and academic workspace for students.</Text></View><View style={{ gap: spacing.sm }}><SectionHeading title="App information" /><AppInfoRow label="Version" value={version} /><AppInfoRow label="Build" value={build} last /></View><View style={{ gap: spacing.sm }}><SectionHeading title="Information" /><AppInfoRow label="About RollCall" onPress={() => router.push('/student/settings/about/product' as Href)} /><AppInfoRow label="Privacy Policy" onPress={() => router.push('/student/settings/about/privacy' as Href)} /><AppInfoRow label="Terms" onPress={() => router.push('/student/settings/about/terms' as Href)} /><AppInfoRow label="Face Data & Privacy" onPress={() => router.push('/student/settings/about/face-data' as Href)} /><AppInfoRow label="Support" onPress={() => router.push('/student/settings/help' as Href)} last /></View></PageContainer></StudentShell>; }
