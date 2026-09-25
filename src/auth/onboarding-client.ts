import { apiRequest } from './auth-client';
import type { AuthSession } from './types';

export type Invitation = { invitationId:string; workspace:{id:string;name:string;state:string}; approvedCollege:{name:string;legalName:string;applicationReference:string}; email:string; adminName?:string; collegeConfirmed:boolean; otpVerified:boolean; expiresAt:string; status:string; pinSupported:false };
const path=(token:string,suffix='')=>`/api/onboarding/invitations/${encodeURIComponent(token)}${suffix}`;
export const onboardingClient={
  get:(token:string)=>apiRequest<Invitation>(path(token)),
  confirmCollege:(token:string)=>apiRequest<Invitation>(path(token,'/confirm-college'),{method:'POST',body:'{}'}),
  saveDetails:(token:string,name:string,phone:string)=>apiRequest<Invitation>(path(token,'/admin-details'),{method:'POST',body:JSON.stringify({name,phone})}),
  sendOtp:(token:string)=>apiRequest<{sent:true;maskedEmail:string;developmentOtp?:string}>(path(token,'/otp/send'),{method:'POST',body:'{}'}),
  verifyOtp:(token:string,code:string)=>apiRequest<{verified:true}>(path(token,'/otp/verify'),{method:'POST',body:JSON.stringify({code})}),
  activate:(token:string,password:string,confirmPassword:string)=>apiRequest<AuthSession>(path(token,'/activate'),{method:'POST',body:JSON.stringify({password,confirmPassword})}),
  resend:(token:string)=>apiRequest<{sent:true;developmentActivationUrl?:string}>(path(token,'/resend'),{method:'POST',body:'{}'}),
};
