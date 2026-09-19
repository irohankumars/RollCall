import React from 'react';
import { Redirect } from 'expo-router';

export type RouteAccess = { authenticated: boolean; authorized: boolean };
export function ProtectedRoute({ access, children, signInHref = '/' }: React.PropsWithChildren<{ access: RouteAccess; signInHref?: string }>) {
  if (!access.authenticated || !access.authorized) return <Redirect href={signInHref as never} />;
  return children;
}
