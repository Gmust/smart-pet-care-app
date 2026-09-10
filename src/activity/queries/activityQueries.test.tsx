/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";

import {
  deleteApiPetsPetIdActivityLogsActivityLogId,
  getApiPetsPetIdActivityLogs,
  postApiPetsPetIdActivityLogs,
} from "@/api";
import { ActivityIntensity, type ActivityLogResponseDto, ActivityType } from "@/api/generated";

import { activityQueryKeys } from "./activityQueryKeys";
import { useActivityLogsQuery } from "./useActivityLogsQuery";
import { useCreateActivityLogMutation } from "./useCreateActivityLogMutation";
import { useDeleteActivityLogMutation } from "./useDeleteActivityLogMutation";

jest.mock("@/api", () => ({
  getApiPetsPetIdActivityLogs: jest.fn(),
  postApiPetsPetIdActivityLogs: jest.fn(),
  deleteApiPetsPetIdActivityLogsActivityLogId: jest.fn(),
}));

const listMock = jest.mocked(getApiPetsPetIdActivityLogs);
const createMock = jest.mocked(postApiPetsPetIdActivityLogs);
const deleteMock = jest.mocked(deleteApiPetsPetIdActivityLogsActivityLogId);

const PET_ID = "pet-1";

const activity: ActivityLogResponseDto = {
  id: "activity-1",
  petId: PET_ID,
  recordedAt: "2026-09-01T09:00:00.000Z",
  type: ActivityType.Walk,
  intensity: ActivityIntensity.Moderate,
  durationMinutes: 30,
  steps: 2400,
  location: null,
  note: null,
};

const axiosOk = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: { headers: new AxiosHeaders() },
});

const clients: QueryClient[] = [];

const createWrapper = () => {
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
  return { queryClient, wrapper };
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Without this a cached query keeps React Query's notify timer alive and jest
  // never exits (the suite hangs rather than failing).
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("useActivityLogsQuery", () => {
  it("passes the date range through to the API", async () => {
    listMock.mockResolvedValue(axiosOk([activity]));
    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () =>
        useActivityLogsQuery({
          petId: PET_ID,
          from: "2026-08-01T00:00:00.000Z",
          to: "2026-09-01T00:00:00.000Z",
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(listMock).toHaveBeenCalledWith(PET_ID, {
      from: "2026-08-01T00:00:00.000Z",
      to: "2026-09-01T00:00:00.000Z",
    });
    expect(result.current.data).toEqual([activity]);
  });

  it("stays disabled and issues no request without a pet id", async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useActivityLogsQuery({ petId: undefined }), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(listMock).not.toHaveBeenCalled();
  });

  it("caches separately per date range", async () => {
    listMock.mockResolvedValue(axiosOk([activity]));
    const { wrapper } = createWrapper();

    const { result, rerender } = renderHook(
      ({ from }: { from: string }) => useActivityLogsQuery({ petId: PET_ID, from }),
      { wrapper, initialProps: { from: "2026-08-01T00:00:00.000Z" } }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ from: "2026-07-01T00:00:00.000Z" });
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useCreateActivityLogMutation", () => {
  it("posts the dto and invalidates every cached range for the pet", async () => {
    createMock.mockResolvedValue(axiosOk(activity));
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateActivityLogMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        petId: PET_ID,
        dto: { type: ActivityType.Walk, recordedAt: activity.recordedAt },
      });
    });

    expect(createMock).toHaveBeenCalledWith(PET_ID, {
      type: ActivityType.Walk,
      recordedAt: activity.recordedAt,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: activityQueryKeys.logs(PET_ID) });
  });

  it("surfaces a failed create to the caller", async () => {
    createMock.mockRejectedValue(new Error("boom"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useCreateActivityLogMutation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ petId: PET_ID, dto: { type: ActivityType.Walk } })
      ).rejects.toThrow("boom");
    });
  });
});

describe("useDeleteActivityLogMutation", () => {
  it("deletes by id and invalidates every cached range for the pet", async () => {
    deleteMock.mockResolvedValue(axiosOk(undefined));
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteActivityLogMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ petId: PET_ID, activityLogId: "activity-1" });
    });

    expect(deleteMock).toHaveBeenCalledWith(PET_ID, "activity-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: activityQueryKeys.logs(PET_ID) });
  });

  it("surfaces a failed delete to the caller", async () => {
    deleteMock.mockRejectedValue(new Error("nope"));
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteActivityLogMutation(), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ petId: PET_ID, activityLogId: "activity-1" })
      ).rejects.toThrow("nope");
    });
  });
});

describe("activityQueryKeys", () => {
  it("makes logs() a prefix of logsInRange() so invalidation covers all ranges", () => {
    const prefix = activityQueryKeys.logs(PET_ID);
    const ranged = activityQueryKeys.logsInRange(PET_ID, "a", "b");
    expect(ranged.slice(0, prefix.length)).toEqual([...prefix]);
  });
});
