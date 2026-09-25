import { apiRequest } from '@/auth/auth-client';
export type WorkspaceSetup={workspace:{id:string;name:string;state:string;collegeId:string;subscription:{planCode:string;status:string}|null};items:{key:string;label:string;complete:boolean;count:number}[];completed:number;total:number};
export const adminClient={setup:(token:string)=>apiRequest<WorkspaceSetup>('/api/admin/setup',{headers:{authorization:`Bearer ${token}`}})};
