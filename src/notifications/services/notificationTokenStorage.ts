import * as SecureStore from "expo-secure-store";

const DEVICE_TOKEN_KEY = "spc.notifications.androidDeviceToken";

export const getStoredDeviceToken = (): Promise<string | null> => {
  return SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
};

export const setStoredDeviceToken = (token: string): Promise<void> => {
  return SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
};

export const clearStoredDeviceToken = (): Promise<void> => {
  return SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
};
