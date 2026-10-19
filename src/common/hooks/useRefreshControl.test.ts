/// <reference types="jest" />

import { act, renderHook } from "@testing-library/react-native";

import { useRefreshControl } from "./useRefreshControl";

const deferred = () => {
  let resolve: () => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("useRefreshControl", () => {
  it("is refreshing at once, and stops when the refresh finishes", async () => {
    const pending = deferred();
    const { result } = renderHook(() => useRefreshControl(() => pending.promise));

    expect(result.current.isRefreshing).toBe(false);

    let refreshing!: Promise<void>;
    act(() => {
      refreshing = result.current.onRefresh();
    });
    expect(result.current.isRefreshing).toBe(true);

    await act(async () => {
      pending.resolve();
      await refreshing;
    });
    expect(result.current.isRefreshing).toBe(false);
  });

  it("stops refreshing when the refresh fails, and passes the failure on", async () => {
    const pending = deferred();
    const { result } = renderHook(() => useRefreshControl(() => pending.promise));

    let refreshing!: Promise<void>;
    act(() => {
      refreshing = result.current.onRefresh();
    });
    const outcome = refreshing.then(
      () => "resolved",
      (error: Error) => error.message
    );

    await act(async () => {
      pending.reject(new Error("offline"));
      await outcome;
    });

    expect(result.current.isRefreshing).toBe(false);
    expect(await outcome).toBe("offline");
  });
});
