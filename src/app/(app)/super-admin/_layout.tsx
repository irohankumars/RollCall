import { useEffect, useState } from 'react';
import { Redirect, Stack, type Href } from 'expo-router';
import { authClient } from '@/auth/auth-client';
import { useAuth } from '@/auth/auth-provider';
import { StateView } from '@/design-system/components/states';
import { SuperAdminOverlays, SuperAdminUtilityProvider } from '@/super-admin/components';
import { SuperAdminProvider } from '@/super-admin/platform-provider';
import { SuperAdminOperationsProvider } from '@/super-admin/operations-provider';
export default function SuperAdminLayout(){const{session}=useAuth();const[verification,setVerification]=useState<{token:string;allowed:boolean}|null>(null);useEffect(()=>{let active=true;if(session?.user.role==='SUPER_ADMIN')void authClient.superAdminAccess(session.token).then(()=>{if(active)setVerification({token:session.token,allowed:true});}).catch(()=>{if(active)setVerification({token:session.token,allowed:false});});return()=>{active=false;};},[session]);if(session?.user.role!=='SUPER_ADMIN')return <Redirect href={'/protected' as Href}/>;if(verification?.token!==session.token)return <StateView state="loading" title="Verifying Super Admin access"/>;if(!verification.allowed)return <Redirect href={'/protected' as Href}/>;return <SuperAdminProvider><SuperAdminOperationsProvider><SuperAdminUtilityProvider><Stack screenOptions={{headerShown:false}}/><SuperAdminOverlays/></SuperAdminUtilityProvider></SuperAdminOperationsProvider></SuperAdminProvider>}
