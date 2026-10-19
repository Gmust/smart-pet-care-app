/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import i18next from "i18next";

import { FoodType, PortionUnit } from "@/api/generated";
import enCommon from "@/common/locales/en.json";
import enErrors from "@/errors/locales/en.json";

import enFeeding from "../locales/en.json";

const PET_ID = "11111111-1111-4111-8111-111111111111";

beforeAll(async () => {
  // The app extends dayjs in the root layout; the page prints "Updated … ago".
  dayjs.extend(relativeTime);
  await i18next.use(initReactI18next).init({
    lng: "en",
    resources: { en: { feeding: enFeeding, common: enCommon, errors: enErrors } },
    interpolation: { escapeValue: false },
  });
});

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), canGoBack: () => true }),
  Redirect: jest.fn(() => null),
}));

jest.mock("@/shadecn/ui/drawer", () => require("../testing/portalMocks").drawerMock());
jest.mock("@/shadecn/ui/dropdown-menu", () => require("../testing/portalMocks").dropdownMenuMock());
jest.mock("@/shadecn/ui/dialog", () => require("../testing/portalMocks").dialogMock());

jest.mock("@/api", () => ({
  getApiPetsId: jest.fn(),
  getApiPetsPetIdFeedingLogs: jest.fn(),
  getApiPetsPetIdNutritionSummary: jest.fn(),
  getApiPetsPetIdNutritionSummaryAnalysis: jest.fn(),
  postApiPetsPetIdNutritionSummaryAnalysis: jest.fn(),
  getApiRemindersOccurrences: jest.fn(),
  postApiPetsPetIdFeedingLogs: jest.fn(),
  patchApiPetsPetIdFeedingLogsLogId: jest.fn(),
}));

import { Redirect, useLocalSearchParams } from "expo-router";

import {
  getApiPetsId,
  getApiPetsPetIdFeedingLogs,
  getApiPetsPetIdNutritionSummary,
  getApiPetsPetIdNutritionSummaryAnalysis,
  getApiRemindersOccurrences,
  postApiPetsPetIdNutritionSummaryAnalysis,
} from "@/api";

import NutritionAnalysisPage from "./NutritionAnalysisPage";

const petMock = jest.mocked(getApiPetsId);
const logsMock = jest.mocked(getApiPetsPetIdFeedingLogs);
const summaryMock = jest.mocked(getApiPetsPetIdNutritionSummary);
const analysisMock = jest.mocked(getApiPetsPetIdNutritionSummaryAnalysis);
const runMock = jest.mocked(postApiPetsPetIdNutritionSummaryAnalysis);
const occurrencesMock = jest.mocked(getApiRemindersOccurrences);

const clients: QueryClient[] = [];

const apiResponse = <T,>(data: T, status = 200): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status, statusText: "", headers, config: { headers } };
};

// The generated DTOs mark almost every field optional and type numbers loosely, so
// fixtures are cast once here instead of in every case.
type Verdict = NonNullable<
  Awaited<ReturnType<typeof getApiPetsPetIdNutritionSummaryAnalysis>>["data"]["latest"]
>;

const verdict = (overrides: Record<string, unknown> = {}) =>
  ({
    id: "analysis-1",
    petId: PET_ID,
    date: dayjs().format("YYYY-MM-DD"),
    status: "OnTarget",
    targetCalories: "420.00",
    actualCalories: "405.00",
    deviationPct: "-3.57",
    mealCount: 3,
    createdAt: dayjs().add(1, "hour").toISOString(),
    ...overrides,
  }) as unknown as Verdict;

const meal = (overrides: Record<string, unknown> = {}) => ({
  id: "log-1",
  petId: PET_ID,
  fedAt: dayjs().startOf("day").toISOString(),
  createdAt: dayjs().startOf("day").toISOString(),
  foodType: FoodType.DryFood,
  foodName: "Royal Canin Renal",
  portionAmount: 85,
  portionUnit: PortionUnit.Gram,
  approxCalories: 170,
  ...overrides,
});

const renderPage = () => {
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
  return render(<NutritionAnalysisPage />, { wrapper });
};

beforeEach(() => {
  jest.resetAllMocks();
  onlineManager.setOnline(true);
  jest.mocked(useLocalSearchParams).mockReturnValue({ petId: PET_ID });
  jest.mocked(Redirect).mockReturnValue(null);
  petMock.mockResolvedValue(apiResponse({ id: PET_ID, name: "Miso" }));
  logsMock.mockResolvedValue(apiResponse([meal()]));
  summaryMock.mockResolvedValue(
    apiResponse({ mealCount: 1, totalCalories: 170, goal: { dailyCalorieTarget: 420 } })
  );
  occurrencesMock.mockResolvedValue(apiResponse([]));
  analysisMock.mockResolvedValue(apiResponse({ latest: null, previous: null }));
});

afterEach(() => {
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("NutritionAnalysisPage", () => {
  it("sends a deep link with a bad pet id back to the pets list, fetching nothing", () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ petId: "not-a-uuid" });

    renderPage();

    expect(jest.mocked(Redirect).mock.calls[0]?.[0]).toEqual({ href: "/(tabs)/pets" });
    expect(analysisMock).not.toHaveBeenCalled();
  });

  it("shows the latest verdict and the one before it", async () => {
    analysisMock.mockResolvedValue(
      apiResponse({
        latest: verdict(),
        previous: verdict({ id: "analysis-0", status: "UnderTarget" }),
      })
    );
    const screen = renderPage();

    expect(await screen.findByText("On target")).toBeTruthy();
    expect(screen.getByText("Latest")).toBeTruthy();
    expect(screen.getByText("Previous")).toBeTruthy();
    expect(screen.getByText("Below target")).toBeTruthy();
  });

  it("names the goal on each card only where the run provably used it", async () => {
    summaryMock.mockResolvedValue(
      apiResponse({
        mealCount: 1,
        totalCalories: 170,
        goal: { dailyCalorieTarget: 420, createdAt: dayjs().subtract(3, "day").toISOString() },
      })
    );
    analysisMock.mockResolvedValue(
      apiResponse({
        latest: verdict(),
        previous: verdict({ id: "analysis-0", targetCalories: "380.00" }),
      })
    );
    const screen = renderPage();

    expect(await screen.findByText("3 meals logged · target from your daily goal")).toBeTruthy();
    expect(screen.getByText("of 380 kcal/day target · −4%")).toBeTruthy();
  });

  it("does not claim the goal for a run when the goal is unknown", async () => {
    summaryMock.mockResolvedValue(apiResponse({ mealCount: 1, totalCalories: 170 }));
    analysisMock.mockResolvedValue(apiResponse({ latest: verdict(), previous: null }));
    const screen = renderPage();

    expect(await screen.findByText("3 meals logged")).toBeTruthy();
    expect(screen.queryByText(/target from your daily goal/)).toBeNull();
  });

  it("shows the disclaimer the server sent, or ours when it sent none", async () => {
    analysisMock.mockResolvedValue(
      apiResponse({ latest: verdict({ disclaimer: "Check with your own vet." }), previous: null })
    );
    const withOwn = renderPage();

    expect(await withOwn.findByText("Check with your own vet.")).toBeTruthy();
    withOwn.unmount();

    analysisMock.mockResolvedValue(apiResponse({ latest: verdict(), previous: null }));
    const withDefault = renderPage();

    expect(await withDefault.findByText(/AI estimate based on logged meals/)).toBeTruthy();
  });

  it("invites a first analysis when none was run, and runs it", async () => {
    runMock.mockResolvedValue(apiResponse(verdict()));
    const screen = renderPage();

    fireEvent.press(await screen.findByText("Run analysis"));

    await waitFor(() => expect(runMock).toHaveBeenCalledTimes(1));
    expect(runMock.mock.calls[0]?.[0]).toBe(PET_ID);
  });

  it("asks for a meal first when none was logged today", async () => {
    logsMock.mockResolvedValue(apiResponse([]));
    const screen = renderPage();

    expect(await screen.findByText("Log a meal to run an AI check of today’s intake")).toBeTruthy();
    expect(screen.queryByText("Run analysis")).toBeNull();
  });

  it("asks for calories, with no way to run, when a meal today has none", async () => {
    logsMock.mockResolvedValue(apiResponse([meal({ approxCalories: undefined })]));
    const screen = renderPage();

    expect(
      await screen.findByText("Add calories to all of today’s meals to run an AI check")
    ).toBeTruthy();
    expect(screen.queryByText("Run analysis")).toBeNull();
  });

  it("will not run again while nothing changed since the last verdict, and says why", async () => {
    analysisMock.mockResolvedValue(apiResponse({ latest: verdict(), previous: null }));
    const screen = renderPage();
    await screen.findByText("On target");

    fireEvent.press(screen.getByText("Run new analysis"));

    expect(screen.getByText(/add or edit a meal, or change the goal, to run again/)).toBeTruthy();
    expect(runMock).not.toHaveBeenCalled();
  });

  it("shows why a run failed, with the last verdict still below it", async () => {
    analysisMock.mockResolvedValue(apiResponse({ latest: verdict(), previous: null }));
    logsMock.mockResolvedValue(
      apiResponse([meal({ createdAt: dayjs().add(2, "hour").toISOString() })])
    );
    runMock.mockImplementation(() =>
      Promise.reject(
        new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, {
          ...apiResponse({ retryAfterSeconds: 30 }, 429),
        })
      )
    );
    const screen = renderPage();

    fireEvent.press(await screen.findByText("Run new analysis"));

    expect(await screen.findByText("Analysis failed")).toBeTruthy();
    expect(screen.getByText("Too many requests. Try again in 30 seconds.")).toBeTruthy();
    expect(screen.getByText("On target")).toBeTruthy();
  });

  it("dismisses a failure that cannot be retried, so the page is not stuck on it", async () => {
    logsMock.mockResolvedValue(apiResponse([meal()]));
    runMock.mockImplementation(() =>
      Promise.reject(
        new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, {
          ...apiResponse({ code: "something_unknown", retryable: false }, 400),
        })
      )
    );
    const screen = renderPage();

    fireEvent.press(await screen.findByText("Run analysis"));
    fireEvent.press(await screen.findByText("Dismiss"));

    await waitFor(() => expect(screen.queryByText("Analysis failed")).toBeNull());
    expect(await screen.findByText("Run analysis")).toBeTruthy();
  });

  it("does not read a failed load as 'no analysis yet'", async () => {
    analysisMock.mockImplementation(() => Promise.reject(new Error("network")));
    const screen = renderPage();

    expect(await screen.findByText("Something went wrong")).toBeTruthy();
    expect(screen.queryByText("Run analysis")).toBeNull();
  });
});
