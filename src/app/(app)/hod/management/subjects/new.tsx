import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { OptionPicker } from '@/hod/management-components';
import { useHodManagement } from '@/hod/management-provider';

export default function AddSubject() {
  const data = useHodManagement(); const [name, setName] = useState(''); const [code, setCode] = useState(''); const [academicYearId, setYear] = useState(data.academicYears.find((item) => item.current)?.id ?? ''); const [semesterId, setSemester] = useState(''); const [batchId, setBatch] = useState(''); const [credits, setCredits] = useState('4'); const [error, setError] = useState(''); const [saving, setSaving] = useState(false); const valid = name.trim() && code.trim() && academicYearId && semesterId && batchId && Number(credits) > 0;
  const save = () => { if (!valid || saving) return; setSaving(true); try { const item = data.addSubject({ name: name.trim(), code: code.trim().toUpperCase(), academicYearId, semesterId, batchId, credits: Number(credits) }); router.replace(`/hod/management/subjects/${item.id}` as Href); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Subject could not be saved.'); setSaving(false); } };
  return <HodShell activeKey="department" title="Add subject" subtitle="Academic configuration" back backFallback="/hod/management/subjects"><PageContainer width="compact" fixedActions={<Button label="Save subject" loading={saving} disabled={!valid} onPress={save} />}>{error ? <AlertBanner title="Subject not saved" message={error} tone="error" /> : null}<TextField label="Subject name" required value={name} onChangeText={setName} /><TextField label="Subject code" required value={code} onChangeText={setCode} autoCapitalize="characters" /><TextField label="Department" value={data.department.name} editable={false} /><OptionPicker label="Academic year" value={academicYearId} options={data.academicYears.map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => { setYear(value); setSemester(''); setBatch(''); }} /><OptionPicker label="Semester" value={semesterId} disabled={!academicYearId} options={data.semesters.filter((item) => item.academicYearId === academicYearId).map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => { setSemester(value); setBatch(''); }} /><OptionPicker label="Batch applicability" value={batchId} disabled={!semesterId} options={data.batches.filter((item) => item.semesterId === semesterId).map((item) => ({ value: item.id, label: item.name }))} onChange={setBatch} /><TextField label="Credits" required value={credits} onChangeText={setCredits} keyboardType="number-pad" /></PageContainer></HodShell>;
}
