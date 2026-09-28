/// <reference types="jest" />

import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";

import {
  registerAuthInterceptors,
  setAuthToken,
  setRefreshAuthSessionHandler,
  setUnauthorizedHandler,
} from "./interceptors";

type Reply = { status: number; data?: unknown };

// A fake server: every request is answered by `route` without touching the network.
const createClient = (route: (config: InternalAxiosRequestConfig) => Reply): AxiosInstance => {
  const client = axios.create({
    adapter: async (config) => {
      const { status, data } = route(config);
      const response: AxiosResponse = { status, data, statusText: "", headers: {}, config };
      if (status >= 400) {
        throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, response);
      }
      return response;
    },
  });
  registerAuthInterceptors(client);
  return client;
};

const unauthorized = (code: string): Reply => ({ status: 401, data: { code, message: code } });

// Mirrors AuthContext.refreshSessionWithToken: the refresh goes through the same
// intercepted client, a re-entrant call gets the in-flight promise back, and a
// success installs the new token (applySession) before resolving. The
// re-entrancy is what used to deadlock on a 401 from the refresh itself.
const installRefresh = (client: AxiosInstance) => {
  let inFlight: Promise<string | null> | null = null;
  const refresh = jest.fn(() => {
    inFlight ??= client
      .post("/api/auth/refresh", { refreshToken: "refresh-token" })
      .then(() => {
        setAuthToken("fresh-token");
        return "fresh-token";
      })
      .catch(() => null)
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  });
  setRefreshAuthSessionHandler(refresh);
  return refresh;
};

const onUnauthorized = jest.fn();

beforeEach(() => {
  onUnauthorized.mockClear();
  setUnauthorizedHandler(onUnauthorized);
  setAuthToken("stale-token");
});

afterEach(() => {
  setRefreshAuthSessionHandler(null);
  setUnauthorizedHandler(null);
  setAuthToken(null);
});

describe("auth interceptor", () => {
  it("refreshes once on auth_authentication_required and replays the request", async () => {
    const client = createClient((config) => {
      if (config.url === "/api/auth/refresh") return { status: 200, data: {} };
      return config.headers.get("Authorization") === "Bearer fresh-token"
        ? { status: 200, data: ["pet"] }
        : unauthorized("auth_authentication_required");
    });
    const refresh = installRefresh(client);

    await expect(client.get("/api/pets")).resolves.toMatchObject({ data: ["pet"] });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it.each([
    "auth_refresh_token_invalid",
    "auth_account_no_longer_exists",
    "authentication_token_invalid",
  ])("ends the session on %s without refreshing", async (code) => {
    const client = createClient(() => unauthorized(code));
    const refresh = installRefresh(client);

    await expect(client.get("/api/pets")).rejects.toMatchObject({
      response: { data: { code } },
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it.each(["auth_invalid_credentials", "auth_google_failed"])(
    "leaves %s to the form: no refresh, no sign-out",
    async (code) => {
      const client = createClient(() => unauthorized(code));
      const refresh = installRefresh(client);

      await expect(client.post("/api/auth/login", {})).rejects.toMatchObject({
        response: { data: { code } },
      });
      expect(refresh).not.toHaveBeenCalled();
      expect(onUnauthorized).not.toHaveBeenCalled();
    }
  );

  it("settles when the refresh call itself answers 401", async () => {
    // Before the fix this never settled: the refresh 401 re-entered the
    // interceptor, which awaited the refresh promise that was waiting on it.
    const client = createClient((config) =>
      config.url === "/api/auth/refresh"
        ? unauthorized("auth_refresh_token_invalid")
        : unauthorized("auth_authentication_required")
    );
    const refresh = installRefresh(client);

    await expect(client.get("/api/pets")).rejects.toMatchObject({
      response: { data: { code: "auth_authentication_required" } },
    });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalled();
  }, 1000);

  it("does not refresh a replayed request a second time", async () => {
    // Capped so a regression fails here instead of refreshing until OOM.
    let requests = 0;
    const client = createClient((config) => {
      if (config.url === "/api/auth/refresh") return { status: 200, data: {} };
      requests += 1;
      return requests > 5 ? { status: 500 } : unauthorized("auth_authentication_required");
    });
    const refresh = installRefresh(client);

    await expect(client.get("/api/pets")).rejects.toBeInstanceOf(AxiosError);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
