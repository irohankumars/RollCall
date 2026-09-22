import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/design-system/components/core';
import { BottomSheet } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { spacing } from '@/design-system/tokens';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { ManagementHeader, ManagementRow, OptionPicker, RelationshipSection } from '@/hod/management-components';
import { useHodManagement } from '@/hod/management-provider';

export default function Semesters() {
  const data = useHodManagement(); const [sheet, setSheet] = useState(false); const [editingId, setEditingId] = useState<string>(); const [name, setName] = useState(''); const [academicYearId, setYear] = useState(data.academicYears.find((item) => item.current)?.id ?? '');
  const openAdd = () => { setEditingId(undefined); setName(''); setYear(data.academicYears.find((item) => item.current)?.id ?? ''); setSheet(true); };
  return <HodShell activeKey="department" title="Semesters" subtitle="Academic structure" back backFallback="/hod/management/academic-years"><PageContainer width="detail"><ManagementHeader title="Semesters" description="Semesters always belong to an academic year." action="Add semester" onAction={openAdd} /><RelationshipSection title="Configured semesters">{data.semesters.map((semester) => <ManagementRow key={semester.id} title={semester.name} detail={data.academicYears.find((item) => item.id === semester.academicYearId)?.name ?? 'Academic year'} status={semester.current ? 'Current' : semester.status} actions={<View style={{ flexDirection: 'row' }}><Button label="Edit" variant="text" onPress={() => { setEditingId(semester.id); setName(semester.name); setYear(semester.academicYearId); setSheet(true); }} />{!semester.current ? <Button label={semester.status === 'Active' ? 'Deactivate' : 'Activate'} variant="text" onPress={() => data.toggleSemester(semester.id)} /> : null}</View>} />)}</RelationshipSection><BottomSheet visible={sheet} title={editingId ? 'Edit semester' : 'Add semester'} onDismiss={() => setSheet(false)}><View style={{ gap: spacing.lg }}><TextField label="Semester" placeholder="Semester 8" value={name} onChangeText={setName} /><OptionPicker label="Academic year" value={academicYearId} options={data.academicYears.map((item) => ({ value: item.id, label: item.name, detail: item.period }))} onChange={setYear} /><Button label={editingId ? 'Save changes' : 'Add semester'} disabled={!name.trim() || !academicYearId} onPress={() => { if (editingId) data.updateSemester(editingId, name.trim(), academicYearId); else data.addSemester(name.trim(), academicYearId); setSheet(false); }} /></View></BottomSheet></PageContainer></HodShell>;
}
