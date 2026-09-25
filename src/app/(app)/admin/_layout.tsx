import { Redirect, Stack, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { AdminProvider } from '@/admin/admin-provider';
import { AdminProfileProvider } from '@/admin/profile-provider';
import { AdminUtilityProvider } from '@/admin/utility-provider';
import { AdminOverlays } from '@/admin/components';
import { AdminOperationsProvider } from '@/admin/operations-provider';
import { TimetableProvider } from '@/timetable/provider';
export default function AdminLayout() { const { session } = useAuth(); if (session?.user.role !== 'COLLEGE_ADMIN') return <Redirect href={'/protected' as Href} />; return <AdminProfileProvider><AdminProvider><AdminOperationsProvider><TimetableProvider><AdminUtilityProvider><Stack screenOptions={{ headerShown: false }} /><AdminOverlays /></AdminUtilityProvider></TimetableProvider></AdminOperationsProvider></AdminProvider></AdminProfileProvider>; }
