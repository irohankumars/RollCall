import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { useHodManagement } from '@/hod/management-provider';

export default function EditStudent() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>(); const data = useHodManagement(); const student = data.students.find((item) => item.id === studentId); const [name, setName] = useState(student?.name ?? ''); const [email, setEmail] = useState(student?.email ?? ''); const [error, setError] = useState('');
  if (!student) return <HodShell activeKey="department" title="Edit student" back><PageContainer><StateView state="empty" title="Student not found" /></PageContainer></HodShell>;
  const valid = name.trim() && /^\S+@\S+\.\S+$/.test(email);
  return <HodShell activeKey="department" title="Edit student" subtitle={student.usn} back backFallback={`/hod/management/students/${student.id}`}><PageContainer width="compact" fixedActions={<Button label="Save changes" disabled={!valid} onPress={() => { try { data.updateStudent(student.id, { name: name.trim(), email: email.trim().toLowerCase() }); router.back(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Changes could not be saved.'); } }} />}>{error ? <AlertBanner title="Changes not saved" message={error} tone="error" /> : null}<TextField label="Name" required value={name} onChangeText={setName} /><TextField label="Official email" required value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><TextField label="USN / Student ID" value={student.usn} editable={false} helper="Student identity is preserved." /><TextField label="Department" value={data.department.name} editable={false} /></PageContainer></HodShell>;
}
