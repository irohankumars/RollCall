import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RollCallThemeProvider, useRollCallTheme } from '@/design-system/theme-provider';
import { GlobalOverlayProvider } from '@/shell/overlay-provider';
import { AuthProvider } from '@/auth/auth-provider';

function NavigationRoot() {
  const { scheme, colors } = useRollCallTheme(); const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return <ThemeProvider value={{ ...base, colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.textPrimary, border: colors.border } }}><StatusBar style={scheme === 'dark' ? 'light' : 'dark'} /><AuthProvider><GlobalOverlayProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="index" /><Stack.Screen name="(auth)" /><Stack.Screen name="(app)" /><Stack.Screen name="design-system-preview" /><Stack.Screen name="shell-preview" /><Stack.Screen name="modal-preview" options={{ presentation: 'modal' }} /></Stack></GlobalOverlayProvider></AuthProvider></ThemeProvider>;
}
export default function RootLayout() { return <SafeAreaProvider><RollCallThemeProvider><NavigationRoot /></RollCallThemeProvider></SafeAreaProvider>; }
