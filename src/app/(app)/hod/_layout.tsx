import { Redirect, Stack, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { HodProfileProvider } from '@/hod/profile-provider';
import { HodNotificationProvider } from '@/hod/notification-provider';
import { HodUtilityProvider } from '@/hod/utility-provider';
import { HodManagementProvider } from '@/hod/management-provider';
import { HodOperationsProvider } from '@/hod/operations-provider';

export default function HodLayout() {
  const { session } = useAuth();
  if (session?.user.role !== 'HOD') return <Redirect href={'/protected' as Href} />;
  return <HodProfileProvider><HodNotificationProvider><HodManagementProvider><HodOperationsProvider><HodUtilityProvider><Stack screenOptions={{ headerShown: false }} /></HodUtilityProvider></HodOperationsProvider></HodManagementProvider></HodNotificationProvider></HodProfileProvider>;
}
