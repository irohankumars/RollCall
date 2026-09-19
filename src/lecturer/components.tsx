import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Badge, Button, ListItem } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { AppShell, CompactHeader } from '@/shell/app-shell';
import { useAuth } from '@/auth/auth-provider';
import type { AuthApiError } from '@/auth/types';
import type { LecturerClass } from './types';

export const lecturerNavigation = { primary:[{key:'today',label:'Today',href:'/lecturer'},{key:'classes',label:'Classes',href:'/lecturer/classes'},{key:'history',label:'History',href:'/lecturer/history'}] } as const;
export function LecturerShell({activeKey,title,subtitle,back,children,trailing}:{activeKey:string;title:string;subtitle?:string;back?:boolean;children:React.ReactNode;trailing?:React.ReactNode}) { const {colors}=useRollCallTheme(); const {session,logout}=useAuth(); return <AppShell navigation={lecturerNavigation} activeKey={activeKey} header={<CompactHeader title={title} subtitle={subtitle} backAction={back?()=>router.back():undefined} trailing={trailing??<Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={()=>void logout()}><Text style={{color:colors.primary}}>Sign out</Text></Pressable>} />}>{session?.user.role==='LECTURER'?children:<StateView state="unauthorized" />}</AppShell>; }
export function ResourceState({loading,error,retry}:{loading:boolean;error?:AuthApiError;retry:()=>void}) { if(loading)return <StateView state="loading" />; if(error)return <StateView state={error.code==='NETWORK_ERROR'?'offline':error.code==='UNAUTHORIZED'?'session-expired':error.status===403?'unauthorized':'error'} message={error.message} onRetry={retry}/>; return null; }
export function SectionHeading({title,action,onAction}:{title:string;action?:string;onAction?:()=>void}) { const {colors}=useRollCallTheme(); return <View style={{minHeight:36,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.md}}><Text accessibilityRole="header" style={[typography.heading,{color:colors.textPrimary}]}>{title}</Text>{action?<Button label={action} variant="text" onPress={onAction}/>:null}</View>; }
export function ClassRow({item}:{item:LecturerClass}) { const {colors}=useRollCallTheme(); const next=item.nextSessionAt?new Date(item.nextSessionAt).toLocaleString([], {weekday:'short',hour:'numeric',minute:'2-digit'}):item.schedule; return <ListItem title={`${item.subjectCode} · ${item.subjectName}`} detail={`${item.batchName} · ${item.semester}\n${next} · ${item.studentCount} students`} trailing={item.requiresAttendance?<Badge label="Attendance due" tone="warning"/>:<Text style={{fontSize:22,color:colors.primary}}>›</Text>} onPress={()=>router.push(`/lecturer/classes/${item.id}` as Href)}/>; }
