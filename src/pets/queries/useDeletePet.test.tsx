/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";

import { deleteApiPetsId } from "@/api";
import { reminderQueryKeys } from "@/reminders/queries/reminderQueryKeys";

import { useDeletePet } from "./useDeletePet";

jest.mock("@/api", () => ({ deleteApiPetsId: jest.fn(() => Promise.resolve({ data: {} })) }));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: Infinity, retry: false },
    mutations: { gcTime: Infinity, retry: false },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

afterEach(() => queryClient.clear());

describe("useDeletePet", () => {
  // Found on a device: Home kept showing the deleted pet's reminder until the app restarted.
  it("marks other features' cached data stale, since the server deletes it with the pet", async () => {
    queryClient.setQueryData(reminderQueryKeys.list(), [{ id: "reminder-1", petId: "pet-1" }]);
    const { result } = renderHook(() => useDeletePet(), { wrapper });

    await act(() => result.current.mutateAsync("pet-1"));

    expect(deleteApiPetsId).toHaveBeenCalledWith("pet-1");
    expect(queryClient.getQueryState(reminderQueryKeys.list())?.isInvalidated).toBe(true);
  });
});
