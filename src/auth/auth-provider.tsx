import React, { createContext, useEffect, useState } from 'react';
import { authClient } from './auth-client';
import { clearStoredToken, getStoredToken, storeToken } from './token-storage';
import { AuthApiError, type AuthSession, type AuthStatus } from './types';

type AuthValue = { status: AuthStatus; session: AuthSession | null; error: AuthApiError | null; login: (identifier: string, password: string) => Promise<void>; acceptSession: (session: AuthSession) => Promise<void>; logout: () => Promise<void>; clearError: () => void };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('restoring'); const [session, setSession] = useState<AuthSession | null>(null); const [error, setError] = useState<AuthApiError | null>(null);
  useEffect(() => { let active = true; void (async () => { const token = await getStoredToken(); if (!token) { if (active) setStatus('unauthenticated'); return; } try { const restored = await authClient.restore(token); if (active) { setSession(restored); setStatus('authenticated'); } } catch (reason) { await clearStoredToken(); if (active) { const authError = reason instanceof AuthApiError ? reason : new AuthApiError('SESSION_ERROR', 'Your session could not be restored.'); setError(authError); setStatus(authError.code === 'UNAUTHORIZED' ? 'session-expired' : 'unauthenticated'); } } })(); return () => { active = false; }; }, []);
  const login = async (identifier: string, password: string) => { setStatus('authenticating'); setError(null); try { const next = await authClient.login(identifier, password); await storeToken(next.token); setSession(next); setStatus('authenticated'); } catch (reason) { const authError = reason instanceof AuthApiError ? reason : new AuthApiError('SERVER_ERROR', 'Authentication failed.'); setError(authError); setSession(null); setStatus('unauthenticated'); throw authError; } };
  const logout = async () => {
    const token = session?.token;

    try {
      if (token) await authClient.logout(token);
    } catch {
      // Local access must still be removed when the server is unreachable.
    } finally {
      await clearStoredToken();
      setSession(null);
      setError(null);
      setStatus('unauthenticated');
    }
  };
  const acceptSession = async (next: AuthSession) => { await storeToken(next.token); setSession(next); setError(null); setStatus('authenticated'); };
  return <AuthContext value={{ status, session, error, login, acceptSession, logout, clearError: () => setError(null) }}>{children}</AuthContext>;
}
export function useAuth() { const value = React.use(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value; }
