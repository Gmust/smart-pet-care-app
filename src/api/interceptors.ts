import type { AxiosInstance } from "axios";
import axios from "axios";

import { getApiError } from "@/errors/utils/getApiError";

// The generated client still uses the global axios export, while app-owned API
// objects use configured instances from src/api/axios.ts.

// In-memory copy of the access token. AuthProvider keeps this in sync with the
// persisted session so the request interceptor stays synchronous (no SecureStore
// read per request).
let currentAccessToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  currentAccessToken = token;
};

// AuthProvider registers its signOut here so a rejected/expired token can tear
// the session down without creating an import cycle (api → auth → api).
let onUnauthorized: (() => void) | null = null;
let refreshAuthSession: (() => Promise<string | null>) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  onUnauthorized = handler;
};

export const setRefreshAuthSessionHandler = (
  handler: (() => Promise<string | null>) | null
): void => {
  refreshAuthSession = handler;
};

const installedClients = new WeakSet<AxiosInstance>();

// Marks a request already replayed after a refresh. A flag on the config, not a
// WeakSet of configs: axios copies the config on `client.request`, so identity
// never matches on the replay, and a replay that 401s again refreshed forever.
// Reflect keeps it off the axios types; custom keys survive the copy.
const AUTH_RETRIED = "authRetried";

export const registerAuthInterceptors = (client: AxiosInstance = axios): void => {
  if (installedClients.has(client)) return;

  installedClients.add(client);

  client.interceptors.request.use((config) => {
    if (currentAccessToken) {
      config.headers.set("Authorization", `Bearer ${currentAccessToken}`);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const { code } = getApiError(error);

      // Wrong credentials at login are a form error, not a session problem.
      if (code === "auth_invalid_credentials" || code === "auth_google_failed") {
        return Promise.reject(error);
      }

      const originalRequest = error.config;

      // Refresh on exactly one alias. Every other 401 (refresh token spent,
      // account gone, token without a user id) ends the session: refreshing
      // would loop, and a 401 from the refresh call itself would wait on its
      // own in-flight refresh forever.
      if (
        code === "auth_authentication_required" &&
        originalRequest &&
        refreshAuthSession &&
        Reflect.get(originalRequest, AUTH_RETRIED) !== true
      ) {
        Reflect.set(originalRequest, AUTH_RETRIED, true);

        const nextAccessToken = await refreshAuthSession();
        if (nextAccessToken) {
          originalRequest.headers.set("Authorization", `Bearer ${nextAccessToken}`);
          return client.request(originalRequest);
        }
      }

      onUnauthorized?.();
      return Promise.reject(error);
    }
  );
};
