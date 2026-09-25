import { Buffer } from 'node:buffer';
import { AppError } from './errors.mjs';
import { createAuthService } from './auth-service.mjs';
import { createLoginRateLimiter } from './rate-limit.mjs';
import { validateLogin } from './validation.mjs';
import { createLecturerService } from './lecturer-service.mjs';
import { createOnboardingService } from './onboarding-service.mjs';
import { requireRoles } from './authorization.mjs';
import { Roles } from './roles.mjs';
import { createTimetableService } from './timetable-service.mjs';

function bearer(req) { const value = req.headers.authorization ?? ''; return value.startsWith('Bearer ') ? value.slice(7).trim() : ''; }
function json(res, status, body, origin) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer', 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, content-type, x-rollcall-payment-secret', 'access-control-allow-methods': 'GET, POST, OPTIONS', vary: 'Origin' }); res.end(JSON.stringify(body));
}
async function body(req) { const chunks = []; let size = 0; for await (const chunk of req) { size += chunk.length; if (size > 16_384) throw new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.'); chunks.push(chunk); } try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { throw new AppError(400, 'INVALID_JSON', 'Request body must be valid JSON.'); } }

export function createHttpApp({ db, config, emailTransport }) {
  const auth = createAuthService(db, config); const lecturer = createLecturerService(db); const timetable=createTimetableService(db); const onboarding=createOnboardingService(db,config,auth,emailTransport); const limiter = createLoginRateLimiter();
  return async function app(req, res) {
    const requestOrigin = req.headers.origin; const originAllowed = !requestOrigin || requestOrigin === config.corsOrigin; const origin = originAllowed && requestOrigin ? requestOrigin : config.corsOrigin;
    try {
      if (!originAllowed) throw new AppError(403, 'ORIGIN_NOT_ALLOWED', 'Request origin is not allowed.');
      if (req.method === 'OPTIONS') return json(res, 204, null, origin);
      if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { ok: true, data: { status: 'ok' } }, origin);
      if (req.method === 'POST' && req.url === '/api/auth/login') { const key = `${req.socket.remoteAddress ?? 'unknown'}:${Date.now() >> 16}`; limiter.check(key); const payload=await body(req); const input = validateLogin(payload); const session = await auth.login(input,payload.portal==='SUPER_ADMIN'?'SUPER_ADMIN':'STANDARD'); limiter.clear(key); return json(res, 200, { ok: true, data: session }, origin); }
      if (req.method === 'GET' && req.url === '/api/auth/me') { const session = auth.authenticate(bearer(req)); return json(res, 200, { ok: true, data: session }, origin); }
      if (req.method === 'POST' && req.url === '/api/auth/logout') { const token = bearer(req); auth.authenticate(token); auth.logout(token); return json(res, 200, { ok: true, data: { loggedOut: true } }, origin); }
      const url = new URL(req.url, 'http://localhost');
      if (req.method==='POST' && url.pathname==='/api/provisioning/payment-confirmed') return json(res,201,{ok:true,data:await onboarding.provision(await body(req),req.headers['x-rollcall-payment-secret'])},origin);
      let onboardingMatch=url.pathname.match(/^\/api\/onboarding\/invitations\/([^/]+)(?:\/(confirm-college|admin-details|otp\/send|otp\/verify|activate|resend))?$/);
      if(onboardingMatch){const token=decodeURIComponent(onboardingMatch[1]),action=onboardingMatch[2]; if(req.method==='GET'&&!action)return json(res,200,{ok:true,data:onboarding.get(token)},origin); if(req.method==='POST'&&action==='confirm-college')return json(res,200,{ok:true,data:onboarding.confirmCollege(token)},origin); if(req.method==='POST'&&action==='admin-details')return json(res,200,{ok:true,data:onboarding.details(token,await body(req))},origin); if(req.method==='POST'&&action==='otp/send')return json(res,200,{ok:true,data:await onboarding.sendOtp(token)},origin); if(req.method==='POST'&&action==='otp/verify')return json(res,200,{ok:true,data:onboarding.verifyOtp(token,await body(req))},origin); if(req.method==='POST'&&action==='activate')return json(res,201,{ok:true,data:await onboarding.activate(token,await body(req))},origin); if(req.method==='POST'&&action==='resend')return json(res,200,{ok:true,data:await onboarding.resend(token)},origin);}
      if(url.pathname==='/api/admin/workspace'||url.pathname==='/api/admin/setup'){const session=auth.authenticate(bearer(req)); if(req.method==='GET')return json(res,200,{ok:true,data:url.pathname.endsWith('/setup')?onboarding.setup(session):onboarding.workspace(session)},origin);}
      if(url.pathname.startsWith('/api/super-admin/')){const session=auth.authenticate(bearer(req));requireRoles(session,[Roles.SUPER_ADMIN]);if(req.method==='GET'&&url.pathname==='/api/super-admin/access')return json(res,200,{ok:true,data:{authorized:true,role:session.user.role}},origin);const workspaceMatch=url.pathname.match(/^\/api\/super-admin\/workspaces\/([^/]+)\/status$/);if(req.method==='POST'&&workspaceMatch){const input=await body(req);const state=String(input.state??'').toUpperCase();if(!['ACTIVE','SUSPENDED','CANCELLED'].includes(state))throw new AppError(400,'INVALID_WORKSPACE_STATE','Choose Active, Suspended, or Cancelled.');const workspace=db.prepare('SELECT id,college_id,state FROM workspaces WHERE id=?').get(decodeURIComponent(workspaceMatch[1]));if(!workspace)throw new AppError(404,'WORKSPACE_NOT_FOUND','Workspace not found.');const now=new Date().toISOString();db.transaction(()=>{db.prepare('UPDATE workspaces SET state=?,updated_at=? WHERE id=?').run(state==='SUSPENDED'||state==='CANCELLED'?'READY_FOR_ADMIN':'ACTIVE',now,workspace.id);db.prepare('UPDATE colleges SET status=?,updated_at=? WHERE id=?').run(state==='ACTIVE'?'ACTIVE':'DISABLED',now,workspace.college_id);})();return json(res,200,{ok:true,data:{id:workspace.id,state}},origin);}}
      if(url.pathname.startsWith('/api/timetable')){const session=auth.authenticate(bearer(req));const query=Object.fromEntries(url.searchParams.entries());if(req.method==='GET'&&['/api/timetable','/api/timetable/day','/api/timetable/week','/api/timetable/month','/api/timetable/history','/api/timetable/notifications'].includes(url.pathname))return json(res,200,{ok:true,data:timetable.view(session,query)},origin);if(req.method==='POST'&&url.pathname==='/api/timetable/entries')return json(res,201,{ok:true,data:timetable.saveEntry(session,await body(req))},origin);let match=url.pathname.match(/^\/api\/timetable\/entries\/([^/]+)(?:\/(deactivate))?$/);if(req.method==='POST'&&match)return json(res,200,{ok:true,data:match[2]?timetable.deactivateEntry(session,decodeURIComponent(match[1])):timetable.saveEntry(session,await body(req),decodeURIComponent(match[1]))},origin);if(req.method==='POST'&&url.pathname==='/api/timetable/overrides')return json(res,201,{ok:true,data:timetable.saveOverride(session,await body(req))},origin);match=url.pathname.match(/^\/api\/timetable\/overrides\/([^/]+)(?:\/(publish|revert|cancel))?$/);if(req.method==='POST'&&match){const id=decodeURIComponent(match[1]);return json(res,200,{ok:true,data:match[2]==='publish'?timetable.publishOverride(session,id):match[2]==='revert'?timetable.revertOverride(session,id):match[2]==='cancel'?timetable.cancelOverride(session,id):timetable.saveOverride(session,await body(req),id)},origin);}if(req.method==='POST'&&url.pathname==='/api/timetable/device-token')return json(res,200,{ok:true,data:timetable.registerDevice(session,await body(req))},origin);}
      if (url.pathname.startsWith('/api/lecturer/')) {
        const session = auth.authenticate(bearer(req));
        if (req.method === 'GET' && url.pathname === '/api/lecturer/overview') return json(res, 200, { ok: true, data: lecturer.overview(session) }, origin);
        if (req.method === 'GET' && url.pathname === '/api/lecturer/classes') return json(res, 200, { ok: true, data: lecturer.listClasses(session) }, origin);
        if (req.method === 'GET' && url.pathname === '/api/lecturer/attendance-history') return json(res, 200, { ok: true, data: lecturer.history(session) }, origin);
        let match = url.pathname.match(/^\/api\/lecturer\/classes\/([^/]+)$/);
        if (req.method === 'GET' && match) return json(res, 200, { ok: true, data: lecturer.classDetails(session, decodeURIComponent(match[1])) }, origin);
        match = url.pathname.match(/^\/api\/lecturer\/classes\/([^/]+)\/students$/);
        if (req.method === 'GET' && match) return json(res, 200, { ok: true, data: lecturer.roster(session, decodeURIComponent(match[1])) }, origin);
        match = url.pathname.match(/^\/api\/lecturer\/classes\/([^/]+)\/students\/([^/]+)$/);
        if (req.method === 'GET' && match) return json(res, 200, { ok: true, data: lecturer.student(session, decodeURIComponent(match[1]), decodeURIComponent(match[2])) }, origin);
        match = url.pathname.match(/^\/api\/lecturer\/classes\/([^/]+)\/attendance-sessions$/);
        if (req.method === 'POST' && match) return json(res, 201, { ok: true, data: lecturer.startSession(session, decodeURIComponent(match[1]), await body(req)) }, origin);
        match = url.pathname.match(/^\/api\/lecturer\/attendance-sessions\/([^/]+)$/);
        if (req.method === 'GET' && match) return json(res, 200, { ok: true, data: lecturer.session(session, decodeURIComponent(match[1])) }, origin);
        match = url.pathname.match(/^\/api\/lecturer\/attendance-sessions\/([^/]+)\/(submit|correct)$/);
        if (req.method === 'POST' && match) return json(res, 200, { ok: true, data: lecturer.submit(session, decodeURIComponent(match[1]), await body(req), { correction: match[2] === 'correct' }) }, origin);
      }
      return json(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } }, origin);
    } catch (error) {
      const known = error instanceof AppError; if (!known) console.error('Unhandled request error', error);
      return json(res, known ? error.status : 500, { ok: false, error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'The server could not complete the request.', ...(known && error.details ? { details: error.details } : {}) } }, origin);
    }
  };
}
