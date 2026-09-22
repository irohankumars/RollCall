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
import { LecturerPageSkeleton, LecturerShell, ResourceState, SectionHeading } from '@/lecturer/components';
import { GlobalSearchField, SearchResultGroup, SearchResultRow } from '@/lecturer/search-components';
import { loadLecturerSearchData } from '@/lecturer/search-data';
import { useResource } from '@/lecturer/use-resource';
import { useLecturerUtilities } from '@/lecturer/utility-provider';

const recentSearchKey = 'rollcall.lecturer.recent-searches';
const suggestions = ['Settings', 'Dark mode', 'Notifications', 'Profile'];
const pages = [
  { id: 'home', title: 'Home', detail: 'Today’s classes, next session, and recent attendance', keywords: 'today dashboard lecturer', href: '/lecturer', icon: 'home-outline' },
  { id: 'classes', title: 'Classes', detail: 'Assigned subjects, batches, and student rosters', keywords: 'subjects batches students roster', href: '/lecturer/classes', icon: 'school-outline' },
  { id: 'history', title: 'Attendance History', detail: 'Completed attendance sessions and records', keywords: 'sessions records', href: '/lecturer/history', icon: 'time-outline' },
  { id: 'notifications', title: 'Notifications', detail: 'Attendance, class, and system updates', keywords: 'inbox unread alerts', href: '/lecturer/notifications', icon: 'notifications-outline' },
  { id: 'profile', title: 'Profile', detail: 'Lecturer identity and teaching assignments', keywords: 'account personal', href: '/lecturer/profile', icon: 'person-outline' },
  { id: 'settings', title: 'Settings', detail: 'Appearance, notifications, security, and account preferences', keywords: 'preferences account', href: '/lecturer/settings', icon: 'settings-outline' },
  { id: 'appearance', title: 'Appearance', detail: 'System, Light, and Dark theme controls', keywords: 'theme dark mode light mode system theme', href: '/lecturer/settings/appearance', icon: 'contrast-outline' },
  { id: 'security', title: 'Account & Security', detail: 'Identity, sessions, recovery, and security information', keywords: 'account security devices recovery', href: '/lecturer/settings/security', icon: 'shield-checkmark-outline' },
  { id: 'signin', title: 'Sign-in Methods', detail: 'Institution, Google, and Apple access methods', keywords: 'login authentication google apple', href: '/lecturer/settings/security/sign-in-methods', icon: 'key-outline' },
  { id: 'notification-preferences', title: 'Notification Preferences', detail: 'Choose notification topics and delivery methods', keywords: 'notifications alerts push email', href: '/lecturer/settings/notifications', icon: 'options-outline' },
  { id: 'help', title: 'Help & Support', detail: 'FAQs, college support, and problem reporting', keywords: 'contact support faq problem', href: '/lecturer/settings/help', icon: 'help-circle-outline' },
  { id: 'about', title: 'About RollCall', detail: 'Product, version, privacy, terms, and face data', keywords: 'information privacy terms product', href: '/lecturer/settings/about', icon: 'information-circle-outline' },
  { id: 'activity', title: 'Activity', detail: 'Recent attendance and account activity', keywords: 'events updates recent', href: '/lecturer/activity', icon: 'pulse-outline' },
] as const;

function includesQuery(values: (string | number)[], query: string) { return values.join(' ').toLowerCase().includes(query); }

export default function GlobalSearch() {
  const { colors, setPreference } = useRollCallTheme(); const { session } = useAuth(); const { openQuickActions, requestLogout } = useLecturerUtilities();
  const token = session?.token ?? ''; const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(''); const [recent, setRecent] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const resource = useResource(() => loadLecturerSearchData(token), [token]); const data = resource.data;

  useEffect(() => { let active = true; void readLocalPreference(recentSearchKey).then((value) => { if (!active || !value) return; try { const stored = JSON.parse(value); if (Array.isArray(stored)) setRecent(stored.filter((item): item is string => typeof item === 'string').slice(0, 5)); } catch { /* Ignore invalid local history. */ } }); return () => { active = false; }; }, []);
  useEffect(() => { if (Platform.OS !== 'web') return; const focus = () => inputRef.current?.focus(); globalThis.window?.addEventListener('rollcall-focus-search', focus); return () => globalThis.window?.removeEventListener('rollcall-focus-search', focus); }, []);
  const remember = useCallback((value = query) => { const normalized = value.trim(); if (!normalized) return; setRecent((current) => { const next = [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 5); void writeLocalPreference(recentSearchKey, JSON.stringify(next)); return next; }); }, [query]);
  const open = useCallback((href: string) => { remember(); router.push(href as Href); }, [remember]);
  const chooseTheme = useCallback((preference: ThemePreference) => { remember(); setPreference(preference); router.push('/lecturer/settings/appearance' as Href); }, [remember, setPreference]);
  const actionDefinitions = useMemo(() => [
    { id: 'dark', title: 'Dark Mode', detail: 'Use RollCall’s near-black appearance', keywords: 'dark mode appearance theme', icon: 'moon-outline' as const, run: () => chooseTheme('dark') },
    { id: 'light', title: 'Light Mode', detail: 'Use RollCall’s light appearance', keywords: 'light mode appearance theme', icon: 'sunny-outline' as const, run: () => chooseTheme('light') },
    { id: 'system', title: 'System Theme', detail: 'Match this device automatically', keywords: 'system theme automatic appearance', icon: 'phone-portrait-outline' as const, run: () => chooseTheme('system') },
    { id: 'edit-profile', title: 'Edit Profile', detail: 'Change your display name, phone, or photo', keywords: 'profile edit account', icon: 'create-outline' as const, run: () => open('/lecturer/profile/edit') },
    { id: 'quick', title: 'Quick Actions', detail: 'Start attendance or open common Lecturer destinations', keywords: 'quick action attendance classes history', icon: 'add-circle-outline' as const, run: () => { remember(); openQuickActions(); } },
    { id: 'contact', title: 'Contact Support', detail: 'Open college and RollCall support information', keywords: 'help support college contact', icon: 'mail-outline' as const, run: () => open('/lecturer/settings/help/contact') },
    { id: 'logout', title: 'Sign Out', detail: 'Securely end this RollCall session', keywords: 'logout log out sign out account', icon: 'log-out-outline' as const, run: () => { remember(); requestLogout(); } },
  ], [chooseTheme, open, openQuickActions, remember, requestLogout]);

  const results = useMemo(() => {
    if (!data || !deferredQuery) return { classes: [], students: [], sessions: [], pages: [], actions: [] };
    return {
      classes: data.classes.filter((item) => includesQuery([item.subjectCode, item.subjectName, item.batchName, item.semester], deferredQuery)),
      students: data.students.filter((item) => includesQuery([item.name, item.rollNumber, item.subjectCode, item.batchName], deferredQuery)),
      sessions: data.sessions.filter((item) => { const date = new Date(item.scheduledAt); return includesQuery([item.subjectCode, item.subjectName, item.batchName, item.scheduledAt, date.toLocaleDateString(), date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })], deferredQuery); }),
      pages: pages.filter((item) => includesQuery([item.title, item.detail, item.keywords], deferredQuery)),
      actions: actionDefinitions.filter((item) => includesQuery([item.title, item.detail, item.keywords], deferredQuery)),
    };
  }, [actionDefinitions, data, deferredQuery]);
  const searching = query.trim().toLowerCase() !== deferredQuery; const resultCount = Object.values(results).reduce((count, items) => count + items.length, 0); const hasQuery = Boolean(deferredQuery);

  return <LecturerShell activeKey="search" title="Search" subtitle={Platform.OS === 'web' ? 'Ctrl/Cmd + K' : 'Your lecturer workspace'} back backFallback="/lecturer">
    <PageContainer width="full">
      <GlobalSearchField inputRef={inputRef} value={query} onChangeText={setQuery} onSubmitEditing={() => remember()} />
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
        {results.classes.length ? <SearchResultGroup title="Classes, subjects & batches">{results.classes.map((item) => <SearchResultRow key={item.id} icon="book-outline" title={item.subjectName} detail={`${item.subjectCode} · ${item.batchName} · ${item.semester}`} onPress={() => open(`/lecturer/classes/${item.id}`)} />)}</SearchResultGroup> : null}
        {results.students.length ? <SearchResultGroup title="Students">{results.students.map((item) => <SearchResultRow key={`${item.classId}-${item.id}`} icon="person-outline" title={item.name} detail={`${item.rollNumber} · ${item.subjectCode} · ${item.batchName}`} onPress={() => open(`/lecturer/classes/${item.classId}/students/${item.id}`)} />)}</SearchResultGroup> : null}
        {results.sessions.length ? <SearchResultGroup title="Attendance sessions & history">{results.sessions.map((item) => <SearchResultRow key={item.id} icon="checkmark-circle-outline" title={item.subjectName} detail={`${item.subjectCode} · ${new Date(item.scheduledAt).toLocaleDateString()} · ${item.present} of ${item.total} present`} onPress={() => open(`/lecturer/attendance/${item.id}`)} />)}</SearchResultGroup> : null}
        <Button label="Refresh results" variant="text" onPress={resource.retry} style={{ alignSelf: 'flex-start' }} />
      </View> : null}
    </PageContainer>
  </LecturerShell>;
}
