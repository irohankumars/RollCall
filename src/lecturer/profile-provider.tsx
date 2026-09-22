import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/auth/auth-provider';
import { readLocalPreference, writeLocalPreference } from '@/design-system/local-preferences';

export type LecturerProfileDraft = {
  displayName: string;
  phone: string;
};

type LecturerProfileValue = {
  profile: LecturerProfileDraft;
  loading: boolean;
  saveProfile: (profile: LecturerProfileDraft) => Promise<void>;
};

const LecturerProfileContext = createContext<LecturerProfileValue | null>(null);

function storageKey(userId: string) {
  return `rollcall.lecturer-profile.${userId}`;
}

function parseStoredProfile(value: string | null): Partial<LecturerProfileDraft> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Partial<LecturerProfileDraft>;
    return {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
    };
  } catch {
    return {};
  }
}

export function LecturerProfileProvider({ children }: React.PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id ?? 'anonymous';
  const defaultName = session?.user.name ?? 'Lecturer';
  const [stored, setStored] = useState<Partial<LecturerProfileDraft>>({});
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

  const profile = useMemo<LecturerProfileDraft>(() => ({
    displayName: stored.displayName?.trim() || defaultName,
    phone: stored.phone ?? '',
  }), [defaultName, stored.displayName, stored.phone]);

  const saveProfile = useCallback(async (next: LecturerProfileDraft) => {
    const normalized = { displayName: next.displayName.trim(), phone: next.phone.trim() };
    setStored(normalized);
    await writeLocalPreference(storageKey(userId), JSON.stringify(normalized));
  }, [userId]);

  return <LecturerProfileContext value={{ profile, loading, saveProfile }}>{children}</LecturerProfileContext>;
}

export function useLecturerProfile() {
  const value = React.use(LecturerProfileContext);
  if (!value) throw new Error('useLecturerProfile must be used within LecturerProfileProvider');
  return value;
}
