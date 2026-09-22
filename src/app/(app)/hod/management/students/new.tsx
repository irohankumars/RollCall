import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { OptionPicker } from '@/hod/management-components';
import { useHodManagement } from '@/hod/management-provider';

export default function AddStudent() {
  const { colors } = useRollCallTheme(); const data = useHodManagement(); const [name, setName] = useState(''); const [usn, setUsn] = useState(''); const [email, setEmail] = useState(''); const [semesterId, setSemester] = useState(''); const [batchId, setBatch] = useState(''); const [sectionId, setSection] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const valid = name.trim() && usn.trim() && /^\S+@\S+\.\S+$/.test(email) && semesterId && batchId && sectionId;
  const save = () => { if (!valid || saving) { setError('Complete every required field with a valid official email.'); return; } setSaving(true); setError(''); try { const item = data.addStudent({ name: name.trim(), usn: usn.trim().toUpperCase(), email: email.trim().toLowerCase(), semesterId, batchId, sectionId }); router.replace(`/hod/management/students/${item.id}` as Href); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Student could not be added.'); setSaving(false); } };
  return <HodShell activeKey="department" title="Add student" subtitle="Computer Science & Engineering" back backFallback="/hod/management/students"><PageContainer width="compact" fixedActions={<Button label="Add student" loading={saving} disabled={!valid} onPress={save} />}><View style={{ gap: spacing.xs }}><Text accessibilityRole="header" style={[typography.largeTitle, { color: colors.textPrimary }]}>Student account</Text><Text style={[typography.body, { color: colors.textSecondary }]}>The department is fixed to Computer Science & Engineering.</Text></View>{error ? <AlertBanner title="Check student details" message={error} tone="error" /> : null}<TextField label="Name" required value={name} onChangeText={setName} autoCapitalize="words" /><TextField label="USN / Student ID" required value={usn} onChangeText={setUsn} autoCapitalize="characters" /><TextField label="Official email" required value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><TextField label="Department" value={data.department.name} editable={false} /><OptionPicker label="Semester" value={semesterId} options={data.semesters.filter((item) => item.status === 'Active').map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => { setSemester(value); setBatch(''); setSection(''); }} /><OptionPicker label="Batch" value={batchId} disabled={!semesterId} options={data.batches.filter((item) => item.semesterId === semesterId).map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => { setBatch(value); setSection(''); }} /><OptionPicker label="Class / Section" value={sectionId} disabled={!batchId} options={data.sections.filter((item) => item.batchId === batchId).map((item) => ({ value: item.id, label: item.name }))} onChange={setSection} /></PageContainer></HodShell>;
}
