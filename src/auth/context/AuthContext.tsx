import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { AuthResponse } from "@/api/generated";
import { setAuthToken, setUnauthorizedHandler } from "@/api/interceptors";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/api/tokenStorage";

import type { AuthContextValue, AuthSession, AuthStatus } from "../types";
import dayjs from "dayjs";

export const AuthContext = createContext<AuthContextValue | null>(null);

const isExpired = (expiresAtUtc: string | null): boolean => {
  if (!expiresAtUtc) {
    return false;
  }
  return dayjs.utc().isAfter(dayjs.utc(expiresAtUtc));
};

const toSession = (response: AuthResponse): AuthSession | null => {
  if (!response.accessToken) return null;

  return {
    id: response.id ?? null,
    email: response.email ?? null,
    accessToken: response.accessToken,
    expiresAtUtc: response.expiresAtUtc ?? null,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  const applySession = useCallback((next: AuthSession | null) => {
    setAuthToken(next?.accessToken ?? null);
    setSession(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  const signOut = useCallback(async () => {
    await clearStoredSession();
    applySession(null);
  }, [applySession]);

  const signIn = useCallback(
    async (response: AuthResponse) => {
      const next = toSession(response);
      if (!next) {
        throw new Error("Auth response did not include an access token.");
      }
      await setStoredSession({ accessToken: next.accessToken, expiresAtUtc: next.expiresAtUtc });
      applySession(next);
    },
    [applySession]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const stored = await getStoredSession();
      if (!active) {
        return;
      }
      if (!stored || isExpired(stored.expiresAtUtc)) {
        if (stored) {
          await clearStoredSession();
        }
        applySession(null);
        return;
      }
      applySession({
        id: null,
        email: null,
        accessToken: stored.accessToken,
        expiresAtUtc: stored.expiresAtUtc,
      });
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      isAuthenticated: status === "authenticated",
      signIn,
      signOut,
    }),
    [status, session, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
