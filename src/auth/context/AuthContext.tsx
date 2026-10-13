import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import dayjs from "dayjs";

import { postApiAuthRefresh } from "@/api";
import type { AuthResponse } from "@/api/generated";
import {
  setAuthToken,
  setRefreshAuthSessionHandler,
  setUnauthorizedHandler,
} from "@/api/interceptors";
import { queryClient } from "@/api/queryClient";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/api/tokenStorage";
import { clearAiUsingConsent, setAiUsingConsent } from "@/assistant/utils/aiUsingConsentStorage";
import { NotificationProvider } from "@/notifications/providers/NotificationProvider";
import { unregisterStoredDeviceToken } from "@/notifications/services/notificationRegistration";

import type { AuthContextValue, AuthSession, AuthStatus } from "../types";

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
      if (GoogleSignin.hasPreviousSignIn()) {
        GoogleSignin.signOut().catch((error: unknown) => {
          console.error("Failed to clear the Google session during sign-out.", error);
        });
      }
      try {
        await clearStoredSession();
      } catch (error: unknown) {
        // Sign out anyway. The tokens survive, so the next app start restores this account.
        console.error("Failed to clear the stored session during sign-out.", error);
      }
      // Query keys are not user-scoped: drop this account's data from memory. Safe here:
      // the (tabs) layout redirects on "unauthenticated", unmounting every observer.
      queryClient.clear();
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
      // The only entry point for a new account. Consent is stored per device, so the account
      // must give its own.
      const consentCleared = await clearAiUsingConsent();
      if (!consentCleared.ok) {
        console.error("Failed to clear the previous account's AI consent during sign-in.");
        // Only `true` counts as consent, so overwriting it fails closed.
        await setAiUsingConsent(false);
      }
      // Drops data a mutation that settled after sign-out wrote back. This narrows the window,
      // it does not close it: one still in flight can write into the new account's cache.
      queryClient.clear();
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
