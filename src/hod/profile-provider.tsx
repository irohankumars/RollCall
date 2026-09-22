import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/auth/auth-provider';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';

export type HodProfileDraft = {
  displayName: string;
  phone: string;
};

type HodProfileValue = {
  profile: HodProfileDraft;
  loading: boolean;
  saveProfile: (profile: HodProfileDraft) => Promise<void>;
};

const HodProfileContext = createContext<HodProfileValue | null>(null);

function storageKey(userId: string) {
  return `rollcall.hod-profile.${userId}`;
}

function parseStoredProfile(value: string | null): Partial<HodProfileDraft> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Partial<HodProfileDraft>;
    return {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
    };
  } catch {
    return {};
  }
}

export function HodProfileProvider({ children }: React.PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id ?? 'anonymous';
  const defaultName = session?.user.name ?? 'HOD';
  const [stored, setStored] = useState<Partial<HodProfileDraft>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void readLocalPreference(storageKey(userId)).then((value) => {
      if (!active) return;
      setStored(parseStoredProfile(value));
      setLoading(false);
    });
    return () => { active = false; };
  }, [userId]);

  const profile = useMemo<HodProfileDraft>(() => ({
    displayName: stored.displayName?.trim() || defaultName,
    phone: stored.phone ?? '',
  }), [defaultName, stored.displayName, stored.phone]);

  const saveProfile = useCallback(async (next: HodProfileDraft) => {
    const normalized = { displayName: next.displayName.trim(), phone: next.phone.trim() };
    setStored(normalized);
    await writeLocalPreference(storageKey(userId), JSON.stringify(normalized));
  }, [userId]);

  return <HodProfileContext value={{ profile, loading, saveProfile }}>{children}</HodProfileContext>;
}

export function useHodProfile() {
  const value = React.use(HodProfileContext);
  if (!value) throw new Error('useHodProfile must be used within HodProfileProvider');
  return value;
}

