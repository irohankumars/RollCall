import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { OptionPicker } from '@/hod/management-components';
import { useHodManagement } from '@/hod/management-provider';

export default function CreateClassSection() {
  const data = useHodManagement(); const [name, setName] = useState(''); const [academicYearId, setYear] = useState(data.academicYears.find((item) => item.current)?.id ?? ''); const [semesterId, setSemester] = useState(''); const [batchId, setBatch] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false); const valid = name.trim() && academicYearId && semesterId && batchId;
  const save = () => { if (!valid || saving) return; setSaving(true); try { const item = data.addSection({ name: name.trim(), academicYearId, semesterId, batchId }); router.replace(`/hod/management/classes/${item.id}` as Href); } catch (reason) { setError(reason instanceof Error ? reason.message : 'The class could not be created.'); setSaving(false); } };
  return <HodShell activeKey="department" title="Create class" subtitle="Computer Science & Engineering" back backFallback="/hod/management/classes"><PageContainer width="compact" fixedActions={<Button label="Create class" loading={saving} disabled={!valid} onPress={save} />}>{error ? <AlertBanner title="Class not created" message={error} tone="error" /> : null}<TextField label="Class / section name" required placeholder="CSE 2026 A" value={name} onChangeText={setName} /><TextField label="Department" value={data.department.name} editable={false} /><OptionPicker label="Academic year" value={academicYearId} options={data.academicYears.map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => { setYear(value); setSemester(''); setBatch(''); }} /><OptionPicker label="Semester" value={semesterId} disabled={!academicYearId} options={data.semesters.filter((item) => item.academicYearId === academicYearId).map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => { setSemester(value); setBatch(''); }} /><OptionPicker label="Batch" value={batchId} disabled={!semesterId} options={data.batches.filter((item) => item.semesterId === semesterId).map((item) => ({ value: item.id, label: item.name }))} onChange={setBatch} /></PageContainer></HodShell>;
}
