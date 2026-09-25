import React, { createContext, useEffect, useState } from 'react';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';

export type HealthState='Operational'|'Degraded'|'Down';
export type HealthService={id:string;name:string;status:HealthState;lastChecked:string};
export type ErrorSeverity='Major'|'Minor';
export type ErrorStatus='New'|'Investigating'|'Monitoring'|'Resolved';
export type PlatformError={id:string;severity:ErrorSeverity;title:string;service:string;firstOccurred:string;lastOccurred:string;occurrences:number;status:ErrorStatus;college?:string;workspace?:string;diagnostic:string;resolutionNotes:string};
export type SupportPriority='Low'|'Normal'|'High'|'Critical';
export type SupportStatus='Open'|'In Progress'|'Resolved';
export type SupportIssue={id:string;college:string;subject:string;priority:SupportPriority;status:SupportStatus;createdAt:string;contact:string;details:string;workspace:string;related?:string;internalNotes:string;assignee?:string};
export type PlatformUser={id:string;name:string;email:string;role:'College Admin'|'HOD'|'Lecturer'|'Student';college:string;status:'Active'|'Disabled'|'Invited';lastActivity:string};
export type QuickItem={key:string;type:'College'|'Application'|'Payment'|'Support'|'Error';title:string;detail:string;href:string};
export type SavedFilter={id:string;scope:'applications'|'payments'|'errors'|'support'|'users';name:string;value:string};

const checked='2026-09-24T10:42:00.000Z';
const healthSeed:HealthService[]=['API','Database','Authentication','Email','Notifications','Payments','Storage'].map((name,index)=>({id:name.toLowerCase(),name,status:index===3?'Degraded':'Operational',lastChecked:checked}));
const errorSeed:PlatformError[]=[
 {id:'ERR-1042',severity:'Major',title:'Payment webhook delivery delayed',service:'Payments',firstOccurred:'2026-09-24T07:10:00.000Z',lastOccurred:'2026-09-24T09:18:00.000Z',occurrences:14,status:'Investigating',college:'Lakeside College of Engineering',workspace:'RC-LCE-188',diagnostic:'Payment confirmations are arriving after the normal processing window. No credentials or payment data are exposed.',resolutionNotes:'Provider delivery status is being monitored.'},
 {id:'ERR-1038',severity:'Minor',title:'Email delivery failed for one invitation',service:'Email',firstOccurred:'2026-09-23T14:22:00.000Z',lastOccurred:'2026-09-23T14:22:00.000Z',occurrences:1,status:'New',college:'ABC Engineering College',diagnostic:'The receiving domain rejected one invitation email.',resolutionNotes:''},
 {id:'ERR-1021',severity:'Minor',title:'Student import row rejected',service:'Imports',firstOccurred:'2026-09-22T11:00:00.000Z',lastOccurred:'2026-09-22T11:04:00.000Z',occurrences:3,status:'Monitoring',college:'Development College',workspace:'RC-DEV-001',diagnostic:'Three rows contained duplicate institutional identifiers.',resolutionNotes:'College Admin received row-level guidance.'},
];
const supportSeed:SupportIssue[]=[
 {id:'SUP-2041',college:'Lakeside College of Engineering',subject:'Payment marked failed after bank confirmation',priority:'Critical',status:'Open',createdAt:'2026-09-24T08:30:00.000Z',contact:'Priya Rao · admin@lakeside.edu',details:'The college reports a successful debit, while the workspace still shows a payment issue.',workspace:'RC-LCE-188',related:'PAY-2026-3102 · ERR-1042',internalNotes:'Compare provider settlement before changing subscription state.'},
 {id:'SUP-2037',college:'ABC Engineering College',subject:'Clarification needed for requested changes',priority:'Normal',status:'In Progress',createdAt:'2026-09-23T12:10:00.000Z',contact:'Dr. Meera Iyer · meera.iyer@abc.edu',details:'The applicant asked which affiliation document needs to be replaced.',workspace:'Application APP-ABC',internalNotes:'Assigned to platform operations.',assignee:'Platform Operations'},
 {id:'SUP-2029',college:'Development College',subject:'Admin invitation received',priority:'Low',status:'Resolved',createdAt:'2026-09-22T09:00:00.000Z',contact:'Development College Admin',details:'Confirmation that the administrator invitation was delivered.',workspace:'RC-DEV-001',internalNotes:'No further action required.',assignee:'Platform Operations'},
];
const usersSeed:PlatformUser[]=[
 {id:'usr-admin-dev',name:'Development College Admin',email:'admin@development.local',role:'College Admin',college:'Development College',status:'Active',lastActivity:'2026-09-24T10:35:00.000Z'},
 {id:'usr-hod-dev',name:'Dr. Vikram Shah',email:'hod@development.local',role:'HOD',college:'Development College',status:'Active',lastActivity:'2026-09-24T09:55:00.000Z'},
 {id:'usr-lec-dev',name:'Dr. Ananya Rao',email:'lecturer@development.local',role:'Lecturer',college:'Development College',status:'Active',lastActivity:'2026-09-24T10:10:00.000Z'},
 {id:'usr-student-dev',name:'Aarav Mehta',email:'student1@development.local',role:'Student',college:'Development College',status:'Active',lastActivity:'2026-09-24T08:42:00.000Z'},
 {id:'usr-admin-north',name:'S. Krishnan',email:'admin@northstar.edu',role:'College Admin',college:'Northstar Institute of Technology',status:'Invited',lastActivity:'2026-09-23T12:00:00.000Z'},
];
const readArray=<T,>(value:string|null):T[]=>{try{const parsed=JSON.parse(value??'[]');return Array.isArray(parsed)?parsed:[];}catch{return[];}};
type Value={health:HealthService[];errors:PlatformError[];support:SupportIssue[];users:PlatformUser[];recent:QuickItem[];pinned:QuickItem[];savedFilters:SavedFilter[];lastUpdated:string;refreshHealth:()=>void;updateError:(id:string,status:ErrorStatus,note?:string)=>void;updateSupport:(id:string,status:SupportStatus,assignee?:string)=>void;recordView:(item:QuickItem)=>void;removeRecent:(key:string)=>void;togglePin:(item:QuickItem)=>void;saveFilter:(scope:SavedFilter['scope'],name:string,value:string)=>void;renameFilter:(id:string,name:string)=>void;removeFilter:(id:string)=>void};
const Context=createContext<Value|null>(null);
export function SuperAdminOperationsProvider({children}:React.PropsWithChildren){
 const[health,setHealth]=useState(healthSeed);const[errors,setErrors]=useState(errorSeed);const[support,setSupport]=useState(supportSeed);const[users]=useState(usersSeed);const[recent,setRecent]=useState<QuickItem[]>([]);const[pinned,setPinned]=useState<QuickItem[]>([]);const[savedFilters,setSavedFilters]=useState<SavedFilter[]>([]);const[lastUpdated,setLastUpdated]=useState(checked);
 useEffect(()=>{void Promise.all([readLocalPreference('rollcall.super.recent'),readLocalPreference('rollcall.super.pinned'),readLocalPreference('rollcall.super.filters')]).then(([r,p,f])=>{setRecent(readArray<QuickItem>(r));setPinned(readArray<QuickItem>(p));setSavedFilters(readArray<SavedFilter>(f));});},[]);
 const stamp=()=>setLastUpdated(new Date().toISOString());
 const refreshHealth=()=>{const now=new Date().toISOString();setHealth(current=>current.map(item=>({...item,lastChecked:now})));setLastUpdated(now);};
 const updateError=(id:string,status:ErrorStatus,note?:string)=>{setErrors(current=>current.map(item=>item.id===id?{...item,status,resolutionNotes:note??item.resolutionNotes,lastOccurred:new Date().toISOString()}:item));stamp();};
 const updateSupport=(id:string,status:SupportStatus,assignee?:string)=>{setSupport(current=>current.map(item=>item.id===id?{...item,status,assignee:assignee??item.assignee}:item));stamp();};
 const recordView=(item:QuickItem)=>setRecent(current=>{const next=[item,...current.filter(value=>value.key!==item.key)].slice(0,8);void writeLocalPreference('rollcall.super.recent',JSON.stringify(next));return next;});
 const removeRecent=(key:string)=>setRecent(current=>{const next=current.filter(item=>item.key!==key);void writeLocalPreference('rollcall.super.recent',JSON.stringify(next));return next;});
 const togglePin=(item:QuickItem)=>setPinned(current=>{const next=current.some(value=>value.key===item.key)?current.filter(value=>value.key!==item.key):[item,...current].slice(0,8);void writeLocalPreference('rollcall.super.pinned',JSON.stringify(next));return next;});
 const persistFilters=(next:SavedFilter[])=>{setSavedFilters(next);void writeLocalPreference('rollcall.super.filters',JSON.stringify(next));};
 const saveFilter=(scope:SavedFilter['scope'],name:string,value:string)=>persistFilters([...savedFilters,{id:`filter-${Date.now()}`,scope,name,value}]);
 const renameFilter=(id:string,name:string)=>persistFilters(savedFilters.map(item=>item.id===id?{...item,name}:item));
 const removeFilter=(id:string)=>persistFilters(savedFilters.filter(item=>item.id!==id));
 return <Context value={{health,errors,support,users,recent,pinned,savedFilters,lastUpdated,refreshHealth,updateError,updateSupport,recordView,removeRecent,togglePin,saveFilter,renameFilter,removeFilter}}>{children}</Context>;
}
export function useSuperAdminOperations(){const value=React.use(Context);if(!value)throw new Error('useSuperAdminOperations must be used within SuperAdminOperationsProvider');return value;}
