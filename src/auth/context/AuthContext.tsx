import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { postApiAuthRefresh } from "@/api";
import type { AuthResponse } from "@/api/generated";
import {
  setAuthToken,
  setRefreshAuthSessionHandler,
  setUnauthorizedHandler,
} from "@/api/interceptors";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/api/tokenStorage";
import { NotificationProvider } from "@/notifications/providers/NotificationProvider";
import { unregisterStoredDeviceToken } from "@/notifications/services/notificationRegistration";

import type { AuthContextValue, AuthSession, AuthStatus } from "../types";
import dayjs from "dayjs";

export const AuthContext = createContext<AuthContextValue | null>(null);

const isExpired = (expiresAtUtc: string | null): boolean => {
  if (!expiresAtUtc) {
    return false;
  }
  return dayjs.utc().isAfter(dayjs.utc(expiresAtUtc));
};

const toSession = (
  response: AuthResponse,
  fallbackRefreshToken: string | null = null
): AuthSession | null => {
  if (!response.accessToken) return null;

  return {
    id: response.id ?? null,
    email: response.email ?? null,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken ?? fallbackRefreshToken,
    expiresAtUtc: response.expiresAtUtc ?? null,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const currentSessionRef = useRef<AuthSession | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const signOutPromiseRef = useRef<Promise<void> | null>(null);

  const applySession = useCallback((next: AuthSession | null) => {
    currentSessionRef.current = next;
    setAuthToken(next?.accessToken ?? null);
    setSession(next);
    setStatus(next ? "authenticated" : "unauthenticated");
  }, []);

  const signOut = useCallback(() => {
    if (signOutPromiseRef.current) {
      return signOutPromiseRef.current;
    }

    signOutPromiseRef.current = (async () => {
      refreshPromiseRef.current = null;
      unregisterStoredDeviceToken().catch((error: unknown) => {
        console.error("Failed to clean up notifications during sign-out.", error);
      });
      await clearStoredSession();
      applySession(null);
    })().finally(() => {
      signOutPromiseRef.current = null;
    });

    return signOutPromiseRef.current;
  }, [applySession]);

  const signIn = useCallback(
    async (response: AuthResponse) => {
      const next = toSession(response);
      if (!next) {
        throw new Error("Auth response did not include an access token.");
      }
      await setStoredSession({
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        expiresAtUtc: next.expiresAtUtc,
      });
      applySession(next);
    },
    [applySession]
  );

  const refreshSessionWithToken = useCallback(
    (refreshToken: string | null) => {
      if (!refreshToken) {
        return Promise.resolve(null);
      }

      if (refreshPromiseRef.current) {
        return refreshPromiseRef.current;
      }

      refreshPromiseRef.current = postApiAuthRefresh({ refreshToken })
        .then(async (response) => {
          const next = toSession(response.data, refreshToken);
          if (!next) {
            return null;
          }

          await setStoredSession({
            accessToken: next.accessToken,
            refreshToken: next.refreshToken,
            expiresAtUtc: next.expiresAtUtc,
          });
          applySession(next);
          return next.accessToken;
        })
        .catch(() => null)
        .finally(() => {
          refreshPromiseRef.current = null;
        });

      return refreshPromiseRef.current;
    },
    [applySession]
  );

  const refreshCurrentSession = useCallback(() => {
    return refreshSessionWithToken(currentSessionRef.current?.refreshToken ?? null);
  }, [refreshSessionWithToken]);

  useEffect(() => {
    setRefreshAuthSessionHandler(refreshCurrentSession);
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => {
      setRefreshAuthSessionHandler(null);
      setUnauthorizedHandler(null);
    };
  }, [refreshCurrentSession, signOut]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const stored = await getStoredSession();
      if (!active) {
        return;
      }
      if (!stored || isExpired(stored.expiresAtUtc)) {
        if (stored?.refreshToken) {
          const refreshedAccessToken = await refreshSessionWithToken(stored.refreshToken);
          if (active && refreshedAccessToken) {
            return;
          }
        }

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
        refreshToken: stored.refreshToken,
        expiresAtUtc: stored.expiresAtUtc,
      });
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [applySession, refreshSessionWithToken]);

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

  return (
    <AuthContext.Provider value={value}>
      <NotificationProvider isAuthenticated={status === "authenticated"}>
        {children}
      </NotificationProvider>
    </AuthContext.Provider>
  );
}
