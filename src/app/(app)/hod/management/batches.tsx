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

export default function Batches() {
  const data = useHodManagement(); const [sheet, setSheet] = useState(false); const [editingId, setEditingId] = useState<string>(); const [name, setName] = useState(''); const [semesterId, setSemester] = useState('');
  const openAdd = () => { setEditingId(undefined); setName(''); setSemester(''); setSheet(true); };
  return <HodShell activeKey="department" title="Batches" subtitle="Academic structure" back backFallback="/hod/management/academic-years"><PageContainer width="detail"><ManagementHeader title="Department batches" description="Batches stay tied to their semester and department context." action="Create batch" onAction={openAdd} /><RelationshipSection title="Batches">{data.batches.map((batch) => <ManagementRow key={batch.id} title={batch.name} detail={`${data.semesters.find((item) => item.id === batch.semesterId)?.name} · ${data.department.code}`} meta={`${data.students.filter((item) => item.batchId === batch.id).length} students`} status={batch.status} actions={<View style={{ flexDirection: 'row' }}><Button label="Edit" variant="text" onPress={() => { setEditingId(batch.id); setName(batch.name); setSemester(batch.semesterId); setSheet(true); }} /><Button label={batch.status === 'Active' ? 'Archive' : 'Activate'} variant="text" onPress={() => data.toggleBatch(batch.id)} /></View>} />)}</RelationshipSection><BottomSheet visible={sheet} title={editingId ? 'Edit batch' : 'Create batch'} onDismiss={() => setSheet(false)}><View style={{ gap: spacing.lg }}><TextField label="Batch / year" placeholder="Batch 2026" value={name} onChangeText={setName} /><OptionPicker label="Semester" value={semesterId} options={data.semesters.filter((item) => item.status === 'Active').map((item) => ({ value: item.id, label: item.name }))} onChange={setSemester} /><Button label={editingId ? 'Save changes' : 'Create batch'} disabled={!name.trim() || !semesterId} onPress={() => { if (editingId) data.updateBatch(editingId, name.trim(), semesterId); else data.addBatch(name.trim(), semesterId); setSheet(false); }} /></View></BottomSheet></PageContainer></HodShell>;
}
