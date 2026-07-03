import * as SecureStore from "expo-secure-store";

// Shared SecureStore accessibility policy for all sensitive material stored in
// the OS keychain/keystore. AFTER_FIRST_UNLOCK keeps values encrypted at rest
// while allowing background access (e.g. notification-triggered fetches) after
// a device reboot. Defined once so the policy stays consistent across callers.
export const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};
