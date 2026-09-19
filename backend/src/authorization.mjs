import { forbidden } from './errors.mjs';
import { Roles } from './roles.mjs';

export function requireRoles(authenticated, allowedRoles) { if (!allowedRoles.includes(authenticated.user.role)) throw forbidden(); return authenticated; }
export function requireTenant(authenticated, tenantId) {
  if (authenticated.user.role === Roles.SUPER_ADMIN) return authenticated;
  if (!tenantId || authenticated.user.college?.id !== tenantId) throw forbidden('Cross-college access is not permitted.');
  return authenticated;
}
export function authorize(authenticated, { roles, tenantId } = {}) { if (roles) requireRoles(authenticated, roles); if (tenantId) requireTenant(authenticated, tenantId); return authenticated; }
