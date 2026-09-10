/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";

const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

jest.mock("@/api", () => ({
  deleteApiPetsPetIdActivityLogsActivityLogId: jest.fn(),
}));

import { deleteApiPetsPetIdActivityLogsActivityLogId } from "@/api";

import { useActivityLogDelete } from "./useActivityLogDelete";

const deleteMock = jest.mocked(deleteApiPetsPetIdActivityLogsActivityLogId);

const PET_ID = "pet-1";
const clients: QueryClient[] = [];

const renderDeleteHook = (petId: string | undefined) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
  clients.push(queryClient);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useActivityLogDelete(petId), { wrapper });
};

const noop = () => {
  const headers = new AxiosHeaders();
  const response: AxiosResponse<void> = {
    data: undefined,
    status: 204,
    statusText: "No Content",
    headers,
    config: { headers },
  };
  return response;
};

beforeEach(() => {
  // reset, not clear: clearAllMocks leaves implementations in place, so a
  // rejecting mock would bleed into later tests.
  jest.resetAllMocks();
});

afterEach(() => {
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("useActivityLogDelete", () => {
  it("does not delete when a deletion is merely requested", () => {
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete({ id: "activity-1", title: "Walk" });
    });

    // The dialog is open, but nothing has been destroyed yet.
    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes only once the dialog is confirmed", async () => {
    deleteMock.mockResolvedValue(noop());
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete({ id: "activity-1", title: "Walk" });
    });
    await act(async () => {
      await result.current.dialogProps.onConfirm();
    });

    expect(deleteMock).toHaveBeenCalledWith(PET_ID, "activity-1");
  });

  it("does not delete when the dialog is dismissed", () => {
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete({ id: "activity-1", title: "Walk" });
    });
    act(() => {
      result.current.dialogProps.setIsOpen(false);
    });

    expect(result.current.dialogProps.isOpen).toBe(false);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("propagates a failed delete so the dialog can surface it and keep the entry", async () => {
    // mockRejectedValue would build the rejected promise eagerly; unconsumed, it
    // surfaces as an unhandled rejection inside the *next* test.
    deleteMock.mockImplementation(() => Promise.reject(new Error("nope")));
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete({ id: "activity-1", title: "Walk" });
    });

    await act(async () => {
      await expect(result.current.dialogProps.onConfirm()).rejects.toThrow("nope");
    });

    // Still open — DeleteConfirmDialog only closes on a resolved confirm.
    expect(result.current.dialogProps.isOpen).toBe(true);
  });

  it("does nothing when there is no selected pet", async () => {
    const { result } = renderDeleteHook(undefined);

    act(() => {
      result.current.requestDelete({ id: "activity-1", title: "Walk" });
    });
    await act(async () => {
      await result.current.dialogProps.onConfirm();
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("names the activity in the confirmation copy", () => {
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete({ id: "activity-1", title: "Walk" });
    });

    expect(result.current.dialogProps.title).toBe("activity:deleteDialog.title");
    expect(result.current.dialogProps.description).toBe("activity:deleteDialog.description");
  });
});
