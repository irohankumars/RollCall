import * as SecureStore from 'expo-secure-store';
const KEY = 'rollcall.session-token';
export async function getStoredToken() { if (process.env.EXPO_OS === 'web') return typeof localStorage === 'undefined' ? null : localStorage.getItem(KEY); return SecureStore.getItemAsync(KEY); }
export async function storeToken(token: string) { if (process.env.EXPO_OS === 'web') { localStorage.setItem(KEY, token); return; } await SecureStore.setItemAsync(KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }); }
export async function clearStoredToken() { if (process.env.EXPO_OS === 'web') { localStorage.removeItem(KEY); return; } await SecureStore.deleteItemAsync(KEY); }
