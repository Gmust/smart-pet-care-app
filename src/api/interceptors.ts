import axios from "axios";

// The generated client and every feature hook call the global axios instance
// (see src/api/config.ts), so attaching interceptors here covers all requests.

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

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  onUnauthorized = handler;
};

let installed = false;

export const registerAuthInterceptors = (): void => {
  if (installed) return;

  installed = true;

  axios.interceptors.request.use((config) => {
    if (currentAccessToken) {
      config.headers.set("Authorization", `Bearer ${currentAccessToken}`);
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // TODO(backender): once /api/Auth/refresh is mobile-friendly (refresh
        // token in the response/request body instead of an httpOnly cookie),
        // attempt a single silent refresh + retry here before signing out.
        // Tracking: refresh flow change requested from backend.
        onUnauthorized?.();
      }
      return Promise.reject(error);
    }
  );
};
