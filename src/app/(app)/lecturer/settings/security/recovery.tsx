import { Text, View } from 'react-native';
import { useAuth } from '@/auth/auth-provider';
import { AlertBanner } from '@/design-system/components/feedback';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerShell, SectionHeading } from '@/lecturer/components';

export default function AccountRecovery() { const { colors } = useRollCallTheme(); const { session } = useAuth(); return <LecturerShell activeKey="settings" title="Account Recovery" subtitle="Institution-managed access" back><PageContainer width="compact"><AlertBanner title="Recovery is managed by your institution" message="Password and account recovery are not available in this frontend build." tone="info" /><View style={{ gap: spacing.sm }}><SectionHeading title="What to do" /><Text style={[typography.body, { color: colors.textSecondary }]}>Contact your college administrator through your institution&apos;s existing support channel. Ask them to verify the identity linked to {session?.user.loginIdentifier ?? 'your lecturer account'}.</Text></View></PageContainer></LecturerShell>; }
