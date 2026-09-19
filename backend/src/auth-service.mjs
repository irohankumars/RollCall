import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { AppError, unauthorized } from './errors.mjs';
import { verifyPassword } from './password.mjs';

function tokenHash(token, secret) { return createHmac('sha256', secret).update(token).digest('base64url'); }
function publicUser(row) { return { id: row.user_id ?? row.id, name: row.name, loginIdentifier: row.login_identifier, role: row.role, status: row.status, college: row.college_id ? { id: row.college_id, name: row.college_name, status: row.college_status } : null }; }

export function createAuthService(db, config) {
  const findUser = db.prepare(`SELECT u.*, c.name AS college_name, c.status AS college_status FROM users u LEFT JOIN colleges c ON c.id = u.college_id WHERE u.login_identifier = ?`);
  const createSessionRow = db.prepare('INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)');
  const findSession = db.prepare(`SELECT s.*, u.name, u.login_identifier, u.role, u.status, u.college_id, c.name AS college_name, c.status AS college_status FROM sessions s JOIN users u ON u.id = s.user_id LEFT JOIN colleges c ON c.id = u.college_id WHERE s.token_hash = ? AND s.revoked_at IS NULL`);
  const revoke = db.prepare('UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL');

  return {
    async login(input) {
      const user = findUser.get(input.loginIdentifier); const valid = user ? await verifyPassword(input.password, user.password_hash) : false;
      if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'The login identifier or password is incorrect.');
      if (user.status !== 'ACTIVE' || (user.college_id && user.college_status !== 'ACTIVE')) throw new AppError(403, 'ACCOUNT_DISABLED', 'This account is disabled. Contact your administrator.');
      const token = randomBytes(32).toString('base64url'); const createdAt = new Date(); const expiresAt = new Date(createdAt.getTime() + config.sessionTtlSeconds * 1000);
      createSessionRow.run(randomUUID(), user.id, tokenHash(token, config.sessionSecret), expiresAt.toISOString(), createdAt.toISOString());
      return { token, expiresAt: expiresAt.toISOString(), user: publicUser(user) };
    },
    authenticate(token) {
      if (!token) throw unauthorized(); const session = findSession.get(tokenHash(token, config.sessionSecret));
      if (!session || Date.parse(session.expires_at) <= Date.now()) throw unauthorized('Your session has expired. Sign in again.');
      if (session.status !== 'ACTIVE' || (session.college_id && session.college_status !== 'ACTIVE')) throw new AppError(403, 'ACCOUNT_DISABLED', 'This account is disabled.');
      return { sessionId: session.id, expiresAt: session.expires_at, user: publicUser(session) };
    },
    logout(token) { if (token) revoke.run(new Date().toISOString(), tokenHash(token, config.sessionSecret)); },
  };
}
