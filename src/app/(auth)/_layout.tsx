import { Redirect, Stack, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
export default function AuthLayout() { const { status } = useAuth(); if (status === 'authenticated') return <Redirect href={'/protected' as Href} />; return <Stack screenOptions={{ headerShown: false }} />; }
