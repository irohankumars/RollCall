import { useLocalSearchParams } from 'expo-router';
import { StateView } from '@/design-system/components/states';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { ScheduleForm } from '@/hod/schedule-form';
import { useHodOperations } from '@/hod/operations-provider';
export default function EditSchedule() { const { scheduleId } = useLocalSearchParams<{ scheduleId: string }>(); const entry = useHodOperations().schedules.find((item) => item.id === scheduleId); return entry ? <ScheduleForm entry={entry} /> : <HodShell activeKey="department" title="Schedule" back><PageContainer><StateView state="empty" title="Schedule entry not found" /></PageContainer></HodShell>; }
