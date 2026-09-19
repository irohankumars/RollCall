import { AppError } from './errors.mjs';
import { createAuthService } from './auth-service.mjs';
import { createLoginRateLimiter } from './rate-limit.mjs';
import { validateLogin } from './validation.mjs';
import { createLecturerService } from './lecturer-service.mjs';

function bearer(req) { const value = req.headers.authorization ?? ''; return value.startsWith('Bearer ') ? value.slice(7).trim() : ''; }
function json(res, status, body, origin) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer', 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, OPTIONS', vary: 'Origin' }); res.end(JSON.stringify(body));
}
async function body(req) { const chunks = []; let size = 0; for await (const chunk of req) { size += chunk.length; if (size > 16_384) throw new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.'); chunks.push(chunk); } try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { throw new AppError(400, 'INVALID_JSON', 'Request body must be valid JSON.'); } }

export function createHttpApp({ db, config }) {
  const auth = createAuthService(db, config); const lecturer = createLecturerService(db); const limiter = createLoginRateLimiter();
  return async function app(req, res) {
    const requestOrigin = req.headers.origin; const originAllowed = !requestOrigin || requestOrigin === config.corsOrigin; const origin = originAllowed && requestOrigin ? requestOrigin : config.corsOrigin;
    try {
      if (!originAllowed) throw new AppError(403, 'ORIGIN_NOT_ALLOWED', 'Request origin is not allowed.');
      if (req.method === 'OPTIONS') return json(res, 204, null, origin);
      if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { ok: true, data: { status: 'ok' } }, origin);
      if (req.method === 'POST' && req.url === '/api/auth/login') { const key = `${req.socket.remoteAddress ?? 'unknown'}:${Date.now() >> 16}`; limiter.check(key); const input = validateLogin(await body(req)); const session = await auth.login(input); limiter.clear(key); return json(res, 200, { ok: true, data: session }, origin); }
      if (req.method === 'GET' && req.url === '/api/auth/me') { const session = auth.authenticate(bearer(req)); return json(res, 200, { ok: true, data: session }, origin); }
      if (req.method === 'POST' && req.url === '/api/auth/logout') { const token = bearer(req); auth.authenticate(token); auth.logout(token); return json(res, 200, { ok: true, data: { loggedOut: true } }, origin); }
      const url = new URL(req.url, 'http://localhost');
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
