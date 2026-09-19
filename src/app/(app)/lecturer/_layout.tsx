import { Redirect, Stack, type Href } from 'expo-router';
import { useAuth } from '@/auth/auth-provider';
export default function LecturerLayout(){const {session}=useAuth(); if(session?.user.role!=='LECTURER')return <Redirect href={'/protected' as Href}/>; return <Stack screenOptions={{headerShown:false}}/>;}
