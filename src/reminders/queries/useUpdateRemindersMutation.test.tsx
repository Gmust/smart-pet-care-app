/// <reference types="jest" />

import { createElement } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockGet = jest.fn();
const mockPatch = jest.fn();
jest.mock("@/api", () => ({
  getApiRemindersId: (...args: unknown[]) => mockGet(...args),
  patchApiRemindersId: (...args: unknown[]) => mockPatch(...args),
}));
jest.mock("@/common/utils/getUtcOffsetMinutes", () => ({ getUtcOffsetMinutes: () => 0 }));

import { useGetReminderById } from "./useGetReminderById";
import { useUpdateRemindersMutation } from "./useUpdateRemindersMutation";

const client = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity, retry: false }, mutations: { gcTime: Infinity } },
});
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client }, children);

afterEach(() => {
  client.clear();
  jest.clearAllMocks();
});

describe("useUpdateRemindersMutation", () => {
  it("lets the next edit open on the saved values, not the pre-save ones", async () => {
    mockGet.mockImplementation(() => Promise.resolve({ data: { id: "r", timeOfDay: "08:00" } }));
    const firstOpen = renderHook(() => useGetReminderById("r"), { wrapper });
    await waitFor(() => expect(firstOpen.result.current.data?.timeOfDay).toBe("08:00"));

    // The refetch after the save is slow: the drawer closes before it answers.
    let answerRefetch: (value: unknown) => void = () => undefined;
    mockGet.mockImplementation(
      () =>
        new Promise((resolve) => {
          answerRefetch = resolve;
        })
    );
    mockPatch.mockImplementation(() => Promise.resolve({ data: { id: "r", timeOfDay: "09:00" } }));
    const mutation = renderHook(() => useUpdateRemindersMutation(), { wrapper });
    await act(async () => {
      await mutation.result.current.mutateAsync({ id: "r", payload: { time: "09:00" } });
    });
    firstOpen.unmount();

    const secondOpen = renderHook(() => useGetReminderById("r"), { wrapper });

    expect(secondOpen.result.current.data?.timeOfDay).toBe("09:00");

    // Let the pending refetch settle so no query keeps the suite alive.
    await act(async () => {
      answerRefetch({ data: { id: "r", timeOfDay: "09:00" } });
    });
    secondOpen.unmount();
    mutation.unmount();
  });
});
