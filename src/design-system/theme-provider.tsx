import React, { createContext, useCallback, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, useColorScheme } from 'react-native';
import { colorSchemes, type ThemeColors } from './tokens';
import { readLocalPreference, writeLocalPreference } from './local-preferences';

export type ThemePreference = 'system' | 'light' | 'dark';
type ThemeValue = { colors: ThemeColors; scheme: 'light' | 'dark'; preference: ThemePreference; setPreference: (value: ThemePreference) => void; reduceMotion: boolean };
const ThemeContext = createContext<ThemeValue | null>(null);
const themePreferenceKey = 'rollcall.theme-preference';
const isThemePreference = (value: string | null): value is ThemePreference => value === 'system' || value === 'light' || value === 'dark';

export function RollCallThemeProvider({ children }: React.PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [reduceMotion, setReduceMotion] = useState(false);
  React.useEffect(() => { let active = true; void readLocalPreference(themePreferenceKey).then((stored) => { if (active && isThemePreference(stored)) setPreference(stored); }); return () => { active = false; }; }, []);
  React.useEffect(() => { const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion); void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); return () => subscription.remove(); }, []);
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--rollcall-input-background', colorSchemes[scheme].surface);
    rootStyle.setProperty('--rollcall-input-text', colorSchemes[scheme].textPrimary);
    return () => {
      rootStyle.removeProperty('--rollcall-input-background');
      rootStyle.removeProperty('--rollcall-input-text');
    };
  }, [scheme]);
  const updatePreference = useCallback((next: ThemePreference) => { setPreference(next); void writeLocalPreference(themePreferenceKey, next); }, []);
  const value = useMemo(() => ({ colors: colorSchemes[scheme], scheme, preference, setPreference: updatePreference, reduceMotion }), [scheme, preference, updatePreference, reduceMotion]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useRollCallTheme() {
  const value = React.use(ThemeContext);
  if (!value) throw new Error('useRollCallTheme must be used within RollCallThemeProvider');
  return value;
}
