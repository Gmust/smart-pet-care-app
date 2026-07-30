import * as SecureStore from "expo-secure-store";

import { SECURE_STORE_OPTIONS } from "@/common/utils/secureStoreOptions";

// Sensitive auth material lives in the OS keychain/keystore via expo-secure-store,
// never in AsyncStorage. Keys are namespaced to the app.
const ACCESS_TOKEN_KEY = "spc.auth.accessToken";
const REFRESH_TOKEN_KEY = "spc.auth.refreshToken";
const EXPIRES_AT_KEY = "spc.auth.expiresAtUtc";

export interface StoredSession {
  accessToken: string;
  refreshToken: string | null;
  expiresAtUtc: string | null;
}

export const getStoredSession = async (): Promise<StoredSession | null> => {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;

  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  const expiresAtUtc = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
  return { accessToken, refreshToken, expiresAtUtc };
};

export const setStoredSession = async (session: StoredSession): Promise<void> => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken, SECURE_STORE_OPTIONS);
  if (session.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken, SECURE_STORE_OPTIONS);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  if (session.expiresAtUtc) {
    await SecureStore.setItemAsync(EXPIRES_AT_KEY, session.expiresAtUtc, SECURE_STORE_OPTIONS);
    return;
  }

  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
};

export const clearStoredSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
};
