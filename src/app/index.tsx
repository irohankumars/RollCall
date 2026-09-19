import { Redirect, type Href } from 'expo-router';
import { StateView } from '@/design-system/components/states';
import { useAuth } from '@/auth/auth-provider';

export default function Index() { const { status } = useAuth(); if (status === 'restoring') return <StateView state="loading" title="Restoring session" />; return <Redirect href={(status === 'authenticated' ? '/protected' : '/login') as Href} />; }
