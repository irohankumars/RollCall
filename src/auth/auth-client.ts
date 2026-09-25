import { AuthApiError, type AuthSession, type AuthenticatedUser } from './types';
const API_URL = (process.env.EXPO_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === 'production' ? 'https://rollcall-p7ci.onrender.com' : 'http://127.0.0.1:4000'))
  .replace(/\/+$/, '');

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  let response: Response;
  try { response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'content-type': 'application/json', ...init.headers } }); }
  catch { throw new AuthApiError('NETWORK_ERROR', 'RollCall could not reach the server. Check your connection and try again.'); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new AuthApiError(payload?.error?.code ?? 'SERVER_ERROR', payload?.error?.message ?? 'The server could not complete the request.', response.status, payload?.error?.details);
  return payload.data as T;
}
export const authClient = {
  login(loginIdentifier: string, password: string) { return apiRequest<AuthSession>('/api/auth/login', { method: 'POST', body: JSON.stringify({ loginIdentifier, password }) }); },
  superAdminLogin(loginIdentifier: string, password: string) { return apiRequest<AuthSession>('/api/auth/login', { method: 'POST', body: JSON.stringify({ loginIdentifier, password, portal: 'SUPER_ADMIN' }) }); },
  superAdminAccess(token: string) { return apiRequest<{ authorized: true; role: 'SUPER_ADMIN' }>('/api/super-admin/access', { headers: { authorization: `Bearer ${token}` } }); },
  async restore(token: string) { const data = await apiRequest<{ expiresAt: string; user: AuthenticatedUser }>('/api/auth/me', { headers: { authorization: `Bearer ${token}` } }); return { ...data, token }; },
  logout(token: string) { return apiRequest<{ loggedOut: true }>('/api/auth/logout', { method: 'POST', headers: { authorization: `Bearer ${token}` } }); },
};
