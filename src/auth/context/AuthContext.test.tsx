/// <reference types="jest" />

import { useEffect } from "react";
import type { ReactNode } from "react";
import { act, render, waitFor } from "@testing-library/react-native";

import { useAuth } from "../hooks/useAuth";
import type { AuthContextValue } from "../types";

import { AuthProvider } from "./AuthContext";

const events: string[] = [];

jest.mock("@/notifications/providers/NotificationProvider", () => ({
  NotificationProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/notifications/services/notificationRegistration", () => ({
  unregisterStoredDeviceToken: jest.fn(),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    signOut: jest.fn(),
    hasPreviousSignIn: jest.fn(() => true),
  },
}));

jest.mock("@/api", () => ({
  postApiAuthRefresh: jest.fn(),
}));

jest.mock("@/api/interceptors", () => ({
  setAuthToken: jest.fn(),
  setRefreshAuthSessionHandler: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));

jest.mock("@/assistant/utils/aiUsingConsentStorage", () => ({
  clearAiUsingConsent: jest.fn(async () => {
    events.push("clear-consent");
    return { ok: true, value: undefined };
  }),
  setAiUsingConsent: jest.fn(async (consent: boolean) => {
    events.push(`set-consent:${consent}`);
    return { ok: true, value: undefined };
  }),
}));

jest.mock("@/api/tokenStorage", () => ({
  clearStoredSession: jest.fn(async () => {
    events.push("clear-auth");
  }),
  getStoredSession: jest.fn(async () => null),
  setStoredSession: jest.fn(async () => {
    events.push("store-session");
  }),
}));

import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { setAuthToken } from "@/api/interceptors";
import { queryClient } from "@/api/queryClient";
import { clearStoredSession, setStoredSession } from "@/api/tokenStorage";
import { clearAiUsingConsent, setAiUsingConsent } from "@/assistant/utils/aiUsingConsentStorage";
import { unregisterStoredDeviceToken } from "@/notifications/services/notificationRegistration";

const mockedClearStoredSession = jest.mocked(clearStoredSession);
const mockedUnregisterStoredDeviceToken = jest.mocked(unregisterStoredDeviceToken);
const mockedGoogleSignOut = jest.mocked(GoogleSignin.signOut);
const mockedSetAuthToken = jest.mocked(setAuthToken);
const mockedClearAiUsingConsent = jest.mocked(clearAiUsingConsent);
const mockedSetAiUsingConsent = jest.mocked(setAiUsingConsent);
const mockedSetStoredSession = jest.mocked(setStoredSession);

// Records whether the previous account's cached data was gone when the session was applied.
const recordSessionApply = () => {
  mockedSetAuthToken.mockImplementation((token) => {
    const cache = queryClient.getQueryData(["profile", "me"]) === undefined ? "clean" : "stale";
    events.push(`apply-session:${token}:${cache}`);
  });
};

describe("AuthProvider", () => {
  beforeEach(() => {
    events.length = 0;
    jest.clearAllMocks();
    mockedSetAuthToken.mockReset();
    mockedUnregisterStoredDeviceToken.mockImplementation(async () => {
      events.push("delete-device-token");
    });
    mockedGoogleSignOut.mockImplementation(async () => {
      events.push("google-sign-out");
      return null;
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("attempts device-token deletion before clearing authentication", async () => {
    const auth = await renderAuthProvider();

    await act(async () => {
      await auth.signOut();
    });

    expect(events).toEqual(["delete-device-token", "google-sign-out", "clear-auth"]);
  });

  it("drops cached server data on sign-out", async () => {
    queryClient.setQueryData(["profile", "me"], { email: "previous@example.com" });
    const auth = await renderAuthProvider();

    await act(async () => {
      await auth.signOut();
    });

    expect(queryClient.getQueryData(["profile", "me"])).toBeUndefined();
  });

  it("still ends the session when clearing the stored tokens fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockedClearStoredSession.mockImplementationOnce(() => Promise.reject(new Error("keystore")));
    const auth = await renderAuthProvider();
    await act(async () => {
      await auth.signIn({ accessToken: "next-token" });
    });
    queryClient.setQueryData(["profile", "me"], { email: "previous@example.com" });

    await act(async () => {
      await auth.signOut();
    });

    expect(mockedSetAuthToken).toHaveBeenLastCalledWith(null);
    expect(queryClient.getQueryData(["profile", "me"])).toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("clears the previous consent and cache before applying a new session", async () => {
    const auth = await renderAuthProvider();
    events.length = 0;
    recordSessionApply();
    // A mutation that settled after sign-out wrote the previous account's data back.
    queryClient.setQueryData(["profile", "me"], { email: "previous@example.com" });

    await act(async () => {
      await auth.signIn({ accessToken: "next-token" });
    });

    expect(events).toEqual(["clear-consent", "store-session", "apply-session:next-token:clean"]);
  });

  it("revokes the previous consent when clearing it fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockedClearAiUsingConsent.mockImplementationOnce(async () => {
      events.push("clear-consent-failed");
      return { ok: false, reason: "unavailable" };
    });
    const auth = await renderAuthProvider();
    events.length = 0;
    recordSessionApply();

    await act(async () => {
      await auth.signIn({ accessToken: "next-token" });
    });

    expect(events).toEqual([
      "clear-consent-failed",
      "set-consent:false",
      "store-session",
      "apply-session:next-token:clean",
    ]);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("aborts sign-in when the previous consent cannot be revoked", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockedClearAiUsingConsent.mockImplementationOnce(async () => ({
      ok: false,
      reason: "unavailable",
    }));
    mockedSetAiUsingConsent.mockImplementationOnce(async () => ({
      ok: false,
      reason: "unavailable",
    }));
    const auth = await renderAuthProvider();

    await act(async () => {
      await expect(auth.signIn({ accessToken: "next-token" })).rejects.toThrow();
    });

    expect(mockedSetStoredSession).not.toHaveBeenCalled();
    expect(mockedSetAuthToken).not.toHaveBeenCalledWith("next-token");
    consoleError.mockRestore();
  });

  it("still clears authentication when notification cleanup fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockedUnregisterStoredDeviceToken.mockRejectedValue(new Error("delete failed"));
    const auth = await renderAuthProvider();

    await act(async () => {
      await auth.signOut();
    });

    expect(mockedClearStoredSession).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("still clears authentication when Google cleanup fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockedGoogleSignOut.mockRejectedValue(new Error("Google sign-out failed"));
    const auth = await renderAuthProvider();

    await act(async () => {
      await auth.signOut();
    });

    expect(mockedClearStoredSession).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

const renderAuthProvider = async (): Promise<AuthContextValue> => {
  const authRef: { current: AuthContextValue | null } = { current: null };

  function AuthProbe() {
    const auth = useAuth();
    useEffect(() => {
      authRef.current = auth;
    }, [auth]);
    return null;
  }

  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(authRef.current?.status).toBe("unauthenticated");
  });

  if (!authRef.current) {
    throw new Error("Auth context was not initialized.");
  }

  return authRef.current;
};
