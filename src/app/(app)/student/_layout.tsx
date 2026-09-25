import { Redirect, type Href } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useAuth } from '@/auth/auth-provider';
import { StudentUtilityProvider } from '@/student/utility-provider';
import { StudentNotificationProvider } from '@/student/notification-provider';
import { StudentFinalProvider } from '@/student/final-provider';
import { TimetableProvider } from '@/timetable/provider';

export default function StudentLayout() {
  const { session } = useAuth();
  if (session?.user.role !== 'STUDENT') return <Redirect href={'/protected' as Href} />;
  return <StudentNotificationProvider><StudentFinalProvider><TimetableProvider><StudentUtilityProvider><Stack screenOptions={{ headerShown: false }} /></StudentUtilityProvider></TimetableProvider></StudentFinalProvider></StudentNotificationProvider>;
}
