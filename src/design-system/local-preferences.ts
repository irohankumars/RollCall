import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function readLocalPreference(key: string) {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function writeLocalPreference(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // The preference remains active for the current session when storage is unavailable.
    }
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // The preference remains active for the current session when storage is unavailable.
  }
}
