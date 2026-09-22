import { Text, View } from 'react-native';
import { AlertBanner } from '@/design-system/components/feedback';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { StudentShell } from '@/student/shell';
export default function StudentContactSupport() { const { colors } = useRollCallTheme(); return <StudentShell activeKey="home" title="Contact Support" subtitle="Available support guidance" back backFallback="/student/settings/help"><PageContainer width="compact"><AlertBanner title="Student support" message="Use your institution's established help desk or student services channel for account, enrolment, and academic-record support." tone="info" /><View style={{ gap: spacing.sm }}><SectionHeading title="Before contacting support" /><Text style={[typography.body, { color: colors.textSecondary }]}>Include the affected subject, session date, and a concise description. Never share a password or sensitive biometric information.</Text></View></PageContainer></StudentShell>; }
