import { Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/design-system/components/core';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerShell } from '@/lecturer/components';
export default function FacePlaceholder(){const {colors}=useRollCallTheme();const {sessionId}=useLocalSearchParams<{sessionId:string}>();useAuth();return <LecturerShell activeKey="classes" title="Face attendance" back><PageContainer width="compact"><View style={{gap:spacing.md}}><Text accessibilityRole="header" style={[typography.title,{color:colors.textPrimary}]}>Camera attendance is not enabled yet</Text><Text style={[typography.body,{color:colors.textSecondary}]}>Face recognition and native camera capture belong to a later build. This draft session remains available.</Text></View><Button label="Use manual attendance" onPress={()=>router.replace(`/lecturer/attendance/${sessionId}` as Href)}/><Button label="Back to classes" variant="text" onPress={()=>router.replace('/lecturer/classes' as Href)}/></PageContainer></LecturerShell>}
