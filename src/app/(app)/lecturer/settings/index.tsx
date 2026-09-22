import { router, type Href } from 'expo-router';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerShell, SectionHeading } from '@/lecturer/components';
import { SettingsRow } from '@/lecturer/profile-components';

const appearanceLabels = { system: 'System', light: 'Light', dark: 'Dark' } as const;

export default function LecturerSettings() {
  const { preference } = useRollCallTheme();
  return <LecturerShell activeKey="settings" title="Settings" subtitle="Account preferences" back backFallback={'/lecturer/profile' as Href}>
    <PageContainer width="compact">
      <SectionHeading title="Account" />
      <SettingsRow icon="person-outline" title="Profile" detail="View and edit your lecturer profile" onPress={() => router.push('/lecturer/profile' as Href)} />
      <SettingsRow icon="shield-checkmark-outline" title="Account & Security" detail="Review identity, sign-in methods, and sessions" onPress={() => router.push('/lecturer/settings/security' as Href)} last />
      <SectionHeading title="Preferences" />
      <SettingsRow icon="contrast-outline" title="Appearance" detail="Choose how RollCall looks on this device" value={appearanceLabels[preference]} onPress={() => router.push('/lecturer/settings/appearance' as Href)} />
      <SettingsRow icon="notifications-outline" title="Notification Preferences" detail="Choose updates and delivery preferences" onPress={() => router.push('/lecturer/settings/notifications' as Href)} last />
      <SectionHeading title="Support & information" />
      <SettingsRow icon="help-circle-outline" title="Help & Support" detail="Find answers or report a problem" onPress={() => router.push('/lecturer/settings/help' as Href)} />
      <SettingsRow icon="information-circle-outline" title="About RollCall" detail="App version, privacy, and product information" onPress={() => router.push('/lecturer/settings/about' as Href)} last />
    </PageContainer>
  </LecturerShell>;
}
