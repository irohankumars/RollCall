import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme, type ThemePreference } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerPageSkeleton, HodShell, ResourceState, SectionHeading } from '@/hod/components';
import { GlobalSearchField, SearchResultGroup, SearchResultRow } from '@/lecturer/search-components';
import { loadLecturerSearchData } from '@/lecturer/search-data';
import { useResource } from '@/lecturer/use-resource';
import { useHodUtilities } from '@/hod/utility-provider';
import { useHodManagement } from '@/hod/management-provider';
import { useHodOperations } from '@/hod/operations-provider';

const recentSearchKey = 'rollcall.hod.recent-searches';
const suggestions = ['Settings', 'Dark mode', 'Notifications', 'Profile'];
const pages = [
  { id: 'home', title: 'Home', detail: 'Today’s classes, next session, and recent attendance', keywords: 'today dashboard HOD', href: '/hod', icon: 'home-outline' },
  { id: 'classes', title: 'Classes', detail: 'Assigned subjects, batches, and student rosters', keywords: 'subjects batches students roster', href: '/hod/classes', icon: 'school-outline' },
  { id: 'history', title: 'Attendance History', detail: 'Completed attendance sessions and records', keywords: 'sessions records', href: '/hod/history', icon: 'time-outline' },
  { id: 'notifications', title: 'Notifications', detail: 'Attendance, class, and system updates', keywords: 'inbox unread alerts', href: '/hod/notifications', icon: 'notifications-outline' },
  { id: 'profile', title: 'Profile', detail: 'HOD identity and teaching assignments', keywords: 'account personal', href: '/hod/profile', icon: 'person-outline' },
  { id: 'settings', title: 'Settings', detail: 'Appearance, notifications, security, and account preferences', keywords: 'preferences account', href: '/hod/settings', icon: 'settings-outline' },
  { id: 'appearance', title: 'Appearance', detail: 'System, Light, and Dark theme controls', keywords: 'theme dark mode light mode system theme', href: '/hod/settings/appearance', icon: 'contrast-outline' },
  { id: 'security', title: 'Account & Security', detail: 'Identity, sessions, recovery, and security information', keywords: 'account security devices recovery', href: '/hod/settings/security', icon: 'shield-checkmark-outline' },
  { id: 'signin', title: 'Sign-in Methods', detail: 'Institution, Google, and Apple access methods', keywords: 'login authentication google apple', href: '/hod/settings/security/sign-in-methods', icon: 'key-outline' },
  { id: 'notification-preferences', title: 'Notification Preferences', detail: 'Choose notification topics and delivery methods', keywords: 'notifications alerts push email', href: '/hod/settings/notifications', icon: 'options-outline' },
  { id: 'help', title: 'Help & Support', detail: 'FAQs, college support, and problem reporting', keywords: 'contact support faq problem', href: '/hod/settings/help', icon: 'help-circle-outline' },
  { id: 'about', title: 'About RollCall', detail: 'Product, version, privacy, terms, and face data', keywords: 'information privacy terms product', href: '/hod/settings/about', icon: 'information-circle-outline' },
  { id: 'activity', title: 'Activity', detail: 'Recent attendance and account activity', keywords: 'events updates recent', href: '/hod/activity', icon: 'pulse-outline' },
  { id: 'department', title: 'Department', detail: 'Academic and people management overview', keywords: 'management dashboard department', href: '/hod/management', icon: 'business-outline' },
  { id: 'department-students', title: 'Department Students', detail: 'Student accounts and academic placement', keywords: 'management people USN placement', href: '/hod/management/students', icon: 'people-outline' },
  { id: 'department-lecturers', title: 'Department Lecturers', detail: 'Lecturers, invitations, and workload', keywords: 'management employees invitation', href: '/hod/management/lecturers', icon: 'person-add-outline' },
  { id: 'academic-years', title: 'Academic Years', detail: 'Years, semesters, and batches', keywords: 'academic structure semester batch', href: '/hod/management/academic-years', icon: 'calendar-outline' },
  { id: 'department-subjects', title: 'Department Subjects', detail: 'Subjects and teaching coverage', keywords: 'management courses academic', href: '/hod/management/subjects', icon: 'book-outline' },
  { id: 'department-classes', title: 'Classes & Sections', detail: 'Sections, enrolment, and Class Teachers', keywords: 'management sections batch', href: '/hod/management/classes', icon: 'layers-outline' },
  { id: 'assignments', title: 'Teaching Assignments', detail: 'Assign lecturers or HOD to subjects and classes', keywords: 'assignment self lecturer subject class', href: '/hod/management/assignments', icon: 'git-branch-outline' },
  { id: 'class-teachers', title: 'Class Teacher Assignments', detail: 'Manage class responsibility', keywords: 'class teacher responsibility', href: '/hod/management/class-teachers', icon: 'people-circle-outline' },
  { id: 'department-schedule', title: 'Department Schedule', detail: 'Daily and weekly class timetable', keywords: 'schedule room time daily weekly', href: '/hod/management/schedule', icon: 'calendar-outline' },
  { id: 'department-attendance', title: 'Department Attendance', detail: 'Completion, monitoring, and low attendance', keywords: 'attendance conducted pending not conducted', href: '/hod/management/attendance', icon: 'checkbox-outline' },
  { id: 'attendance-issues', title: 'Attendance Issues', detail: 'Correction review and decision history', keywords: 'issue correction approve reject', href: '/hod/management/issues', icon: 'alert-circle-outline' },
  { id: 'reports', title: 'Department Reports', detail: 'Attendance and lecturer activity reports', keywords: 'report export csv', href: '/hod/management/reports', icon: 'document-text-outline' },
  { id: 'department-notifications', title: 'Department Notifications', detail: 'Audience, sending, and status history', keywords: 'announcement message send audience', href: '/hod/management/notifications', icon: 'megaphone-outline' },
] as const;

function includesQuery(values: (string | number)[], query: string) { return values.join(' ').toLowerCase().includes(query); }

export default function GlobalSearch() {
  const { colors, setPreference } = useRollCallTheme(); const { session } = useAuth(); const { openQuickActions, requestLogout } = useHodUtilities();
  const management = useHodManagement();
  const operations = useHodOperations();
  const token = session?.token ?? ''; const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(''); const [recent, setRecent] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const resource = useResource(() => loadLecturerSearchData(token), [token]); const data = resource.data;

  useEffect(() => { let active = true; void readLocalPreference(recentSearchKey).then((value) => { if (!active || !value) return; try { const stored = JSON.parse(value); if (Array.isArray(stored)) setRecent(stored.filter((item): item is string => typeof item === 'string').slice(0, 5)); } catch { /* Ignore invalid local history. */ } }); return () => { active = false; }; }, []);
  useEffect(() => { if (Platform.OS !== 'web') return; const focus = () => inputRef.current?.focus(); globalThis.window?.addEventListener('rollcall-focus-search', focus); return () => globalThis.window?.removeEventListener('rollcall-focus-search', focus); }, []);
  const remember = useCallback((value = query) => { const normalized = value.trim(); if (!normalized) return; setRecent((current) => { const next = [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 5); void writeLocalPreference(recentSearchKey, JSON.stringify(next)); return next; }); }, [query]);
  const open = useCallback((href: string) => { remember(); router.push(href as Href); }, [remember]);
  const chooseTheme = useCallback((preference: ThemePreference) => { remember(); setPreference(preference); router.push('/hod/settings/appearance' as Href); }, [remember, setPreference]);
  const actionDefinitions = useMemo(() => [
    { id: 'dark', title: 'Dark Mode', detail: 'Use RollCall’s near-black appearance', keywords: 'dark mode appearance theme', icon: 'moon-outline' as const, run: () => chooseTheme('dark') },
    { id: 'light', title: 'Light Mode', detail: 'Use RollCall’s light appearance', keywords: 'light mode appearance theme', icon: 'sunny-outline' as const, run: () => chooseTheme('light') },
    { id: 'system', title: 'System Theme', detail: 'Match this device automatically', keywords: 'system theme automatic appearance', icon: 'phone-portrait-outline' as const, run: () => chooseTheme('system') },
    { id: 'edit-profile', title: 'Edit Profile', detail: 'Change your display name, phone, or photo', keywords: 'profile edit account', icon: 'create-outline' as const, run: () => open('/hod/profile/edit') },
    { id: 'quick', title: 'Quick Actions', detail: 'Start attendance or open common HOD destinations', keywords: 'quick action attendance classes history', icon: 'add-circle-outline' as const, run: () => { remember(); openQuickActions(); } },
    { id: 'add-student', title: 'Add Student', detail: 'Create a department student account', keywords: 'management new student', icon: 'person-add-outline' as const, run: () => open('/hod/management/students/new') },
    { id: 'add-lecturer', title: 'Add Lecturer', detail: 'Invite a department lecturer', keywords: 'management invite employee', icon: 'mail-outline' as const, run: () => open('/hod/management/lecturers/new') },
    { id: 'add-subject', title: 'Add Subject', detail: 'Configure a subject in its academic context', keywords: 'management new subject', icon: 'book-outline' as const, run: () => open('/hod/management/subjects/new') },
    { id: 'create-class', title: 'Create Class', detail: 'Configure a class or section', keywords: 'management new section', icon: 'layers-outline' as const, run: () => open('/hod/management/classes/new') },
    { id: 'create-schedule', title: 'Create Schedule', detail: 'Add a department timetable entry', keywords: 'schedule new time room', icon: 'calendar-outline' as const, run: () => open('/hod/management/schedule/new') },
    { id: 'send-notification', title: 'Send Department Notification', detail: 'Message an authorized department audience', keywords: 'notification announcement send', icon: 'megaphone-outline' as const, run: () => open('/hod/management/notifications/new') },
    { id: 'contact', title: 'Contact Support', detail: 'Open college and RollCall support information', keywords: 'help support college contact', icon: 'mail-outline' as const, run: () => open('/hod/settings/help/contact') },
    { id: 'logout', title: 'Sign Out', detail: 'Securely end this RollCall session', keywords: 'logout log out sign out account', icon: 'log-out-outline' as const, run: () => { remember(); requestLogout(); } },
  ], [chooseTheme, open, openQuickActions, remember, requestLogout]);

  const results = useMemo(() => {
    if (!data || !deferredQuery) return { classes: [], students: [], sessions: [], pages: [], actions: [], departmentStudents: [], lecturers: [], subjects: [], sections: [], semesters: [], batches: [], assignments: [], schedules: [], issues: [], notifications: [] };
    return {
      classes: data.classes.filter((item) => includesQuery([item.subjectCode, item.subjectName, item.batchName, item.semester], deferredQuery)),
      students: data.students.filter((item) => includesQuery([item.name, item.rollNumber, item.subjectCode, item.batchName], deferredQuery)),
      sessions: data.sessions.filter((item) => { const date = new Date(item.scheduledAt); return includesQuery([item.subjectCode, item.subjectName, item.batchName, item.scheduledAt, date.toLocaleDateString(), date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })], deferredQuery); }),
      pages: pages.filter((item) => includesQuery([item.title, item.detail, item.keywords], deferredQuery)),
      actions: actionDefinitions.filter((item) => includesQuery([item.title, item.detail, item.keywords], deferredQuery)),
      departmentStudents: management.students.filter((item) => includesQuery([item.name, item.usn, item.email], deferredQuery)),
      lecturers: management.lecturers.filter((item) => includesQuery([item.name, item.employeeId, item.email], deferredQuery)),
      subjects: management.subjects.filter((item) => includesQuery([item.name, item.code], deferredQuery)),
      sections: management.sections.filter((item) => includesQuery([item.name], deferredQuery)),
      semesters: management.semesters.filter((item) => includesQuery([item.name], deferredQuery)),
      batches: management.batches.filter((item) => includesQuery([item.name], deferredQuery)),
      assignments: management.assignments.filter((item) => item.active && includesQuery([management.subjects.find((subject) => subject.id === item.subjectId)?.name ?? '', management.sections.find((section) => section.id === item.sectionId)?.name ?? '', management.lecturers.find((lecturer) => lecturer.id === item.lecturerId)?.name ?? ''], deferredQuery)),
      schedules: operations.schedules.filter((item) => includesQuery([item.day, item.startTime, item.room, management.subjects.find((subject) => subject.id === item.subjectId)?.name ?? '', management.sections.find((section) => section.id === item.sectionId)?.name ?? ''], deferredQuery)),
      issues: operations.issues.filter((item) => includesQuery([item.issueType, item.status, management.students.find((student) => student.id === item.studentId)?.name ?? '', management.subjects.find((subject) => subject.id === item.subjectId)?.name ?? ''], deferredQuery)),
      notifications: operations.notifications.filter((item) => includesQuery([item.title, item.message, item.audience, item.status], deferredQuery)),
    };
  }, [actionDefinitions, data, deferredQuery, management, operations]);
  const searching = query.trim().toLowerCase() !== deferredQuery; const resultCount = Object.values(results).reduce((count, items) => count + items.length, 0); const hasQuery = Boolean(deferredQuery);

  return <HodShell activeKey="search" title="Search" subtitle={Platform.OS === 'web' ? 'Ctrl/Cmd + K' : 'Your HOD workspace'} back backFallback="/hod">
    <PageContainer width="full">
      <GlobalSearchField
        inputRef={inputRef}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => remember()}
        accessibilityLabel="Search the HOD workspace"
        placeholder="Search classes, students, attendance, and settings"
      />
      {resource.loading ? <LecturerPageSkeleton rows={4} /> : null}<ResourceState loading={false} error={resource.error} retry={resource.retry} />
      {data && !hasQuery ? <View style={{ gap: spacing.xxl }}>
        <View style={{ gap: spacing.md }}><SectionHeading title="Suggestions" /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{suggestions.map((item) => <Button key={item} label={item} variant="secondary" onPress={() => { setQuery(item); inputRef.current?.focus(); }} />)}</View></View>
        <View style={{ gap: spacing.sm }}><SectionHeading title="Recent searches" action={recent.length ? 'Clear' : undefined} onAction={() => { setRecent([]); void writeLocalPreference(recentSearchKey, '[]'); }} />{recent.length ? recent.map((item) => <SearchResultRow key={item} icon="time-outline" title={item} detail="Search again" onPress={() => { setQuery(item); inputRef.current?.focus(); }} />) : <Text style={[typography.bodySmall, { color: colors.textMuted }]}>Your recent searches will appear here.</Text>}</View>
      </View> : null}
      {data && hasQuery ? <View style={{ gap: spacing.xxl }}>
        <View style={{ minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>{searching ? <ActivityIndicator size="small" color={colors.primary} /> : null}<Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{searching ? 'Searching' : `${resultCount} result${resultCount === 1 ? '' : 's'}`}</Text></View>
        {!searching && !resultCount ? <StateView state="empty" title="No results found" message="Try a page, action, subject, batch, student, or session date." /> : null}
        {results.pages.length ? <SearchResultGroup title="Pages">{results.pages.map((item) => <SearchResultRow key={item.id} icon={item.icon} title={item.title} detail={item.detail} onPress={() => open(item.href)} />)}</SearchResultGroup> : null}
        {results.actions.length ? <SearchResultGroup title="Actions">{results.actions.map((item) => <SearchResultRow key={item.id} icon={item.icon} title={item.title} detail={item.detail} onPress={item.run} />)}</SearchResultGroup> : null}
        {results.departmentStudents.length ? <SearchResultGroup title="Department students">{results.departmentStudents.map((item) => <SearchResultRow key={item.id} icon="person-outline" title={item.name} detail={`${item.usn} · ${management.sections.find((section) => section.id === item.sectionId)?.name}`} onPress={() => { operations.recordViewed({ id: item.id, type: 'Student', title: item.name, href: `/hod/management/students/${item.id}` }); open(`/hod/management/students/${item.id}`); }} />)}</SearchResultGroup> : null}
        {results.lecturers.length ? <SearchResultGroup title="Lecturers">{results.lecturers.map((item) => <SearchResultRow key={item.id} icon="briefcase-outline" title={item.name} detail={`${item.employeeId} · ${item.status}`} onPress={() => { if (item.id === 'me') open('/hod/profile'); else { operations.recordViewed({ id: item.id, type: 'Lecturer', title: item.name, href: `/hod/management/lecturers/${item.id}` }); open(`/hod/management/lecturers/${item.id}`); } }} />)}</SearchResultGroup> : null}
        {results.subjects.length ? <SearchResultGroup title="Department subjects">{results.subjects.map((item) => <SearchResultRow key={item.id} icon="book-outline" title={item.name} detail={`${item.code} · ${management.semesters.find((semester) => semester.id === item.semesterId)?.name}`} onPress={() => { operations.recordViewed({ id: item.id, type: 'Subject', title: item.name, href: `/hod/management/subjects/${item.id}` }); open(`/hod/management/subjects/${item.id}`); }} />)}</SearchResultGroup> : null}
        {results.sections.length ? <SearchResultGroup title="Classes & sections">{results.sections.map((item) => <SearchResultRow key={item.id} icon="layers-outline" title={item.name} detail={`${item.studentCount} students · ${management.lecturers.find((lecturer) => lecturer.id === item.classTeacherId)?.name ?? 'No Class Teacher'}`} onPress={() => { operations.recordViewed({ id: item.id, type: 'Class', title: item.name, href: `/hod/management/classes/${item.id}` }); open(`/hod/management/classes/${item.id}`); }} />)}</SearchResultGroup> : null}
        {results.semesters.length || results.batches.length ? <SearchResultGroup title="Academic structure">{results.semesters.map((item) => <SearchResultRow key={item.id} icon="calendar-outline" title={item.name} detail={management.academicYears.find((year) => year.id === item.academicYearId)?.name ?? 'Academic year'} onPress={() => open('/hod/management/semesters')} />)}{results.batches.map((item) => <SearchResultRow key={item.id} icon="folder-outline" title={item.name} detail={`${item.studentCount} students`} onPress={() => open('/hod/management/batches')} />)}</SearchResultGroup> : null}
        {results.assignments.length ? <SearchResultGroup title="Teaching assignments">{results.assignments.map((item) => <SearchResultRow key={item.id} icon="git-branch-outline" title={management.subjects.find((subject) => subject.id === item.subjectId)?.name ?? 'Subject'} detail={`${management.sections.find((section) => section.id === item.sectionId)?.name} · ${management.lecturers.find((lecturer) => lecturer.id === item.lecturerId)?.name}`} onPress={() => open('/hod/management/assignments')} />)}</SearchResultGroup> : null}
        {results.schedules.length ? <SearchResultGroup title="Department schedule">{results.schedules.map((item) => <SearchResultRow key={item.id} icon="calendar-outline" title={management.subjects.find((subject) => subject.id === item.subjectId)?.name ?? 'Class'} detail={`${item.day} · ${item.startTime} · ${item.room}`} onPress={() => open(`/hod/management/schedule/${item.id}`)} />)}</SearchResultGroup> : null}
        {results.issues.length ? <SearchResultGroup title="Attendance issues">{results.issues.map((item) => <SearchResultRow key={item.id} icon="alert-circle-outline" title={management.students.find((student) => student.id === item.studentId)?.name ?? 'Student issue'} detail={`${item.issueType} · ${item.status}`} onPress={() => open(`/hod/management/issues/${item.id}`)} />)}</SearchResultGroup> : null}
        {results.notifications.length ? <SearchResultGroup title="Department notifications">{results.notifications.map((item) => <SearchResultRow key={item.id} icon="megaphone-outline" title={item.title} detail={`${item.audience} · ${item.status}`} onPress={() => open(`/hod/management/notifications/${item.id}`)} />)}</SearchResultGroup> : null}
        {results.classes.length ? <SearchResultGroup title="Classes, subjects & batches">{results.classes.map((item) => <SearchResultRow key={item.id} icon="book-outline" title={item.subjectName} detail={`${item.subjectCode} · ${item.batchName} · ${item.semester}`} onPress={() => open(`/hod/classes/${item.id}`)} />)}</SearchResultGroup> : null}
        {results.students.length ? <SearchResultGroup title="Students">{results.students.map((item) => <SearchResultRow key={`${item.classId}-${item.id}`} icon="person-outline" title={item.name} detail={`${item.rollNumber} · ${item.subjectCode} · ${item.batchName}`} onPress={() => open(`/hod/classes/${item.classId}/students/${item.id}`)} />)}</SearchResultGroup> : null}
        {results.sessions.length ? <SearchResultGroup title="Attendance sessions & history">{results.sessions.map((item) => <SearchResultRow key={item.id} icon="checkmark-circle-outline" title={item.subjectName} detail={`${item.subjectCode} · ${new Date(item.scheduledAt).toLocaleDateString()} · ${item.present} of ${item.total} present`} onPress={() => open(`/hod/attendance/${item.id}`)} />)}</SearchResultGroup> : null}
        <Button label="Refresh results" variant="text" onPress={resource.retry} style={{ alignSelf: 'flex-start' }} />
      </View> : null}
    </PageContainer>
  </HodShell>;
}
