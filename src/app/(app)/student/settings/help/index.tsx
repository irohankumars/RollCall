import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AlertBanner } from '@/design-system/components/feedback';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { SettingsRow } from '@/lecturer/profile-components';
import { FAQRow } from '@/lecturer/settings-components';
import { StudentShell } from '@/student/shell';

const faqs = [
  ['Why is my attendance not updated?', 'Attendance can remain pending while a lecturer completes or reviews a session. Use Report Attendance Issue from the relevant session if the record remains incorrect.'],
  ['Where can I find my class schedule?', 'Open Schedule from the main navigation to see today and the current academic week.'],
  ['How do I change notifications?', 'Open Settings, then Notification Preferences. Each available Student category can be changed independently.'],
] as const;
export default function StudentHelp() { const { colors } = useRollCallTheme(); const [expanded, setExpanded] = useState<number>(); return <StudentShell activeKey="home" title="Help & Support" subtitle="Answers and assistance" back backFallback="/student/settings"><PageContainer width="compact"><View style={{ gap: spacing.sm }}><SectionHeading title="Frequently asked questions" />{faqs.map(([question, answer], index) => <FAQRow key={question} question={question} answer={answer} expanded={expanded === index} onPress={() => setExpanded(expanded === index ? undefined : index)} last={index === faqs.length - 1} />)}</View><View style={{ gap: spacing.sm }}><SectionHeading title="Get help" /><SettingsRow icon="chatbubble-ellipses-outline" title="Contact support" detail="See the support channels available to you" onPress={() => router.push('/student/settings/help/contact' as Href)} /><SettingsRow icon="flag-outline" title="Report a problem" detail="Describe an issue for student support" onPress={() => router.push('/student/settings/help/report' as Href)} last /></View><AlertBanner title="Institution-managed help" message="For access, enrolment, or academic records, use your institution's established student support channel." tone="info" /><Text style={[typography.caption, { color: colors.textMuted }]}>This frontend build does not contact an external support service.</Text></PageContainer></StudentShell>; }
