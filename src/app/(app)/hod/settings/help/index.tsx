import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AlertBanner } from '@/design-system/components/feedback';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell, SectionHeading } from '@/hod/components';
import { SettingsRow } from '@/hod/profile-components';
import { FAQRow } from '@/lecturer/settings-components';

const faqs = [
  { question: 'How do I start an attendance session?', answer: 'Open a class, choose the relevant class meeting, and use Start Attendance. Review the session details before beginning.' },
  { question: 'Why can’t I access a class?', answer: 'Class access follows your institution-managed teaching assignments. If an expected class is missing, use your institution’s established support channel.' },
  { question: 'What happens if recognition fails?', answer: 'Use the attendance session’s available review or manual flow. Do not retry indefinitely or record attendance without checking the student.' },
  { question: 'How do I change notification preferences?', answer: 'Open Settings, then Notification Preferences. Each category and delivery preference can be changed independently.' },
] as const;

export default function HelpSupport() {
  const { colors } = useRollCallTheme();
  const [expanded, setExpanded] = useState<number>();
  return <HodShell activeKey="settings" title="Help & Support" subtitle="Answers and assistance" back backFallback="/hod/settings">
    <PageContainer width="compact">
      <View style={{ gap: spacing.sm }}>
        <SectionHeading title="Frequently asked questions" />
        {faqs.map((item, index) => <FAQRow key={item.question} {...item} expanded={expanded === index} onPress={() => setExpanded((current) => current === index ? undefined : index)} last={index === faqs.length - 1} />)}
      </View>
      <View style={{ gap: spacing.sm }}>
        <SectionHeading title="Get help" />
        <SettingsRow icon="chatbubble-ellipses-outline" title="Contact support" detail="See the support channels available to you" onPress={() => router.push('/hod/settings/help/contact' as Href)} />
        <SettingsRow icon="flag-outline" title="Report a problem" detail="Describe an issue for the support team" onPress={() => router.push('/hod/settings/help/report' as Href)} last />
      </View>
      <AlertBanner title="Need institution help?" message="For access, enrolment, or college-managed data, use your institution’s established support channel." tone="info" />
      <Text style={[typography.caption, { color: colors.textMuted }]}>Help content in this build is informational and does not contact an external service.</Text>
    </PageContainer>
  </HodShell>;
}
