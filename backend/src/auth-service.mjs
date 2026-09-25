import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { AppError, unauthorized } from './errors.mjs';
import { verifyPassword } from './password.mjs';

function tokenHash(token, secret) { return createHmac('sha256', secret).update(token).digest('base64url'); }
function publicUser(row) { return { id: row.user_id ?? row.id, name: row.name, loginIdentifier: row.login_identifier, role: row.role, status: row.status, college: row.college_id ? { id: row.college_id, name: row.college_name, status: row.college_status } : null, workspace: row.workspace_id ? { id: row.workspace_id, name: row.workspace_name, state: row.workspace_state, role: row.membership_role } : null }; }

export function createAuthService(db, config) {
  const userColumns = `u.*, c.name AS college_name, c.status AS college_status, w.id AS workspace_id, w.name AS workspace_name, w.state AS workspace_state, wm.role AS membership_role`;
  const userJoins = `LEFT JOIN colleges c ON c.id=u.college_id LEFT JOIN workspace_memberships wm ON wm.user_id=u.id AND wm.status='ACTIVE' AND wm.role=u.role LEFT JOIN workspaces w ON w.id=wm.workspace_id`;
  const findUser = db.prepare(`SELECT ${userColumns} FROM users u ${userJoins} WHERE u.login_identifier = ?`);
  const findUserById = db.prepare(`SELECT ${userColumns} FROM users u ${userJoins} WHERE u.id = ?`);
  const createSessionRow = db.prepare('INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)');
  const findSession = db.prepare(`SELECT s.*, u.name, u.login_identifier, u.role, u.status, u.college_id, c.name AS college_name, c.status AS college_status, w.id AS workspace_id, w.name AS workspace_name, w.state AS workspace_state, wm.role AS membership_role FROM sessions s JOIN users u ON u.id=s.user_id LEFT JOIN colleges c ON c.id=u.college_id LEFT JOIN workspace_memberships wm ON wm.user_id=u.id AND wm.status='ACTIVE' AND wm.role=u.role LEFT JOIN workspaces w ON w.id=wm.workspace_id WHERE s.token_hash=? AND s.revoked_at IS NULL`);
  const revoke = db.prepare('UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL');
  const ensureLegacyMembership = db.transaction((identifier) => { const legacy=db.prepare("SELECT u.id user_id,u.role,u.status,u.college_id,c.name,c.status college_status,c.created_at,c.updated_at FROM users u JOIN colleges c ON c.id=u.college_id LEFT JOIN workspace_memberships wm ON wm.user_id=u.id AND wm.role=u.role WHERE u.login_identifier=? AND wm.id IS NULL AND u.role<>'SUPER_ADMIN'").get(identifier); if(!legacy)return; db.prepare("INSERT OR IGNORE INTO workspaces (id,college_id,application_id,name,state,created_at,updated_at) VALUES (?,?,NULL,?,? ,?,?)").run(`workspace-${legacy.college_id}`,legacy.college_id,legacy.name,legacy.college_status==='ACTIVE'?'ACTIVE':'READY_FOR_ADMIN',legacy.created_at,legacy.updated_at); const now=new Date().toISOString(); db.prepare("INSERT OR IGNORE INTO workspace_memberships (id,workspace_id,user_id,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").run(`membership-${legacy.user_id}`,`workspace-${legacy.college_id}`,legacy.user_id,legacy.role,legacy.status,now,now); });

  const createSessionForRow = (user) => { const token=randomBytes(32).toString('base64url'); const createdAt=new Date(); const expiresAt=new Date(createdAt.getTime()+config.sessionTtlSeconds*1000); createSessionRow.run(randomUUID(),user.id??user.user_id,tokenHash(token,config.sessionSecret),expiresAt.toISOString(),createdAt.toISOString()); return {token,expiresAt:expiresAt.toISOString(),user:publicUser(user)}; };
  return {
    async login(input, portal = 'STANDARD') {
      ensureLegacyMembership(input.loginIdentifier); const user = findUser.get(input.loginIdentifier); const valid = user ? await verifyPassword(input.password, user.password_hash) : false;
      if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'The login identifier or password is incorrect.');
      if (portal === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') throw new AppError(403, 'SUPER_ADMIN_REQUIRED', 'This account cannot access the Super Admin console.');
      if (portal !== 'SUPER_ADMIN' && user.role === 'SUPER_ADMIN') throw new AppError(403, 'USE_SUPER_ADMIN_PORTAL', 'Use the dedicated Super Admin sign-in page.');
      if (user.status !== 'ACTIVE' || (user.college_id && user.college_status !== 'ACTIVE')) throw new AppError(403, 'ACCOUNT_DISABLED', 'This account is disabled. Contact your administrator.');
      if (user.role !== 'SUPER_ADMIN' && (!user.workspace_id || user.workspace_state !== 'ACTIVE')) throw new AppError(403, 'WORKSPACE_NOT_ACTIVE', 'This workspace is not active.');
      return createSessionForRow(user);
    },
    authenticate(token) {
      if (!token) throw unauthorized(); const session = findSession.get(tokenHash(token, config.sessionSecret));
      if (!session || Date.parse(session.expires_at) <= Date.now()) throw unauthorized('Your session has expired. Sign in again.');
      if (session.status !== 'ACTIVE' || (session.college_id && session.college_status !== 'ACTIVE')) throw new AppError(403, 'ACCOUNT_DISABLED', 'This account is disabled.');
      return { sessionId: session.id, expiresAt: session.expires_at, user: publicUser(session) };
    },
    createSessionForUser(userId) { const user=findUserById.get(userId); if(!user) throw unauthorized(); return createSessionForRow(user); },
    logout(token) { if (token) revoke.run(new Date().toISOString(), tokenHash(token, config.sessionSecret)); },
  };
}
