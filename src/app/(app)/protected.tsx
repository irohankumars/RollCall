import { Text, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Badge, Button } from '@/design-system/components/core';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { AppShell, CompactHeader, PageContainer } from '@/shell/app-shell';
const protectedNavigation = { primary: [{ key: 'protected', label: 'App', href: '/protected' }] } as const;
export default function ProtectedPlaceholder(){const{colors}=useRollCallTheme();const{session,logout}=useAuth();if(session?.user.role==='LECTURER')return <Redirect href={'/lecturer' as Href}/>;if(session?.user.role==='HOD')return <Redirect href={'/hod' as Href}/>;if(session?.user.role==='STUDENT')return <Redirect href={'/student' as Href}/>;if(session?.user.role==='COLLEGE_ADMIN')return <Redirect href={'/admin' as Href}/>;if(session?.user.role==='SUPER_ADMIN')return <Redirect href={'/super-admin' as Href}/>;return <AppShell navigation={protectedNavigation} activeKey="protected" header={<CompactHeader title="RollCall" subtitle="Protected application shell" trailing={<Badge label={session?.user.role??'Authenticated'} tone="success"/>}/>}><PageContainer width="detail"><View style={{gap:spacing.sm}}><Text accessibilityRole="header" style={[typography.heading,{color:colors.textPrimary}]}>Authentication active</Text><Text style={[typography.body,{color:colors.textSecondary}]}>Signed in as {session?.user.name}.</Text><Text selectable style={[typography.bodySmall,{color:colors.textMuted}]}>{session?.user.college?.name??'Platform-level account'}</Text></View><Button label="Sign out" variant="secondary" onPress={()=>void logout()}/></PageContainer></AppShell>}
