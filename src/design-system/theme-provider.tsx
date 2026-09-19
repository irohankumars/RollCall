import React, { createContext, useMemo, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import { colorSchemes, type ThemeColors } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';
type ThemeValue = { colors: ThemeColors; scheme: 'light' | 'dark'; preference: ThemePreference; setPreference: (value: ThemePreference) => void; reduceMotion: boolean };
const ThemeContext = createContext<ThemeValue | null>(null);

export function RollCallThemeProvider({ children }: React.PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [reduceMotion, setReduceMotion] = useState(false);
  React.useEffect(() => { const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion); void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); return () => subscription.remove(); }, []);
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(() => ({ colors: colorSchemes[scheme], scheme, preference, setPreference, reduceMotion }), [scheme, preference, reduceMotion]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useRollCallTheme() {
  const value = React.use(ThemeContext);
  if (!value) throw new Error('useRollCallTheme must be used within RollCallThemeProvider');
  return value;
}
