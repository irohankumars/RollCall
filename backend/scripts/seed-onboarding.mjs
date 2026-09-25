import { loadConfig } from '../src/config.mjs';
import { createDatabase } from '../src/database.mjs';
import { createAuthService } from '../src/auth-service.mjs';
import { createOnboardingService } from '../src/onboarding-service.mjs';

const config=loadConfig();
if(config.nodeEnv==='production')throw new Error('The onboarding fixture is development-only.');
const db=createDatabase(config.databasePath); const auth=createAuthService(db,config); const service=createOnboardingService(db,config,auth);
try{const suffix=Date.now();const result=await service.provision({paymentEventId:`dev-payment-${suffix}`,applicationReference:`RC-APP-${suffix}`,collegeName:'Onboarding Test College',legalName:'Onboarding Test College Trust',adminEmail:`onboarding-admin-${suffix}@development.local`,adminName:'Onboarding Admin',planCode:'ROLLCALL_V1'},config.paymentWebhookSecret);console.log(JSON.stringify(result,null,2));}finally{db.close();}
