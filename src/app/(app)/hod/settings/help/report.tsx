import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell, SectionHeading } from '@/hod/components';

const categories = ['Attendance', 'Login', 'Camera', 'Notifications', 'Other'] as const;
type Category = typeof categories[number];

export default function ReportProblem() {
  const { colors } = useRollCallTheme();
  const { submit } = useLocalSearchParams<{ submit?: 'failed' }>();
  const [category, setCategory] = useState<Category>('Attendance');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'failure'>('idle');

  const send = () => {
    const value = description.trim();
    if (value.length < 10) { setError('Add at least 10 characters so the issue is clear.'); return; }
    setError(''); setStatus('sending');
    setTimeout(() => setStatus(submit === 'failed' ? 'failure' : 'success'), 650);
  };

  return <HodShell activeKey="settings" title="Report a Problem" subtitle="Share useful issue details" back backFallback="/hod/settings/help">
    <PageContainer width="compact">
      {status === 'success' ? <AlertBanner title="Report saved" message="Your report is saved on this device. No external support service is connected yet." tone="success" /> : null}
      {status === 'failure' ? <AlertBanner title="Report not sent" message="Your description is still here. Review it and try again." tone="error" /> : null}
      <View style={{ gap: spacing.sm }}>
        <SectionHeading title="Category" />
        <View accessibilityRole="radiogroup" accessibilityLabel="Problem category" style={{ gap: spacing.xs }}>
          {categories.map((item) => {
            const selected = category === item;
            return <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected, checked: selected }} aria-checked={selected} onPress={() => setCategory(item)} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: pressed || selected ? colors.surfaceSecondary : 'transparent', opacity: pressed ? 0.75 : 1 })}>
              <View accessibilityElementsHidden style={{ width: sizing.controlSm, height: sizing.controlSm, borderRadius: radii.full, borderWidth: 2, borderColor: selected ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}>{selected ? <View style={{ width: 10, height: 10, borderRadius: radii.full, backgroundColor: colors.primary }} /> : null}</View>
              <Text style={[typography.body, { color: colors.textPrimary }]}>{item}</Text>
            </Pressable>;
          })}
        </View>
      </View>
      <TextField label="What happened?" required multiline numberOfLines={6} textAlignVertical="top" placeholder="Describe what you expected and what happened instead" value={description} onChangeText={(value) => { setDescription(value); if (error) setError(''); }} error={error} style={{ minHeight: 132, paddingVertical: spacing.md }} />
      <Text style={[typography.caption, { color: colors.textMuted }]}>Do not include passwords, student biometric data, or other sensitive information. Attachments are unavailable in this frontend build.</Text>
      <Button label={status === 'sending' ? 'Preparing report' : 'Submit report'} loading={status === 'sending'} onPress={send} />
    </PageContainer>
  </HodShell>;
}

