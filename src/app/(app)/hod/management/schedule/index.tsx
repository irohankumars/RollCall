import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/design-system/components/core';
import { SegmentedControl } from '@/design-system/components/forms';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { FilterChips, ManagementHeader, RelationshipSection } from '@/hod/management-components';
import { LastUpdated, ScheduleRow } from '@/hod/operations-components';
import { useHodOperations } from '@/hod/operations-provider';

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const;
export default function DepartmentSchedule() {
  const { colors } = useRollCallTheme(); const operations = useHodOperations(); const currentDay = new Date().toLocaleDateString([], { weekday: 'long' }); const [mode, setMode] = useState<'daily' | 'weekly'>('daily'); const [day, setDay] = useState(days.includes(currentDay as typeof days[number]) ? currentDay as typeof days[number] : 'Monday'); const [week, setWeek] = useState(0); const entries = operations.schedules.filter((item) => mode === 'weekly' || item.day === day).sort((a,b) => days.indexOf(a.day as typeof days[number])-days.indexOf(b.day as typeof days[number]) || a.startTime.localeCompare(b.startTime));
  return <HodShell activeKey="department" title="Department schedule" subtitle="Daily and weekly operations" back backFallback="/hod/management"><PageContainer width="full"><ManagementHeader title="Schedule" description="Classes, lecturers, rooms, and teaching time in one department view." action="Create schedule" onAction={() => router.push('/hod/management/schedule/new' as Href)} /><View style={{ maxWidth: 360 }}><SegmentedControl value={mode} options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }]} onChange={setMode} /></View>{mode === 'daily' ? <FilterChips value={day} options={days.map((value) => ({ value, label: value.slice(0,3) }))} onChange={setDay} /> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Button label="Previous week" variant="text" onPress={() => setWeek((value) => value - 1)} /><Text style={[typography.label, { color: colors.textPrimary }]}>Week {week === 0 ? 'of today' : week > 0 ? `+${week}` : week}</Text><Button label="Next week" variant="text" onPress={() => setWeek((value) => value + 1)} /></View>}<RelationshipSection title={mode === 'daily' ? day : 'Weekly schedule'}>{entries.map((entry) => <View key={entry.id} style={{ gap: spacing.xs }}>{mode === 'weekly' ? <Text style={[typography.label, { color: entry.day === currentDay ? colors.primary : colors.textMuted, paddingTop: spacing.md }]}>{entry.day}{entry.day === currentDay ? ' · Today' : ''}</Text> : null}<ScheduleRow entry={entry} state={operations.sessions.find((item) => item.scheduleId === entry.id)?.state} onPress={() => router.push(`/hod/management/schedule/${entry.id}` as Href)} /></View>)}</RelationshipSection><LastUpdated value={operations.schedules.reduce((latest, item) => item.updatedAt > latest ? item.updatedAt : latest, operations.schedules[0]?.updatedAt ?? new Date().toISOString())} /></PageContainer></HodShell>;
}
