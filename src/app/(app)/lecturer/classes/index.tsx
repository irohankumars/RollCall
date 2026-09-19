import { useDeferredValue, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useAuth } from '@/auth/auth-provider';
import { StateView } from '@/design-system/components/states';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { ClassRow, LecturerShell, ResourceState } from '@/lecturer/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';
export default function Classes(){const {colors}=useRollCallTheme();const {session}=useAuth();const [query,setQuery]=useState('');const deferred=useDeferredValue(query);const token=session?.token??'';const resource=useResource(()=>lecturerClient.classes(token),[token]);const rows=resource.data?.filter(x=>`${x.subjectCode} ${x.subjectName} ${x.batchName}`.toLowerCase().includes(deferred.toLowerCase()))??[];return <LecturerShell activeKey="classes" title="My classes" subtitle="Assigned subjects only"><PageContainer width="standard"><TextInput accessibilityLabel="Search classes" placeholder="Search subject or class" placeholderTextColor={colors.textMuted} value={query} onChangeText={setQuery} style={[typography.body,{minHeight:sizing.inputHeight,borderRadius:radii.md,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,paddingHorizontal:spacing.lg,color:colors.textPrimary}]}/><ResourceState loading={resource.loading} error={resource.error} retry={resource.retry}/>{resource.data?(rows.length?<View style={{gap:spacing.sm}}>{rows.map(item=><ClassRow key={item.id} item={item}/>)}</View>:<StateView state="empty" title={query?'No matching classes':'No assigned classes'} message={query?'Try another search.':'Your assigned subjects will appear here.'}/>):null}</PageContainer></LecturerShell>}
