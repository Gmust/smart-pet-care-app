# API Layer

## Overview

All HTTP requests go through the global `axios` instance. `src/api/config.ts` is imported once at app startup (via the root layout) and configures the base URL and auth interceptors before any request is made.

## Environment Variables

| Variable              | Required | Description                                                                          |
| --------------------- | -------- | ------------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_API_URL` | Yes      | Backend base URL. Inlined at build time by Expo. Set in `.env` (see `.env.example`). |

If `EXPO_PUBLIC_API_URL` is not set, a warning is logged and all requests will use relative URLs (which will fail in native environments).

## Base URL

```ts
// src/api/config.ts
axios.defaults.baseURL = process.env.EXPO_PUBLIC_API_URL;
```

The generated client (`src/api/generated/`) calls axios with relative paths (e.g. `/api/reminders`), so setting `axios.defaults.baseURL` here applies to every request without any per-call configuration.

## Auth Interceptors

`src/api/interceptors.ts` attaches two interceptors to the global axios instance exactly once (guarded by an `installed` flag):

**Request interceptor** — reads the in-memory `currentAccessToken` and sets `Authorization: Bearer <token>` on every outgoing request. The token is kept in memory (not read from SecureStore per-request) so the interceptor stays synchronous.

**Response interceptor** — on a `401` response, calls `onUnauthorized()` which triggers `AuthProvider.signOut`, clearing the session and redirecting to the auth flow.

### Wiring auth state into interceptors

`AuthProvider` calls two setters after sign-in / sign-out:

```ts
import { setAuthToken, setUnauthorizedHandler } from "@/api/interceptors";

// After sign-in:
setAuthToken(session.accessToken);
setUnauthorizedHandler(signOut);

// After sign-out:
setAuthToken(null);
setUnauthorizedHandler(null);
```

This avoids a circular import between the API layer and the auth context.

> **Refresh flow**: Silent token refresh on 401 is not yet implemented. When the backend exposes a mobile-friendly `/api/Auth/refresh` endpoint (token in body rather than httpOnly cookie), the response interceptor should attempt one silent refresh and retry before calling `onUnauthorized`.

## Session Storage

`src/api/tokenStorage.ts` persists auth material in the OS keychain / keystore via `expo-secure-store` (never AsyncStorage).

| SecureStore key         | Value                                |
| ----------------------- | ------------------------------------ |
| `spc.auth.accessToken`  | JWT access token                     |
| `spc.auth.expiresAtUtc` | ISO 8601 expiry timestamp (optional) |

```ts
import { getStoredSession, setStoredSession, clearStoredSession } from "@/api/tokenStorage";
```

## React Query Client

`src/api/queryClient.ts` exports a singleton `QueryClient` with these defaults:

| Option      | Value                        |
| ----------- | ---------------------------- |
| `retry`     | `false`                      |
| `staleTime` | 1 hour (`1000 * 60 * 60` ms) |

The client is provided at the root of the tree via `AppProvider`.

## Generated API Client

`src/api/generated/` contains a typed Axios + React Query client auto-generated from the OpenAPI spec (`docs/openapi.json`). **Do not edit files in `src/api/generated/` by hand** — regenerate them from the spec instead.
