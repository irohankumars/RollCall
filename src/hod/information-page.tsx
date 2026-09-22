import { Text, View } from 'react-native';
import { PrivacyNotice } from '@/design-system/components/permissions';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell, SectionHeading } from './components';

export function InformationPage({ title, subtitle, introduction, sections }: { title: string; subtitle: string; introduction: string; sections: readonly { title: string; body: string; notice?: boolean }[] }) {
  const { colors } = useRollCallTheme();
  return <HodShell activeKey="settings" title={title} subtitle={subtitle} back backFallback="/hod/settings/about">
    <PageContainer width="compact">
      <Text style={[typography.body, { color: colors.textSecondary }]}>{introduction}</Text>
      {sections.map((section) => section.notice ? <PrivacyNotice key={section.title} title={section.title}>{section.body}</PrivacyNotice> : <View key={section.title} style={{ gap: spacing.sm }}><SectionHeading title={section.title} /><Text style={[typography.body, { color: colors.textSecondary }]}>{section.body}</Text></View>)}
    </PageContainer>
  </HodShell>;
}

