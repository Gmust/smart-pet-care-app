import type { AxiosInstance } from "axios";
import axios from "axios";

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
const retriedRequests = new WeakSet<object>();

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

      const originalRequest = error.config;

      if (originalRequest && refreshAuthSession && !retriedRequests.has(originalRequest)) {
        retriedRequests.add(originalRequest);

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
