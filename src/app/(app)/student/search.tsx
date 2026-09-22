import { useDeferredValue, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { GlobalSearchField, SearchResultGroup, SearchResultRow } from '@/lecturer/search-components';
import { studentAttendanceSessions, studentSubjects } from '@/student/student-data';
import { studentAcademicEvents, studentSchedule } from '@/student/s3-data';
import { useStudentNotifications } from '@/student/notification-provider';
import { StudentShell } from '@/student/shell';

const pages = [
  ['Today', 'My day dashboard', '/student', 'today-outline'], ['Attendance', 'Overview, history, and sessions', '/student/attendance', 'checkbox-outline'], ['My Subjects', 'Enrolled subjects and attendance', '/student/subjects', 'book-outline'], ['Schedule', 'Today and week schedule', '/student/schedule', 'calendar-outline'], ['Academic Information', 'Programme and important dates', '/student/academic', 'school-outline'], ['Notifications', 'Student inbox', '/student/notifications', 'notifications-outline'], ['Profile', 'Student identity and personal details', '/student/profile', 'person-outline'], ['Settings', 'Appearance, notifications, security, and help', '/student/settings', 'settings-outline'], ['Account & Security', 'Identity and active sessions', '/student/settings/security', 'shield-checkmark-outline'],
] as const;
type Result = { group: string; title: string; detail: string; href: Href; icon: React.ComponentProps<typeof SearchResultRow>['icon'] };
export default function StudentSearch() { const { colors } = useRollCallTheme(); const { notifications } = useStudentNotifications(); const { state } = useLocalSearchParams<{ state?: 'loading'|'error' }>(); const [query, setQuery] = useState(''); const deferred = useDeferredValue(query.trim().toLowerCase()); const results = useMemo<Result[]>(() => { const all: Result[] = [
    ...pages.map(([title, detail, href, icon]) => ({ group: 'Pages', title, detail, href: href as Href, icon })),
    ...studentSubjects.map((item) => ({ group: 'Subjects', title: item.name, detail: `${item.code} · ${item.percentage}% attendance`, href: `/student/subjects/${item.id}` as Href, icon: 'book-outline' as const })),
    ...studentAttendanceSessions.map((item) => ({ group: 'Attendance sessions', title: item.subject, detail: `${item.date} · ${item.attendance}`, href: `/student/attendance/session/${item.id}` as Href, icon: 'checkmark-circle-outline' as const })),
    ...studentSchedule.map((item) => ({ group: 'Schedule', title: item.subject, detail: `${item.date} · ${item.startTime}`, href: `/student/schedule/${item.id}` as Href, icon: 'time-outline' as const })),
    ...studentAcademicEvents.map((item) => ({ group: 'Academic events', title: item.title, detail: `${item.category} · ${item.date}`, href: `/student/academic/events/${item.id}` as Href, icon: 'calendar-outline' as const })),
    ...notifications.map((item) => ({ group: 'Notifications', title: item.title, detail: item.preview, href: `/student/notifications/${item.id}` as Href, icon: 'notifications-outline' as const })),
  ]; return deferred ? all.filter((item) => `${item.title} ${item.detail} ${item.group}`.toLowerCase().includes(deferred)).slice(0, 30) : []; }, [deferred, notifications]); const groups = [...new Set(results.map((item) => item.group))]; return <StudentShell activeKey="home" title="Search" subtitle="Find Student pages and records" back><PageContainer width="detail"><GlobalSearchField value={query} onChangeText={setQuery} accessibilityLabel="Search the student workspace" placeholder="Search subjects, attendance, exams, and settings" />{state === 'loading' ? <StateView state="loading" /> : state === 'error' ? <StateView state="error" onRetry={() => router.replace('/student/search' as Href)} /> : !deferred ? <View style={{ gap: spacing.sm }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>Try searching for</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{['Machine Learning', 'attendance', 'exam', 'settings', 'security'].map((term) => <Button key={term} label={term} variant="secondary" onPress={() => setQuery(term)} />)}</View></View> : results.length ? groups.map((group) => <SearchResultGroup key={group} title={group}>{results.filter((item) => item.group === group).map((item) => <SearchResultRow key={`${item.group}-${item.href}`} icon={item.icon} title={item.title} detail={item.detail} onPress={() => router.push(item.href)} />)}</SearchResultGroup>) : <StateView state="empty" title="No results" message={`Nothing matches '${query.trim()}'.`} />}</PageContainer></StudentShell>; }
