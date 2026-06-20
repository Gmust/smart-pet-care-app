# Authentication

## Overview

The app uses email/password and Google OAuth for authentication. Session material (JWT access token, refresh token, expiry) is persisted in the OS keychain via `expo-secure-store` and restored on app launch.

## Auth Context & Hooks

`AuthProvider` wraps the entire app and manages session state. It is initialized in `src/app/_layout.tsx` and restored from secure storage on startup.

```ts
import { useAuth } from "@/auth/hooks/useAuth";

const { status, session, isAuthenticated, signIn, signOut } = useAuth();
```

### Auth Status

- `loading` — App is restoring session from secure storage (splash screen visible).
- `authenticated` — User has a valid session.
- `unauthenticated` — No session found or session expired; user sees auth flow.

## Environment Variables

Google OAuth requires three client IDs from the same Google Cloud project. **All three MUST be configured** for native sign-in to work.

| Variable                               | Required | Description                                     |
| -------------------------------------- | -------- | ----------------------------------------------- |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`     | Yes      | Web client ID (audience the backend validates). |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`     | Yes      | iOS client ID.                                  |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Yes      | Android client ID.                              |

The native client IDs are matched by Google automatically via package name + SHA-1 (Android) or bundle ID (iOS), so they are not passed to `GoogleSignin.signIn()`; the backend validates the `idToken`'s audience against the Web client ID.

## Sign-in Flow

Both email and Google flows call the same backend endpoint:

```ts
// Email sign-in/register
(await POST) / api / Auth / login; // or POST /api/Auth/register
(await POST) / api / Auth / oauth / google / mobile; // Google OAuth
```

Both return an `AuthResponse` with `accessToken`, `refreshToken`, optional `id`, optional `email`, and optional `expiresAtUtc`. The session is passed to `AuthProvider.signIn()` and persisted to secure storage.

## Refresh Flow

When a request returns `401`, the response interceptor asks `AuthProvider` to call `POST /api/Auth/refresh` with the stored refresh token. If the backend returns a new `AuthResponse`, the app persists the rotated tokens and retries the failed request once.

On app launch, an expired access token is also refreshed silently when a refresh token is available. If refresh fails, the stored session is cleared and the user returns to the auth flow.

## Sign-out

Calling `signOut()` clears the secure-store session and updates auth context. The response interceptor calls `signOut()` only when silent refresh is unavailable or fails.

## Email Authentication

`EmailAuthForm` (controlled via TanStack Form) validates and submits email/password credentials:

- **Login**: `email` + `password` → `POST /api/Auth/login`
- **Register**: `email` + `password` + `passwordConfirm` → `POST /api/Auth/register`

Validation is performed on form change and submit using Zod schemas in `src/auth/schemas/auth.schema.ts`.

### Password Requirements

(As defined by `registerSchema` in auth.schema.ts)

- Minimum 6 characters
- At least one letter, one number, one special character

## Google OAuth

`GoogleAuthButton` calls `GoogleSignin.signIn()` from `@react-native-google-signin/google-signin` to obtain a native idToken, then exchanges it for a session:

```ts
const response = await GoogleSignin.signIn();
const idToken = response.data.idToken;
await POST /api/Auth/oauth/google/mobile { idToken }
```

The backend validates the idToken's audience against `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

## Terms & Privacy

Before account creation, users must agree to Terms of Service and Privacy Policy. `AgreementsDialog` displays links and tracks acceptance. Users can proceed directly to sign-in without agreeing (pre-acceptance not enforced on native Google sign-in).

When creating an account via email, the `termsAccepted` flag is sent to `POST /api/Auth/register`.
