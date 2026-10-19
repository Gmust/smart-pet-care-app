/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";
import i18next from "i18next";

import enCommon from "@/common/locales/en.json";

import enFeeding from "../locales/en.json";
import { feedingQueryKeys } from "../queries/feedingQueryKeys";

beforeAll(async () => {
  await i18next.use(initReactI18next).init({
    lng: "en",
    resources: { en: { feeding: enFeeding, common: enCommon } },
    interpolation: { escapeValue: false },
  });
});

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

jest.mock("@/api", () => ({
  deleteApiPetsPetIdFeedingLogsLogId: jest.fn(),
}));

import { deleteApiPetsPetIdFeedingLogsLogId } from "@/api";

import { useFeedingLogDelete } from "./useFeedingLogDelete";

const deleteMock = jest.mocked(deleteApiPetsPetIdFeedingLogsLogId);
const toastMock = jest.mocked(Toast.show);

const PET_ID = "pet-1";
const MEAL = { id: "log-1", title: "Royal Canin Renal" };
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
  return { queryClient, ...renderHook(() => useFeedingLogDelete(petId), { wrapper }) };
};

// React Query reports a finished mutation to the hook on a timer. Letting that timer run
// inside `act` keeps the update from landing in the next test, where nothing wraps it.
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const noContent = () => {
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
  jest.resetAllMocks();
});

afterEach(() => {
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("useFeedingLogDelete", () => {
  it("only asks when a delete is requested — nothing is removed yet", () => {
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete(MEAL);
    });

    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("names the meal in the confirmation the user reads", () => {
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete(MEAL);
    });

    expect(result.current.dialogProps.title).toBe("Delete this meal?");
    expect(result.current.dialogProps.description).toBe(
      "Royal Canin Renal will be removed from the feeding log."
    );
  });

  it("deletes exactly that meal once confirmed", async () => {
    deleteMock.mockResolvedValue(noContent());
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete(MEAL);
    });
    await act(async () => {
      await result.current.dialogProps.onConfirm();
    });
    await settle();

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith(PET_ID, "log-1");
    expect(toastMock).toHaveBeenCalledWith({ type: "success", text1: "Meal deleted" });
  });

  it("refreshes the meal list and the daily totals, so the removed meal stops counting", async () => {
    deleteMock.mockResolvedValue(noContent());
    const { result, queryClient } = renderDeleteHook(PET_ID);
    queryClient.setQueryData(feedingQueryKeys.logs(PET_ID), [MEAL]);
    queryClient.setQueryData(feedingQueryKeys.summaryForDate(PET_ID, "2026-10-09"), {});

    act(() => {
      result.current.requestDelete(MEAL);
    });
    await act(async () => {
      await result.current.dialogProps.onConfirm();
    });
    await settle();

    expect(queryClient.getQueryState(feedingQueryKeys.logs(PET_ID))?.isInvalidated).toBe(true);
    expect(
      queryClient.getQueryState(feedingQueryKeys.summaryForDate(PET_ID, "2026-10-09"))
        ?.isInvalidated
    ).toBe(true);
  });

  it("deletes nothing when the dialog is dismissed", () => {
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete(MEAL);
    });
    act(() => {
      result.current.dialogProps.setIsOpen(false);
    });

    expect(result.current.dialogProps.isOpen).toBe(false);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("lets a failed delete reach the dialog and keeps it open, so the meal is not lost", async () => {
    deleteMock.mockImplementation(() => Promise.reject(new Error("nope")));
    const { result } = renderDeleteHook(PET_ID);

    act(() => {
      result.current.requestDelete(MEAL);
    });
    await act(async () => {
      await expect(result.current.dialogProps.onConfirm()).rejects.toThrow("nope");
    });
    await settle();

    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("reports an error instead of silently doing nothing when no pet is selected", async () => {
    const { result } = renderDeleteHook(undefined);

    act(() => {
      result.current.requestDelete(MEAL);
    });
    await act(async () => {
      await result.current.dialogProps.onConfirm();
    });

    expect(deleteMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith({ type: "error", text1: "Something went wrong" });
  });
});
