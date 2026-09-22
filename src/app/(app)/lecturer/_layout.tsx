import { Redirect, Stack, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
import { LecturerProfileProvider } from '@/lecturer/profile-provider';
import { LecturerNotificationProvider } from '@/lecturer/notification-provider';
import { LecturerUtilityProvider } from '@/lecturer/utility-provider';
export default function LecturerLayout(){const {session}=useAuth(); if(session?.user.role!=='LECTURER')return <Redirect href={'/protected' as Href}/>; return <LecturerProfileProvider><LecturerNotificationProvider><LecturerUtilityProvider><Stack screenOptions={{headerShown:false}}/></LecturerUtilityProvider></LecturerNotificationProvider></LecturerProfileProvider>;}
