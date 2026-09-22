import { router, type Href } from 'expo-router';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { SettingsRow } from '@/lecturer/profile-components';
import { StudentShell } from '@/student/shell';

const appearanceLabels = { system: 'System', light: 'Light', dark: 'Dark' } as const;
export default function StudentSettings() {
  const { preference } = useRollCallTheme();
  return <StudentShell activeKey="home" title="Settings" subtitle="Account preferences" back backFallback={'/student/profile' as Href}><PageContainer width="compact">
    <SectionHeading title="Appearance" /><SettingsRow icon="contrast-outline" title="Appearance" detail="Choose how RollCall looks on this device" value={appearanceLabels[preference]} onPress={() => router.push('/student/settings/appearance' as Href)} last />
    <SectionHeading title="Notifications" /><SettingsRow icon="notifications-outline" title="Notification Preferences" detail="Choose the Student updates shown to you" onPress={() => router.push('/student/settings/notifications' as Href)} last />
    <SectionHeading title="Account" /><SettingsRow icon="shield-checkmark-outline" title="Account & Security" detail="Review identity, sign-in information, and sessions" onPress={() => router.push('/student/settings/security' as Href)} last />
    <SectionHeading title="Support" /><SettingsRow icon="help-circle-outline" title="Help & Support" detail="Find answers or report a problem" onPress={() => router.push('/student/settings/help' as Href)} last />
    <SectionHeading title="Information" /><SettingsRow icon="information-circle-outline" title="About RollCall" detail="App version, privacy, terms, and product information" onPress={() => router.push('/student/settings/about' as Href)} last />
  </PageContainer></StudentShell>;
}
