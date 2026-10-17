/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import dayjs from "dayjs";

import {
  deleteApiPetsPetIdFeedingLogsLogId,
  deleteApiPetsPetIdNutritionGoal,
  deleteApiPetsPetIdWeightHistoryWeightLogId,
  getApiPetsPetIdNutritionSummary,
  patchApiPetsPetIdFeedingLogsLogId,
  patchApiPetsPetIdWeightHistoryWeightLogId,
  postApiPetsPetIdFeedingLogs,
  postApiPetsPetIdNutritionSummaryAnalysis,
  postApiPetsPetIdWeightHistory,
  putApiPetsPetIdNutritionGoal,
} from "@/api";

import { feedingQueryKeys } from "./feedingQueryKeys";
import { useCreateFeedingLogMutation } from "./useCreateFeedingLogMutation";
import { useCreateWeightLogMutation } from "./useCreateWeightLogMutation";
import { useDeleteFeedingLogMutation } from "./useDeleteFeedingLogMutation";
import { useDeleteNutritionGoalMutation } from "./useDeleteNutritionGoalMutation";
import { useDeleteWeightLogMutation } from "./useDeleteWeightLogMutation";
import { useNutritionSummaryQuery } from "./useNutritionSummaryQuery";
import { useRunNutritionAnalysisMutation } from "./useRunNutritionAnalysisMutation";
import { useUpdateFeedingLogMutation } from "./useUpdateFeedingLogMutation";
import { useUpdateWeightLogMutation } from "./useUpdateWeightLogMutation";
import { useUpsertNutritionGoalMutation } from "./useUpsertNutritionGoalMutation";
import { useWeekNutritionQueries } from "./useWeekNutritionQueries";

jest.mock("@/api", () => {
  const endpoint = () => jest.fn(() => Promise.resolve({ data: {} }));
  return {
    deleteApiPetsPetIdFeedingLogsLogId: endpoint(),
    deleteApiPetsPetIdNutritionGoal: endpoint(),
    deleteApiPetsPetIdWeightHistoryWeightLogId: endpoint(),
    getApiPetsPetIdNutritionSummary: endpoint(),
    patchApiPetsPetIdFeedingLogsLogId: endpoint(),
    patchApiPetsPetIdWeightHistoryWeightLogId: endpoint(),
    postApiPetsPetIdFeedingLogs: endpoint(),
    postApiPetsPetIdNutritionSummaryAnalysis: endpoint(),
    postApiPetsPetIdWeightHistory: endpoint(),
    putApiPetsPetIdNutritionGoal: endpoint(),
  };
});

// The device's offset is a clock reading; a fixed one makes "it was sent" checkable.
jest.mock("@/common/utils/getUtcOffsetMinutes", () => ({ getUtcOffsetMinutes: () => 123 }));

const PET_ID = "pet-1";
const OTHER_PET_ID = "pet-2";

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
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

// One cached query per key family, for this pet and for another one, so a test can
// say exactly which families a mutation marked stale — and that it left the rest.
const SEEDED = {
  logs: feedingQueryKeys.logs(PET_ID),
  summary: feedingQueryKeys.summary(PET_ID),
  summaryForDate: feedingQueryKeys.summaryForDate(PET_ID, "2026-10-08"),
  weight: feedingQueryKeys.weight(PET_ID),
  weightInRange: feedingQueryKeys.weightInRange(PET_ID, "2026-09-08", "2026-10-08"),
  analysis: feedingQueryKeys.analysis(PET_ID),
  pets: ["pets", PET_ID],
  otherPetLogs: feedingQueryKeys.logs(OTHER_PET_ID),
  otherPetWeight: feedingQueryKeys.weight(OTHER_PET_ID),
} as const;

const staleAfter = async <V,>(
  useHook: () => { mutateAsync: (variables: V) => Promise<unknown>; isSuccess: boolean },
  variables: V
) => {
  const { queryClient, wrapper } = createWrapper();
  for (const key of Object.values(SEEDED)) queryClient.setQueryData(key, {});

  const { result } = renderHook(useHook, { wrapper });
  await act(async () => {
    await result.current.mutateAsync(variables);
  });
  // The observer notifies on a timer; wait for it so no update lands after the test.
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  return Object.entries(SEEDED)
    .filter(([, key]) => queryClient.getQueryState(key)?.isInvalidated)
    .map(([name]) => name)
    .sort();
};

describe("what each feeding mutation marks stale", () => {
  const MEAL_FAMILIES = ["logs", "summary", "summaryForDate"];
  const WEIGHT_FAMILIES = ["pets", "weight", "weightInRange"];
  const GOAL_FAMILIES = ["summary", "summaryForDate"];

  const cases: [string, () => Promise<string[]>, string[]][] = [
    [
      "creating a meal",
      () =>
        staleAfter(useCreateFeedingLogMutation, {
          petId: PET_ID,
          dto: { fedAt: "2026-10-08T08:00:00.000Z" },
        }),
      MEAL_FAMILIES,
    ],
    [
      "editing a meal",
      () =>
        staleAfter(useUpdateFeedingLogMutation, {
          petId: PET_ID,
          logId: "log-1",
          dto: { notes: "x" },
        }),
      MEAL_FAMILIES,
    ],
    [
      "deleting a meal",
      () => staleAfter(useDeleteFeedingLogMutation, { petId: PET_ID, logId: "log-1" }),
      MEAL_FAMILIES,
    ],
    [
      "logging a weight",
      () =>
        staleAfter(useCreateWeightLogMutation, {
          petId: PET_ID,
          dto: { weightKg: 4.1, measuredAt: "2026-10-08T08:00:00.000Z" },
        }),
      WEIGHT_FAMILIES,
    ],
    [
      "editing a weight",
      () =>
        staleAfter(useUpdateWeightLogMutation, {
          petId: PET_ID,
          weightLogId: "w-1",
          dto: { weightKg: 4.2 },
        }),
      WEIGHT_FAMILIES,
    ],
    [
      "deleting a weight",
      () => staleAfter(useDeleteWeightLogMutation, { petId: PET_ID, weightLogId: "w-1" }),
      WEIGHT_FAMILIES,
    ],
    [
      "saving the goal",
      () =>
        staleAfter(useUpsertNutritionGoalMutation, {
          petId: PET_ID,
          dto: { dailyCalorieTarget: 420 },
        }),
      GOAL_FAMILIES,
    ],
    ["removing the goal", () => staleAfter(useDeleteNutritionGoalMutation, PET_ID), GOAL_FAMILIES],
    [
      "running an analysis",
      () => staleAfter(useRunNutritionAnalysisMutation, { petId: PET_ID }),
      ["analysis"],
    ],
  ];

  it.each(cases)("%s marks exactly the families it changes as stale", async (_, run, expected) => {
    expect(await run()).toEqual([...expected].sort());
  });
});

describe("what the mutations send", () => {
  const send = async <V,>(
    useHook: () => { mutateAsync: (variables: V) => Promise<unknown>; isSuccess: boolean },
    variables: V
  ) => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(useHook, { wrapper });
    await act(async () => {
      await result.current.mutateAsync(variables);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  };

  it("posts a meal for the pet", async () => {
    const dto = { fedAt: "2026-10-08T08:00:00.000Z", notes: "x" };
    await send(useCreateFeedingLogMutation, { petId: PET_ID, dto });

    expect(postApiPetsPetIdFeedingLogs).toHaveBeenCalledWith(PET_ID, dto);
  });

  it("patches the meal that was edited, with only the given fields", async () => {
    await send(useUpdateFeedingLogMutation, {
      petId: PET_ID,
      logId: "log-1",
      dto: { notes: "x" },
    });

    expect(patchApiPetsPetIdFeedingLogsLogId).toHaveBeenCalledWith(PET_ID, "log-1", {
      notes: "x",
    });
  });

  it("deletes the meal that was chosen", async () => {
    await send(useDeleteFeedingLogMutation, { petId: PET_ID, logId: "log-1" });

    expect(deleteApiPetsPetIdFeedingLogsLogId).toHaveBeenCalledWith(PET_ID, "log-1");
  });

  it("posts, patches and deletes a weight for the right entry", async () => {
    const dto = { weightKg: 4.1, measuredAt: "2026-10-08T08:00:00.000Z" };
    await send(useCreateWeightLogMutation, { petId: PET_ID, dto });
    await send(useUpdateWeightLogMutation, {
      petId: PET_ID,
      weightLogId: "w-1",
      dto: { weightKg: 4.2 },
    });
    await send(useDeleteWeightLogMutation, { petId: PET_ID, weightLogId: "w-1" });

    expect(postApiPetsPetIdWeightHistory).toHaveBeenCalledWith(PET_ID, dto);
    expect(patchApiPetsPetIdWeightHistoryWeightLogId).toHaveBeenCalledWith(PET_ID, "w-1", {
      weightKg: 4.2,
    });
    expect(deleteApiPetsPetIdWeightHistoryWeightLogId).toHaveBeenCalledWith(PET_ID, "w-1");
  });

  it("puts the whole goal and deletes it by pet", async () => {
    await send(useUpsertNutritionGoalMutation, {
      petId: PET_ID,
      dto: { dailyCalorieTarget: 420 },
    });
    await send(useDeleteNutritionGoalMutation, PET_ID);

    expect(putApiPetsPetIdNutritionGoal).toHaveBeenCalledWith(PET_ID, {
      dailyCalorieTarget: 420,
    });
    expect(deleteApiPetsPetIdNutritionGoal).toHaveBeenCalledWith(PET_ID);
  });

  it("runs the analysis with the device's UTC offset, and the day when one is given", async () => {
    await send(useRunNutritionAnalysisMutation, { petId: PET_ID });
    await send(useRunNutritionAnalysisMutation, { petId: PET_ID, date: "2026-10-07" });

    expect(postApiPetsPetIdNutritionSummaryAnalysis).toHaveBeenNthCalledWith(1, PET_ID, null, {
      utcOffsetMinutes: 123,
    });
    expect(postApiPetsPetIdNutritionSummaryAnalysis).toHaveBeenNthCalledWith(2, PET_ID, null, {
      date: "2026-10-07",
      utcOffsetMinutes: 123,
    });
  });
});

describe("daily summaries", () => {
  it("ask the server for today, in the device's UTC offset, unless a day is named", async () => {
    const { wrapper } = createWrapper();

    const today = renderHook(() => useNutritionSummaryQuery({ petId: PET_ID }), { wrapper });
    const named = renderHook(
      () => useNutritionSummaryQuery({ petId: PET_ID, date: "2026-10-07" }),
      { wrapper }
    );

    await waitFor(() => {
      expect(today.result.current.isSuccess).toBe(true);
      expect(named.result.current.isSuccess).toBe(true);
    });
    expect(getApiPetsPetIdNutritionSummary).toHaveBeenCalledWith(PET_ID, {
      utcOffsetMinutes: 123,
    });
    expect(getApiPetsPetIdNutritionSummary).toHaveBeenCalledWith(PET_ID, {
      date: "2026-10-07",
      utcOffsetMinutes: 123,
    });
  });

  it("are not requested without a pet", () => {
    const { wrapper } = createWrapper();

    renderHook(() => useNutritionSummaryQuery({ petId: undefined }), { wrapper });

    expect(getApiPetsPetIdNutritionSummary).not.toHaveBeenCalled();
  });

  it("fill the week with one request per day ending today, each in the device's UTC offset", async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWeekNutritionQueries(PET_ID), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getApiPetsPetIdNutritionSummary).toHaveBeenCalledTimes(7);
    const expectedDays = Array.from({ length: 7 }, (_, index) =>
      dayjs()
        .subtract(6 - index, "day")
        .format("YYYY-MM-DD")
    );
    const calls = jest.mocked(getApiPetsPetIdNutritionSummary).mock.calls;

    expect(calls.map(([, params]) => params?.date).sort()).toEqual(expectedDays);
    expect(
      calls.every(([petId, params]) => petId === PET_ID && params?.utcOffsetMinutes === 123)
    ).toBe(true);
  });
});
