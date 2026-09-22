import { Text, View } from 'react-native';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell, SectionHeading } from '@/hod/components';

const guidance = ['Use only the account issued by your institution.', 'Review unfamiliar sessions and sign them out.', 'Do not share sign-in details or verification codes.', 'Contact your college administrator if access appears incorrect.'];
export default function SecurityInformation() { const { colors } = useRollCallTheme(); return <HodShell activeKey="settings" title="Security Information" subtitle="Account guidance" back><PageContainer width="compact"><SectionHeading title="Keep your account secure" /><View>{guidance.map((item, index) => <View key={item} style={{ minHeight: 52, paddingVertical: spacing.md, flexDirection: 'row', gap: spacing.md, borderBottomWidth: index === guidance.length - 1 ? 0 : 1, borderBottomColor: colors.borderSubtle }}><Text style={[typography.numeric, { color: colors.primary }]}>{index + 1}</Text><Text style={[typography.body, { flex: 1, color: colors.textSecondary }]}>{item}</Text></View>)}</View></PageContainer></HodShell>; }

