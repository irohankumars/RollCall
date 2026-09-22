import { View } from 'react-native';
import { AlertBanner } from '@/design-system/components/feedback';
import { StateView } from '@/design-system/components/states';
import { spacing } from '@/design-system/tokens';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { PreferenceRow } from '@/lecturer/settings-components';
import { useStudentFinal } from '@/student/final-provider';
import { StudentShell } from '@/student/shell';
export default function StudentNotificationPreferences() { const { loading, notificationPreferences: value, updateNotificationPreference: update } = useStudentFinal(); return <StudentShell activeKey="home" title="Notification Preferences" subtitle="Student updates" back backFallback="/student/settings"><PageContainer width="compact">{loading ? <StateView state="loading" /> : <><AlertBanner title="Saved on this device" message="Changes apply immediately to local notification categories in this frontend build." tone="info" /><View style={{ gap: spacing.sm }}><SectionHeading title="Notification categories" /><PreferenceRow label="Attendance" detail="Attendance confirmations and recorded status updates" value={value.attendance} onChange={(next) => update('attendance', next)} /><PreferenceRow label="Attendance issues" detail="Updates about issues you submitted" value={value.attendanceIssues} onChange={(next) => update('attendanceIssues', next)} /><PreferenceRow label="Academic" detail="Schedule, exam, and academic calendar updates" value={value.academic} onChange={(next) => update('academic', next)} /><PreferenceRow label="Important" detail="High-priority academic information" value={value.important} onChange={(next) => update('important', next)} /><PreferenceRow label="System" detail="Account and RollCall service updates" value={value.system} onChange={(next) => update('system', next)} last /></View></>}</PageContainer></StudentShell>; }
