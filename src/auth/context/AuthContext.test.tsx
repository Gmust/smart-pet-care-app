/// <reference types="jest" />

import { useEffect } from "react";
import type { ReactNode } from "react";
import { act, render, waitFor } from "@testing-library/react-native";

import { useAuth } from "../hooks/useAuth";
import type { AuthContextValue } from "../types";
import { AuthProvider } from "./AuthContext";

const events: string[] = [];

jest.mock("@/notifications/NotificationProvider", () => ({
  NotificationProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/notifications/notificationRegistration", () => ({
  unregisterStoredDeviceToken: jest.fn(),
}));

jest.mock("@/api", () => ({
  postApiAuthRefresh: jest.fn(),
}));

jest.mock("@/api/interceptors", () => ({
  setAuthToken: jest.fn(),
  setRefreshAuthSessionHandler: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));

jest.mock("@/api/tokenStorage", () => ({
  clearStoredSession: jest.fn(async () => {
    events.push("clear-auth");
  }),
  getStoredSession: jest.fn(async () => null),
  setStoredSession: jest.fn(),
}));

import { clearStoredSession } from "@/api/tokenStorage";
import { unregisterStoredDeviceToken } from "@/notifications/services/notificationRegistration";

const mockedClearStoredSession = jest.mocked(clearStoredSession);
const mockedUnregisterStoredDeviceToken = jest.mocked(unregisterStoredDeviceToken);

describe("AuthProvider sign-out", () => {
  beforeEach(() => {
    events.length = 0;
    jest.clearAllMocks();
    mockedUnregisterStoredDeviceToken.mockImplementation(async () => {
      events.push("delete-device-token");
    });
  });

  it("attempts device-token deletion before clearing authentication", async () => {
    const auth = await renderAuthProvider();

    await act(async () => {
      await auth.signOut();
    });

    expect(events).toEqual(["delete-device-token", "clear-auth"]);
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
