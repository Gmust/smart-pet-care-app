/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { getApiPets } from "@/api";
import { PetSelectionProvider } from "@/common/providers/PetSelectionProvider";

import { usePetSelection } from "./usePetSelection";

jest.mock("@/api", () => ({ getApiPets: jest.fn() }));

const mockGetApiPets = jest.mocked(getApiPets);

const respondWith = (ids: string[]) =>
  mockGetApiPets.mockImplementation(() =>
    Promise.resolve({ data: ids.map((id) => ({ id, name: id })) } as Awaited<
      ReturnType<typeof getApiPets>
    >)
  );

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: Infinity, retry: false } },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <PetSelectionProvider>{children}</PetSelectionProvider>
  </QueryClientProvider>
);

afterEach(() => queryClient.clear());

describe("usePetSelection", () => {
  it("selects the first pet until another is picked", async () => {
    respondWith(["a", "b"]);
    const { result } = renderHook(() => usePetSelection(), { wrapper });

    await waitFor(() => expect(result.current.selectedPetId).toBe("a"));

    act(() => result.current.setSelectedPetId("b"));
    expect(result.current.selectedPetId).toBe("b");
  });

  it("falls back to the first pet when the picked one is gone", async () => {
    respondWith(["a", "b"]);
    const { result } = renderHook(() => usePetSelection(), { wrapper });
    await waitFor(() => expect(result.current.selectedPetId).toBe("a"));
    act(() => result.current.setSelectedPetId("b"));

    respondWith(["a"]);
    await act(() => queryClient.refetchQueries({ queryKey: ["pets"] }));

    await waitFor(() => expect(result.current.selectedPetId).toBe("a"));
  });

  it("selects nothing while the owner has no pets", async () => {
    respondWith([]);
    const { result } = renderHook(() => usePetSelection(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.selectedPet).toBeUndefined();
  });
});
