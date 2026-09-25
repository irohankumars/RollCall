import { Redirect, Stack, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { LecturerProfileProvider } from '@/lecturer/profile-provider';
import { LecturerNotificationProvider } from '@/lecturer/notification-provider';
import { LecturerUtilityProvider } from '@/lecturer/utility-provider';
import { TimetableProvider } from '@/timetable/provider';
export default function LecturerLayout(){const {session}=useAuth(); if(session?.user.role!=='LECTURER')return <Redirect href={'/protected' as Href}/>; return <LecturerProfileProvider><LecturerNotificationProvider><TimetableProvider><LecturerUtilityProvider><Stack screenOptions={{headerShown:false}}/></LecturerUtilityProvider></TimetableProvider></LecturerNotificationProvider></LecturerProfileProvider>;}
