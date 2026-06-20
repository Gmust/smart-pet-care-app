import type { AuthResponse } from "@/api/generated";

export type AuthMode = "register" | "login";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthSession {
  id: string | null;
  email: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresAtUtc: string | null;
}

export interface AuthContextValue {
  status: AuthStatus;
  session: AuthSession | null;
  isAuthenticated: boolean;
  /** Persist an auth response and move the app into the authenticated state. */
  signIn: (response: AuthResponse) => Promise<void>;
  /** Clear the session locally (used on logout and on 401). */
  signOut: () => Promise<void>;
}
