import { useEffect, useEffectEvent, useState } from 'react';
import { AuthApiError } from '@/auth/types';

export function useResource<T>(load:()=>Promise<T>, dependencies:readonly unknown[]) {
  const [state,setState]=useState<{data?:T;error?:AuthApiError;loading:boolean}>({loading:true});
  const [attempt,setAttempt]=useState(0);
  const runLoad=useEffectEvent(load);
  const dependencyKey=JSON.stringify(dependencies);
  useEffect(()=>{ let active=true; void runLoad().then(data=>{if(active)setState({data,loading:false});}).catch(reason=>{if(active)setState({loading:false,error:reason instanceof AuthApiError?reason:new AuthApiError('SERVER_ERROR','The information could not be loaded.')});}); return()=>{active=false;}; },[dependencyKey,attempt]);
  return {...state,retry:()=>{setState(current=>({...current,loading:true,error:undefined}));setAttempt(value=>value+1);}};
}
