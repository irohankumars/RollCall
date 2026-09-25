import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { createDatabase } from '../src/database.mjs';
import { hashPassword } from '../src/password.mjs';
import { createAuthService } from '../src/auth-service.mjs';
import { authorize } from '../src/authorization.mjs';
import { createHttpApp } from '../src/http-app.mjs';
import { Roles } from '../src/roles.mjs';

const config = { sessionSecret: 'test-secret-with-more-than-thirty-two-characters', sessionTtlSeconds: 3600, corsOrigin: 'http://localhost:8081' };
async function fixture() {
  const db = createDatabase(':memory:'); const now = new Date().toISOString(); const collegeA = randomUUID(); const collegeB = randomUUID(); const password = 'CorrectHorseBatteryStaple!'; const passwordHash = await hashPassword(password);
  const college = db.prepare('INSERT INTO colleges (id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'); college.run(collegeA, 'College A', 'ACTIVE', now, now); college.run(collegeB, 'College B', 'ACTIVE', now, now);
  const user = db.prepare('INSERT INTO users (id, name, login_identifier, password_hash, role, college_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  user.run(randomUUID(), 'College A Admin', 'admin@a.test', passwordHash, Roles.COLLEGE_ADMIN, collegeA, 'ACTIVE', now, now); user.run(randomUUID(), 'Disabled User', 'disabled@a.test', passwordHash, Roles.STUDENT, collegeA, 'DISABLED', now, now); user.run(randomUUID(), 'Platform Owner', 'owner@test', passwordHash, Roles.SUPER_ADMIN, null, 'ACTIVE', now, now);
  return { db, collegeA, collegeB, password, passwordHash, auth: createAuthService(db, config) };
}

test('password hashes never contain plaintext', async () => { const data = await fixture(); assert.notEqual(data.passwordHash, data.password); assert.match(data.passwordHash, /^scrypt\$/); data.db.close(); });
test('valid login and restored session return the same user, role, and tenant', async () => { const data = await fixture(); const session = await data.auth.login({ loginIdentifier: 'admin@a.test', password: data.password }); const restored=data.auth.authenticate(session.token); assert.equal(session.user.role, Roles.COLLEGE_ADMIN); assert.equal(session.user.college.id, data.collegeA); assert.equal(restored.user.id,session.user.id); data.db.close(); });
test('invalid credentials and disabled users fail', async () => { const data = await fixture(); await assert.rejects(() => data.auth.login({ loginIdentifier: 'admin@a.test', password: 'wrong' }), { code: 'INVALID_CREDENTIALS' }); await assert.rejects(() => data.auth.login({ loginIdentifier: 'disabled@a.test', password: data.password }), { code: 'ACCOUNT_DISABLED' }); data.db.close(); });
test('invalid, expired, and logged-out sessions fail', async () => { const data = await fixture(); assert.throws(() => data.auth.authenticate('invalid'), { code: 'UNAUTHORIZED' }); const session = await data.auth.login({ loginIdentifier: 'admin@a.test', password: data.password }); data.db.prepare('UPDATE sessions SET expires_at = ?').run(new Date(0).toISOString()); assert.throws(() => data.auth.authenticate(session.token), { code: 'UNAUTHORIZED' }); const second = await data.auth.login({ loginIdentifier: 'admin@a.test', password: data.password }); data.auth.logout(second.token); assert.throws(() => data.auth.authenticate(second.token), { code: 'UNAUTHORIZED' }); data.db.close(); });
test('tenant isolation rejects College B and preserves SUPER_ADMIN exception', async () => { const data = await fixture(); const collegeSession = data.auth.authenticate((await data.auth.login({ loginIdentifier: 'admin@a.test', password: data.password })).token); assert.throws(() => authorize(collegeSession, { tenantId: data.collegeB }), { code: 'FORBIDDEN' }); assert.doesNotThrow(() => authorize(collegeSession, { tenantId: data.collegeA })); await assert.rejects(() => data.auth.login({ loginIdentifier: 'owner@test', password: data.password }), { code: 'USE_SUPER_ADMIN_PORTAL' }); const owner = data.auth.authenticate((await data.auth.login({ loginIdentifier: 'owner@test', password: data.password }, 'SUPER_ADMIN')).token); assert.doesNotThrow(() => authorize(owner, { tenantId: data.collegeB })); assert.equal(owner.user.college, null); data.db.close(); });
test('login, me, and logout APIs enforce authentication', async () => { const data = await fixture(); const server = http.createServer(createHttpApp({ db: data.db, config })); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve)); const port = server.address().port; const base = `http://127.0.0.1:${port}`;
  const anonymous = await fetch(`${base}/api/auth/me`); assert.equal(anonymous.status, 401);
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ loginIdentifier: 'admin@a.test', password: data.password }) }); assert.equal(login.status, 200); const token = (await login.json()).data.token;
  const me = await fetch(`${base}/api/auth/me`, { headers: { authorization: `Bearer ${token}` } }); assert.equal(me.status, 200); assert.equal((await me.json()).data.user.role, Roles.COLLEGE_ADMIN);
  const logout = await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { authorization: `Bearer ${token}` } }); assert.equal(logout.status, 200); assert.equal((await fetch(`${base}/api/auth/me`, { headers: { authorization: `Bearer ${token}` } })).status, 401);
  await new Promise((resolve) => server.close(resolve)); data.db.close();
});
test('Super Admin API requires a platform-owner session', async () => { const data=await fixture(); const server=http.createServer(createHttpApp({db:data.db,config})); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); const base=`http://127.0.0.1:${server.address().port}`; const admin=await data.auth.login({loginIdentifier:'admin@a.test',password:data.password}); const denied=await fetch(`${base}/api/super-admin/access`,{headers:{authorization:`Bearer ${admin.token}`}}); assert.equal(denied.status,403); const owner=await data.auth.login({loginIdentifier:'owner@test',password:data.password},'SUPER_ADMIN'); const allowed=await fetch(`${base}/api/super-admin/access`,{headers:{authorization:`Bearer ${owner.token}`}}); assert.equal(allowed.status,200); assert.equal((await allowed.json()).data.authorized,true); await new Promise(resolve=>server.close(resolve)); data.db.close(); });
