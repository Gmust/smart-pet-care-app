import * as SecureStore from "expo-secure-store";

// Sensitive auth material lives in the OS keychain/keystore via expo-secure-store,
// never in AsyncStorage. Keys are namespaced to the app.
const ACCESS_TOKEN_KEY = "spc.auth.accessToken";
const EXPIRES_AT_KEY = "spc.auth.expiresAtUtc";

export interface StoredSession {
  accessToken: string;
  expiresAtUtc: string | null;
}

export const getStoredSession = async (): Promise<StoredSession | null> => {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;

  const expiresAtUtc = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
  return { accessToken, expiresAtUtc };
};

export const setStoredSession = async (session: StoredSession): Promise<void> => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
  if (session.expiresAtUtc) {
    await SecureStore.setItemAsync(EXPIRES_AT_KEY, session.expiresAtUtc);
    return;
  }

  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
};

export const clearStoredSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
};
