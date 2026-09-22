import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/design-system/components/core';
import { AlertBanner, Confirmation } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { ManagementRow, RelationshipSection } from '@/hod/management-components';
import { useHodManagement } from '@/hod/management-provider';

export default function InviteLecturer() {
  const { colors } = useRollCallTheme(); const data = useHodManagement(); const [name, setName] = useState(''); const [employeeId, setEmployeeId] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [error, setError] = useState(''); const [review, setReview] = useState(false); const [saving, setSaving] = useState(false); const valid = name.trim() && employeeId.trim() && /^\S+@\S+\.\S+$/.test(email);
  const invite = () => { if (saving) return; setSaving(true); try { const item = data.inviteLecturer({ name: name.trim(), employeeId: employeeId.trim().toUpperCase(), email: email.trim().toLowerCase(), phone: phone.trim() || undefined }); setReview(false); router.replace(`/hod/management/lecturers/${item.id}` as Href); } catch (reason) { setError(reason instanceof Error ? reason.message : 'The invitation could not be sent.'); setReview(false); setSaving(false); } };
  return <HodShell activeKey="department" title="Add lecturer" subtitle="Invitation workflow" back backFallback="/hod/management/lecturers"><PageContainer width="compact" fixedActions={<Button label="Review invitation" disabled={!valid} onPress={() => { setError(''); setReview(true); }} />}><View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Lecturer invitation</Text><Text style={[typography.body, { color: colors.textSecondary }]}>The lecturer will receive an invitation to create their own secure access.</Text></View>{error ? <AlertBanner title="Invitation not sent" message={error} tone="error" /> : null}<TextField label="Name" required value={name} onChangeText={setName} /><TextField label="Employee ID" required value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" /><TextField label="Official email" required value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><TextField label="Department" value={data.department.name} editable={false} /><RelationshipSection title="Access"><ManagementRow title="No shared password" detail="The invited lecturer creates their own sign-in method." /></RelationshipSection><Confirmation visible={review} title="Send lecturer invitation?" message={`${name || 'This lecturer'} (${employeeId || 'employee ID'}) will be invited at ${email || 'the official email'}.`} confirmLabel="Send invitation" onDismiss={() => setReview(false)} onConfirm={invite} /></PageContainer></HodShell>;
}
