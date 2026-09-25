export type UserRole = 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'HOD' | 'LECTURER' | 'STUDENT';
export type AuthenticatedUser = { id: string; name: string; loginIdentifier: string; role: UserRole; status: 'ACTIVE' | 'DISABLED'; college: { id: string; name: string; status: 'ACTIVE' | 'DISABLED' } | null; workspace: { id: string; name: string; state: 'PENDING' | 'PAYMENT_CONFIRMED' | 'PROVISIONING' | 'READY_FOR_ADMIN' | 'ACTIVE'; role: Exclude<UserRole, 'SUPER_ADMIN'> } | null };
export type AuthSession = { token: string; expiresAt: string; user: AuthenticatedUser };
export type AuthStatus = 'restoring' | 'unauthenticated' | 'authenticating' | 'authenticated' | 'session-expired';
export class AuthApiError extends Error { constructor(public code: string, message: string, public status?: number, public details?: Record<string, string>) { super(message); } }
