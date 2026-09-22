import { Text, View } from 'react-native';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme, type ThemePreference } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { ThemeOption } from '@/lecturer/profile-components';
import { StudentShell } from '@/student/shell';
const options: readonly { value: ThemePreference; title: string; detail: string }[] = [{ value: 'system', title: 'System', detail: 'Match this device automatically' }, { value: 'light', title: 'Light', detail: 'Always use the light appearance' }, { value: 'dark', title: 'Dark', detail: 'Always use the near-black RollCall appearance' }];
export default function StudentAppearance() { const { colors, preference, scheme, setPreference } = useRollCallTheme(); return <StudentShell activeKey="home" title="Appearance" subtitle="Theme" back backFallback="/student/settings"><PageContainer width="compact"><View style={{ gap: spacing.xs }}><SectionHeading title="Choose appearance" /><Text style={[typography.body, { color: colors.textSecondary }]}>Changes apply immediately and are saved on this device.</Text></View><View accessibilityRole="radiogroup" accessibilityLabel="Appearance options">{options.map((option, index) => <ThemeOption key={option.value} {...option} selected={preference === option.value} onSelect={setPreference} last={index === options.length - 1} />)}</View><Text accessibilityLiveRegion="polite" style={[typography.bodySmall, { color: colors.textMuted }]}>RollCall is using the {scheme} appearance{preference === 'system' ? ' from your device setting' : ''}.</Text></PageContainer></StudentShell>; }
