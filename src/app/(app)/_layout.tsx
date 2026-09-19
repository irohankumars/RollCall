import { Stack } from 'expo-router/stack';
import { useAuth } from '@/auth/auth-provider';
import { StateView } from '@/design-system/components/states';
import { ProtectedRoute } from '@/shell/route-gate';

export default function ProtectedLayout() { const { status } = useAuth(); if (status === 'restoring') return <StateView state="loading" title="Restoring session" />; return <ProtectedRoute access={{ authenticated: status === 'authenticated', authorized: status === 'authenticated' }} signInHref="/login"><Stack screenOptions={{ headerShown: false }} /></ProtectedRoute>; }
