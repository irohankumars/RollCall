import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { AttendancePercentage } from '@/design-system/components/attendance';
import { Badge, Statistic } from '@/design-system/components/core';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { LecturerShell, ResourceState, SectionHeading } from '@/lecturer/components';
import { lecturerClient } from '@/lecturer/lecturer-client';
import { useResource } from '@/lecturer/use-resource';
export default function Student(){const {colors}=useRollCallTheme();const {classId,studentId}=useLocalSearchParams<{classId:string;studentId:string}>();const {session}=useAuth();const token=session?.token??'';const resource=useResource(()=>lecturerClient.student(token,classId,studentId),[token,classId,studentId]);const item=resource.data;return <LecturerShell activeKey="classes" title={item?.name??'Student'} subtitle={item?.rollNumber} back><PageContainer width="detail"><ResourceState loading={resource.loading} error={resource.error} retry={resource.retry}/>{item?<><AttendancePercentage value={item.attendancePercentage} status={item.attendanceStatus}/><View style={{flexDirection:'row',gap:spacing.giant}}><Statistic value={String(item.presentCount)} label="Present"/><Statistic value={String(item.absentCount)} label="Absent"/></View><View style={{gap:spacing.sm}}><SectionHeading title="Recent attendance"/>{item.history.length?item.history.map(entry=><View key={entry.sessionId} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:spacing.md,borderBottomWidth:1,borderBottomColor:colors.borderSubtle}}><Text style={[typography.body,{color:colors.textPrimary}]}>{new Date(entry.date).toLocaleDateString()}</Text><Badge label={entry.status==='PRESENT'?'Present':'Absent'} tone={entry.status==='PRESENT'?'success':'error'}/></View>):<Text style={[typography.body,{color:colors.textMuted}]}>No completed attendance yet.</Text>}</View></>:null}</PageContainer></LecturerShell>}
