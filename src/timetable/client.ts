import { apiRequest } from '@/auth/auth-client';
import type { TimetableData,TimetableEntry,TimetableEntryInput,TimetableOverride,TimetableOverrideInput } from './types';
const auth=(token:string)=>({authorization:`Bearer ${token}`});
const query=(values:Record<string,string|undefined>)=>{const value=new URLSearchParams(Object.entries(values).filter((item):item is [string,string]=>Boolean(item[1]))).toString();return value?`?${value}`:'';};
export const timetableClient={
 fetch:(token:string,date?:string,sectionId?:string)=>apiRequest<TimetableData>(`/api/timetable${query({date,sectionId})}`,{headers:auth(token)}),
 day:(token:string,date:string,sectionId?:string)=>apiRequest<TimetableData>(`/api/timetable/day${query({date,sectionId})}`,{headers:auth(token)}),
 week:(token:string,start:string,sectionId?:string)=>apiRequest<TimetableData>(`/api/timetable/week${query({date:start,sectionId})}`,{headers:auth(token)}),
 month:(token:string,month:string,sectionId?:string)=>apiRequest<TimetableData>(`/api/timetable/month${query({date:`${month}-01`,sectionId})}`,{headers:auth(token)}),
 saveEntry:(token:string,input:TimetableEntryInput,id?:string)=>apiRequest<TimetableEntry>(`/api/timetable/entries${id?`/${encodeURIComponent(id)}`:''}`,{method:'POST',headers:auth(token),body:JSON.stringify(input)}),
 deactivateEntry:(token:string,id:string)=>apiRequest<{id:string;deactivated:true}>(`/api/timetable/entries/${encodeURIComponent(id)}/deactivate`,{method:'POST',headers:auth(token)}),
 saveOverride:(token:string,input:TimetableOverrideInput,id?:string)=>apiRequest<TimetableOverride>(`/api/timetable/overrides${id?`/${encodeURIComponent(id)}`:''}`,{method:'POST',headers:auth(token),body:JSON.stringify(input)}),
 publishOverride:(token:string,id:string)=>apiRequest<TimetableOverride>(`/api/timetable/overrides/${encodeURIComponent(id)}/publish`,{method:'POST',headers:auth(token)}),
 revertOverride:(token:string,id:string)=>apiRequest<TimetableOverride>(`/api/timetable/overrides/${encodeURIComponent(id)}/revert`,{method:'POST',headers:auth(token)}),
 cancelOverride:(token:string,id:string)=>apiRequest<TimetableOverride>(`/api/timetable/overrides/${encodeURIComponent(id)}/cancel`,{method:'POST',headers:auth(token)}),
 registerDevice:(token:string,deviceToken:string,platform:string)=>apiRequest<{registered:true}>('/api/timetable/device-token',{method:'POST',headers:auth(token),body:JSON.stringify({token:deviceToken,platform})}),
};
