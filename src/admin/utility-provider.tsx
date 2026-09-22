import React, { createContext, useState } from 'react';

type AdminUtilityValue = { quickActionsOpen: boolean; accountMenuOpen: boolean; openQuickActions: () => void; closeQuickActions: () => void; openAccountMenu: () => void; closeAccountMenu: () => void };
const AdminUtilityContext = createContext<AdminUtilityValue | null>(null);
export function AdminUtilityProvider({ children }: React.PropsWithChildren) { const [quickActionsOpen, setQuickActionsOpen] = useState(false); const [accountMenuOpen, setAccountMenuOpen] = useState(false); return <AdminUtilityContext value={{ quickActionsOpen, accountMenuOpen, openQuickActions: () => setQuickActionsOpen(true), closeQuickActions: () => setQuickActionsOpen(false), openAccountMenu: () => setAccountMenuOpen(true), closeAccountMenu: () => setAccountMenuOpen(false) }}>{children}</AdminUtilityContext>; }
export function useAdminUtilities() { const value = React.use(AdminUtilityContext); if (!value) throw new Error('useAdminUtilities must be used within AdminUtilityProvider'); return value; }
