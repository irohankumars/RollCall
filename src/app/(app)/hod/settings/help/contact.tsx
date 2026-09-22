import { View } from 'react-native';
import { AlertBanner } from '@/design-system/components/feedback';
import { spacing } from '@/design-system/tokens';
import { PageContainer } from '@/shell/app-shell';
import { HodShell, SectionHeading } from '@/hod/components';
import { AppInfoRow } from '@/lecturer/settings-components';

export default function ContactSupport() {
  return <HodShell activeKey="settings" title="Contact Support" subtitle="Available support channels" back backFallback="/hod/settings/help">
    <PageContainer width="compact">
      <AlertBanner title="No direct contact is configured" message="A direct RollCall support address is not configured in this frontend build." tone="info" />
      <View style={{ gap: spacing.sm }}>
        <SectionHeading title="Support routing" />
        <AppInfoRow label="College support" value="Institution channel" />
        <AppInfoRow label="RollCall support" value="Not configured" last />
      </View>
    </PageContainer>
  </HodShell>;
}
