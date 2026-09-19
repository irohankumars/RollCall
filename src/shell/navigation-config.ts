import type { ReactNode } from 'react';

export type AppRole = 'student' | 'lecturer' | 'hod' | 'college-admin' | 'super-admin';
export type NavigationDestination = {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: number;
  disabled?: boolean;
  allowedRoles?: readonly AppRole[];
  requiredPermissions?: readonly string[];
};

export type NavigationConfiguration = {
  primary: readonly NavigationDestination[];
  secondary?: readonly NavigationDestination[];
};

export function resolveNavigation(configuration: NavigationConfiguration, role?: AppRole, permissions: readonly string[] = []) {
  const allowed = (destination: NavigationDestination) => {
    if (destination.allowedRoles && (!role || !destination.allowedRoles.includes(role))) return false;
    return !destination.requiredPermissions || destination.requiredPermissions.every((permission) => permissions.includes(permission));
  };
  return { primary: configuration.primary.filter(allowed), secondary: configuration.secondary?.filter(allowed) ?? [] };
}

export const shellPreviewNavigation: NavigationConfiguration = {
  primary: [
    { key: 'shell', label: 'Shell', href: '/shell-preview' },
    { key: 'routes', label: 'Routes', href: '/shell-preview?section=routes', badge: 2 },
    { key: 'overlays', label: 'Overlays', href: '/shell-preview?section=overlays' },
  ],
  secondary: [{ key: 'design-system', label: 'Build 1', href: '/' }],
};

export const routeArchitecture = {
  public: '(auth)',
  protected: '(app)',
  nested: '[section]',
  detail: '[id]',
  modal: 'modal',
  sheet: 'sheet',
} as const;
