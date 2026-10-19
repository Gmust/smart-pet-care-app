/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import Toast from "react-native-toast-message";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor, within } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import i18next from "i18next";

import { FoodType, PortionUnit, ReminderStatus, ReminderType } from "@/api/generated";
import enCommon from "@/common/locales/en.json";
import enErrors from "@/errors/locales/en.json";

import enFeeding from "../locales/en.json";

// A private instance would not reach `useTranslation`, so the global one is used.
beforeAll(async () => {
  // The app extends dayjs once at start-up; the card prints "Updated 2 hours ago".
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

jest.mock("@/shadecn/ui/drawer", () => require("../testing/portalMocks").drawerMock());

jest.mock("@/shadecn/ui/dropdown-menu", () => require("../testing/portalMocks").dropdownMenuMock());

jest.mock("@/shadecn/ui/dialog", () => require("../testing/portalMocks").dialogMock());

jest.mock("@/api", () => ({
  getApiPetsPetIdNutritionSummary: jest.fn(),
  getApiPetsPetIdFeedingLogs: jest.fn(),
  getApiRemindersOccurrences: jest.fn(),
  postApiPetsPetIdFeedingLogs: jest.fn(),
  patchApiPetsPetIdFeedingLogsLogId: jest.fn(),
  deleteApiPetsPetIdFeedingLogsLogId: jest.fn(),
  putApiPetsPetIdNutritionGoal: jest.fn(),
  deleteApiPetsPetIdNutritionGoal: jest.fn(),
  getApiPetsPetIdWeightHistory: jest.fn(),
  postApiPetsPetIdWeightHistory: jest.fn(),
  getApiPetsPetIdNutritionSummaryAnalysis: jest.fn(),
  getApiRemindersPetPetId: jest.fn(),
  postApiPetsPetIdNutritionSummaryAnalysis: jest.fn(),
}));

import {
  deleteApiPetsPetIdFeedingLogsLogId,
  deleteApiPetsPetIdNutritionGoal,
  getApiPetsPetIdFeedingLogs,
  getApiPetsPetIdNutritionSummary,
  getApiPetsPetIdNutritionSummaryAnalysis,
  getApiPetsPetIdWeightHistory,
  getApiRemindersOccurrences,
  getApiRemindersPetPetId,
  postApiPetsPetIdNutritionSummaryAnalysis,
} from "@/api";

import { FeedingTabContent } from "./FeedingTabContent";

const summaryMock = jest.mocked(getApiPetsPetIdNutritionSummary);
const logsMock = jest.mocked(getApiPetsPetIdFeedingLogs);
const occurrencesMock = jest.mocked(getApiRemindersOccurrences);
const deleteMock = jest.mocked(deleteApiPetsPetIdFeedingLogsLogId);
const deleteGoalMock = jest.mocked(deleteApiPetsPetIdNutritionGoal);
const weightMock = jest.mocked(getApiPetsPetIdWeightHistory);
const remindersMock = jest.mocked(getApiRemindersPetPetId);
const analysisMock = jest.mocked(getApiPetsPetIdNutritionSummaryAnalysis);
const runAnalysisMock = jest.mocked(postApiPetsPetIdNutritionSummaryAnalysis);
const onOpenWeightHistory = jest.fn();
const onOpenAnalysis = jest.fn();
const onOpenSchedule = jest.fn();

const PET_ID = "pet-1";

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

// What the API returns for a pet with a goal and two of three meals logged.
// The cast is test-only: the generated DTOs mark almost every field optional.
const GOAL_SUMMARY = {
  mealCount: 2,
  totalCalories: 192,
  goal: { dailyCalorieTarget: 420, mealsPerDay: 3 },
  comparison: { caloriesRemaining: 228 },
  portionTotalsByUnit: [{ unit: PortionUnit.Gram, totalAmount: 93 }],
} as unknown as Awaited<ReturnType<typeof getApiPetsPetIdNutritionSummary>>["data"];

const EMPTY_SUMMARY = { mealCount: 0, totalCalories: 0 } as unknown as typeof GOAL_SUMMARY;

// Midnight today: always "today", and never in the future for the form's own check.
const TODAY_LOG = {
  id: "log-1",
  petId: PET_ID,
  fedAt: dayjs().startOf("day").toISOString(),
  foodType: FoodType.DryFood,
  foodName: "Royal Canin Renal",
  portionAmount: 85,
  portionUnit: PortionUnit.Gram,
  approxCalories: 170,
};

const clients: QueryClient[] = [];

const renderTab = () => {
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

  return render(
    <FeedingTabContent
      petId={PET_ID}
      onSeeAllMeals={jest.fn()}
      onOpenAnalysis={onOpenAnalysis}
      onOpenSchedule={onOpenSchedule}
      onOpenWeightHistory={onOpenWeightHistory}
    />,
    {
      wrapper,
    }
  );
};

beforeEach(() => {
  jest.resetAllMocks();
  summaryMock.mockResolvedValue(apiResponse(GOAL_SUMMARY));
  logsMock.mockResolvedValue(apiResponse([TODAY_LOG]));
  occurrencesMock.mockResolvedValue(apiResponse([]));
  weightMock.mockResolvedValue(apiResponse([]));
  analysisMock.mockResolvedValue(apiResponse({ latest: null, previous: null }));
  remindersMock.mockResolvedValue(apiResponse([]));
});

afterEach(() => {
  onlineManager.setOnline(true);
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

// Several blocks can offer the same action; blocks render top to bottom.
const findNthByText = async (screen: ReturnType<typeof renderTab>, text: string, index: number) => {
  const matches = await screen.findAllByText(text);
  const match = matches[index];
  if (!match) throw new Error(`Expected at least ${index + 1} elements with text "${text}"`);
  return match;
};

describe("FeedingTabContent", () => {
  it("shows the day's progress and the logged meal for a pet with a goal", async () => {
    const screen = renderTab();

    expect(await screen.findByText("/ 420 kcal")).toBeTruthy();
    expect(screen.getByText("192")).toBeTruthy();
    expect(screen.getByText("46%")).toBeTruthy();
    expect(screen.getByText("Royal Canin Renal")).toBeTruthy();
    expect(screen.getByText("Dry food · 85 g · 170 kcal")).toBeTruthy();
  });

  it("draws the week chart once something is logged", async () => {
    const screen = renderTab();

    expect(await screen.findByText("Last 7 days")).toBeTruthy();
    expect(await screen.findByLabelText("Today, 192 kcal")).toBeTruthy();
    expect(screen.getByText("avg 192 kcal")).toBeTruthy();
    expect(screen.getByText("54% below goal")).toBeTruthy();
  });

  it("invites a goal and a first meal, and draws no chart, for a pet with nothing yet", async () => {
    summaryMock.mockResolvedValue(apiResponse(EMPTY_SUMMARY));
    logsMock.mockResolvedValue(apiResponse([]));
    const screen = renderTab();

    expect(await screen.findByText("Set a daily goal to track calories and portions")).toBeTruthy();
    expect(screen.getByText("No meals logged today")).toBeTruthy();
    expect(screen.queryByText("Last 7 days")).toBeNull();
  });

  it("counts meals when none of today's meals has calories", async () => {
    summaryMock.mockResolvedValue(
      apiResponse({
        mealCount: 2,
        totalCalories: 0,
        goal: { dailyCalorieTarget: 420, mealsPerDay: 3 },
      } as unknown as typeof GOAL_SUMMARY)
    );
    const screen = renderTab();

    expect(await screen.findByText("/ 3 meals")).toBeTruthy();
    expect(screen.queryByText("/ 420 kcal")).toBeNull();
  });

  it("shows meals against their daily count, and what is left of the calories", async () => {
    const screen = renderTab();

    expect(await screen.findByText("2 / 3")).toBeTruthy();
    expect(screen.getByText("93 g")).toBeTruthy();
    expect(screen.getByText("228 kcal")).toBeTruthy();
  });

  it("shows only the total, with no percentage or remainder, for a pet with meals but no goal", async () => {
    summaryMock.mockResolvedValue(
      apiResponse({ mealCount: 2, totalCalories: 192 } as unknown as typeof GOAL_SUMMARY)
    );
    const screen = renderTab();

    expect(await screen.findByText("kcal logged")).toBeTruthy();
    expect(screen.queryByText(/^\d+%$/)).toBeNull();
    expect(screen.queryByText("2 / 3")).toBeNull();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows a goal with nothing logged yet, in calories rather than meals", async () => {
    summaryMock.mockResolvedValue(
      apiResponse({
        mealCount: 0,
        totalCalories: 0,
        goal: { dailyCalorieTarget: 420, mealsPerDay: 3 },
      } as unknown as typeof GOAL_SUMMARY)
    );
    logsMock.mockResolvedValue(apiResponse([]));
    const screen = renderTab();

    expect(await screen.findByText("/ 420 kcal")).toBeTruthy();
    expect(screen.queryByText("/ 3 meals")).toBeNull();
  });

  it("draws no progress against a zero target, rather than dividing by it", async () => {
    summaryMock.mockResolvedValue(
      apiResponse({
        mealCount: 1,
        totalCalories: 192,
        goal: { dailyCalorieTarget: 0 },
      } as unknown as typeof GOAL_SUMMARY)
    );
    const screen = renderTab();

    expect(await screen.findByText("/ 0 kcal")).toBeTruthy();
    expect(screen.queryByText(/Infinity|NaN/)).toBeNull();
    expect(screen.queryByText(/^\d+%$/)).toBeNull();
  });

  describe("when a request fails", () => {
    it("says the summary could not load, instead of asking for a goal the pet may have", async () => {
      summaryMock.mockImplementation(() => Promise.reject(new Error("network")));
      const screen = renderTab();

      expect(await screen.findByText("We could not load today’s summary")).toBeTruthy();
      expect(screen.queryByText("Set a daily goal to track calories and portions")).toBeNull();
    });

    it("asks the server again when the user taps Try again", async () => {
      summaryMock.mockImplementationOnce(() => Promise.reject(new Error("network")));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Try again"));

      expect(await screen.findByText("/ 420 kcal")).toBeTruthy();
      expect(screen.queryByText("We could not load today’s summary")).toBeNull();
    });

    it("says the meals could not load, instead of claiming none were logged", async () => {
      logsMock.mockImplementation(() => Promise.reject(new Error("network")));
      const screen = renderTab();

      expect(await screen.findByText("We could not load the meals")).toBeTruthy();
      expect(screen.queryByText("No meals logged today")).toBeNull();
    });

    it("treats being offline with nothing cached as a failure, not an empty day", async () => {
      onlineManager.setOnline(false);
      const screen = renderTab();

      expect(await screen.findByText("We could not load today’s summary")).toBeTruthy();
      expect(screen.queryByText("Set a daily goal to track calories and portions")).toBeNull();
    });
  });

  describe("editing the goal while the summary is unknown", () => {
    it("offers no Edit goal while the summary loads, so a blank form cannot clear the goal", async () => {
      summaryMock.mockImplementation(() => new Promise(() => undefined));
      const screen = renderTab();

      await screen.findByText("Royal Canin Renal");
      expect(screen.queryByText("Edit goal")).toBeNull();
    });

    it("offers no Edit goal after the summary failed to load", async () => {
      summaryMock.mockImplementation(() => Promise.reject(new Error("network")));
      const screen = renderTab();

      await screen.findByText("We could not load today’s summary");
      expect(screen.queryByText("Edit goal")).toBeNull();
    });
  });

  describe("logging and editing a meal", () => {
    it("opens an empty Log meal form from the empty state", async () => {
      logsMock.mockResolvedValue(apiResponse([]));
      const screen = renderTab();

      fireEvent.press(await findNthByText(screen, "Log meal", 0));

      expect(await screen.findByTestId("drawer")).toBeTruthy();
      expect(screen.getByTestId("drawer-title")).toHaveTextContent("Log meal");
    });

    it("offers Edit and Delete on a logged meal", async () => {
      const screen = renderTab();

      expect(await screen.findByText("Edit")).toBeTruthy();
      expect(screen.getByText("Delete")).toBeTruthy();
    });

    it("opens the meal in the editor with its values filled in when Edit is chosen", async () => {
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Edit"));

      await waitFor(() =>
        expect(screen.getByTestId("drawer-title")).toHaveTextContent("Edit meal")
      );
      expect(screen.getByDisplayValue("Royal Canin Renal")).toBeTruthy();
      expect(screen.getByDisplayValue("85")).toBeTruthy();
      expect(screen.getByDisplayValue("170")).toBeTruthy();
    });

    it("asks before deleting, naming the meal, and deletes nothing yet", async () => {
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Delete"));

      expect(await screen.findByText("Delete this meal?")).toBeTruthy();
      expect(
        screen.getByText("Royal Canin Renal will be removed from the feeding log.")
      ).toBeTruthy();
      expect(deleteMock).not.toHaveBeenCalled();
    });

    it("deletes that meal once the user confirms", async () => {
      deleteMock.mockResolvedValue(apiResponse(undefined));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Delete"));
      const dialog = await screen.findByTestId("dialog");
      fireEvent.press(within(dialog).getByText("Delete"));

      await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(PET_ID, "log-1"));
    });
  });

  describe("the daily goal", () => {
    it("opens the goal form, filled with the current goal, from Edit goal", async () => {
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Edit goal"));

      expect(await screen.findByTestId("drawer-title")).toHaveTextContent("Daily goal");
      expect(screen.getByDisplayValue("420")).toBeTruthy();
      expect(screen.getByDisplayValue("3")).toBeTruthy();
    });

    it("opens the same form when the Today card itself is tapped", async () => {
      const screen = renderTab();

      fireEvent.press(await screen.findByText("/ 420 kcal"));

      expect(await screen.findByTestId("drawer-title")).toHaveTextContent("Daily goal");
    });

    it("opens an empty goal form from the empty state, with nothing to remove", async () => {
      summaryMock.mockResolvedValue(apiResponse(EMPTY_SUMMARY));
      logsMock.mockResolvedValue(apiResponse([]));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Set daily goal"));

      expect(await screen.findByTestId("drawer-title")).toHaveTextContent("Daily goal");
      expect(screen.queryByText("Remove goal")).toBeNull();
    });

    it("asks before removing the goal, and removes it once confirmed", async () => {
      deleteGoalMock.mockResolvedValue(apiResponse(undefined));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Edit goal"));
      fireEvent.press(await screen.findByText("Remove goal"));

      expect(await screen.findByText("Remove the daily goal?")).toBeTruthy();
      expect(deleteGoalMock).not.toHaveBeenCalled();

      fireEvent.press(within(await screen.findByTestId("dialog")).getByText("Delete"));

      await waitFor(() => expect(deleteGoalMock).toHaveBeenCalledWith(PET_ID));
      await waitFor(() =>
        expect(jest.mocked(Toast.show)).toHaveBeenCalledWith({
          type: "success",
          text1: "Goal removed",
        })
      );
    });
  });

  describe("the weight card", () => {
    // Numbers arrive as strings from this API as often as not.
    const weighed = (weightKg: string, measuredAt: string) =>
      ({ id: measuredAt, petId: PET_ID, weightKg, measuredAt }) as unknown as Awaited<
        ReturnType<typeof getApiPetsPetIdWeightHistory>
      >["data"][number];

    it("shows the latest weight and how it changed since the measurement before", async () => {
      weightMock.mockResolvedValue(
        apiResponse([
          weighed("4.1", "2026-10-09T09:00:00.000Z"),
          weighed("4.3", "2026-08-28T09:00:00.000Z"),
        ])
      );
      const screen = renderTab();

      expect(await screen.findByText("4.1 kg")).toBeTruthy();
      expect(screen.getByText("−0.2 kg since Aug 28")).toBeTruthy();
    });

    it("shows only the value when there is a single measurement, with nothing to compare", async () => {
      weightMock.mockResolvedValue(apiResponse([weighed("4.1", "2026-10-09T09:00:00.000Z")]));
      const screen = renderTab();

      expect(await screen.findByText("4.1 kg")).toBeTruthy();
      expect(screen.queryByText(/since/)).toBeNull();
    });

    it("opens the history screen from History", async () => {
      weightMock.mockResolvedValue(apiResponse([weighed("4.1", "2026-10-09T09:00:00.000Z")]));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("History"));

      expect(onOpenWeightHistory).toHaveBeenCalledTimes(1);
    });

    it("invites a first entry when nothing was weighed, and opens the weight form", async () => {
      const screen = renderTab();

      expect(await screen.findByText("No weight entries yet")).toBeTruthy();
      fireEvent.press(screen.getByText("Log weight"));

      expect(await screen.findByTestId("drawer-title")).toHaveTextContent("Log weight");
    });

    it("says the history could not load, instead of claiming nothing was weighed", async () => {
      weightMock.mockImplementation(() => Promise.reject(new Error("network")));
      const screen = renderTab();

      expect(await screen.findByText("We could not load the weight history")).toBeTruthy();
      expect(screen.queryByText("No weight entries yet")).toBeNull();
    });
  });

  describe("the nutrition analysis", () => {
    const verdict = (createdAt: string) =>
      ({
        id: "analysis-1",
        petId: PET_ID,
        date: dayjs().format("YYYY-MM-DD"),
        status: "OnTarget",
        targetCalories: "420.00",
        actualCalories: "405.00",
        deviationPct: "-3.57",
        mealCount: 3,
        createdAt,
      }) as unknown as NonNullable<
        Awaited<ReturnType<typeof getApiPetsPetIdNutritionSummaryAnalysis>>["data"]["latest"]
      >;

    const respondWith = (latest: ReturnType<typeof verdict> | null) =>
      analysisMock.mockResolvedValue(apiResponse({ latest, previous: null }));

    const failWith = (status: number, data: object) =>
      runAnalysisMock.mockImplementation(() =>
        Promise.reject(
          new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, {
            ...apiResponse(data),
            status,
          })
        )
      );

    const goalSummary = (goal: object) =>
      apiResponse({
        ...GOAL_SUMMARY,
        goal: { createdAt: dayjs().subtract(3, "day").toISOString(), ...goal },
      });

    it("shows the verdict against the goal, with the deviation signed", async () => {
      summaryMock.mockResolvedValue(goalSummary({ dailyCalorieTarget: 420, mealsPerDay: 3 }));
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      const screen = renderTab();

      expect(await screen.findByText("On target")).toBeTruthy();
      expect(screen.getByText("405")).toBeTruthy();
      expect(screen.getByText("of 420 kcal/day goal · −4%")).toBeTruthy();
      expect(screen.getByText(`${dayjs().format("MMM D")} · 3 meals logged`)).toBeTruthy();
    });

    describe("when the target cannot be proven to come from the goal", () => {
      const expectNeutral = async (screen: ReturnType<typeof renderTab>) => {
        expect(await screen.findByText("of 420 kcal/day target · −4%")).toBeTruthy();
        expect(screen.queryByText(/goal · /)).toBeNull();
      };

      it("says 'target', not 'goal', when the pet has no goal", async () => {
        summaryMock.mockResolvedValue(apiResponse(EMPTY_SUMMARY));
        respondWith(verdict(dayjs().add(1, "hour").toISOString()));

        await expectNeutral(renderTab());
      });

      it("says 'target' when the goal has no calorie target", async () => {
        summaryMock.mockResolvedValue(goalSummary({ mealsPerDay: 3 }));
        respondWith(verdict(dayjs().add(1, "hour").toISOString()));

        await expectNeutral(renderTab());
      });

      it("says 'target' when the goal carries no timestamps to compare with the run", async () => {
        summaryMock.mockResolvedValue(apiResponse(GOAL_SUMMARY));
        respondWith(verdict(dayjs().add(1, "hour").toISOString()));

        await expectNeutral(renderTab());
      });

      it("says 'target' when the goal was changed after the run", async () => {
        summaryMock.mockResolvedValue(
          goalSummary({ dailyCalorieTarget: 420, updatedAt: dayjs().add(2, "hour").toISOString() })
        );
        respondWith(verdict(dayjs().add(1, "hour").toISOString()));

        await expectNeutral(renderTab());
      });

      it("says 'target' when the goal's target differs from the one the run used", async () => {
        summaryMock.mockResolvedValue(goalSummary({ dailyCalorieTarget: 500 }));
        respondWith(verdict(dayjs().add(1, "hour").toISOString()));

        await expectNeutral(renderTab());
      });

      it("says 'target' while the summary has not loaded", async () => {
        summaryMock.mockImplementation(() => new Promise(() => undefined));
        respondWith(verdict(dayjs().add(1, "hour").toISOString()));

        await expectNeutral(renderTab());
      });
    });

    it("opens the analysis screen from the card", async () => {
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      const screen = renderTab();

      fireEvent.press(await screen.findByLabelText("Open nutrition analysis"));

      expect(onOpenAnalysis).toHaveBeenCalledTimes(1);
    });

    it("blocks a repeat run while no meal was logged since the last verdict", async () => {
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      expect(
        await screen.findByText(/add or edit a meal, or change the goal, to run again/)
      ).toBeTruthy();
      expect(runAnalysisMock).not.toHaveBeenCalled();
    });

    it("runs a new analysis once a meal was logged after the last verdict", async () => {
      logsMock.mockResolvedValue(
        apiResponse([{ ...TODAY_LOG, createdAt: dayjs().add(2, "hour").toISOString() }])
      );
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      runAnalysisMock.mockResolvedValue(apiResponse(verdict(dayjs().add(3, "hour").toISOString())));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      await waitFor(() => expect(runAnalysisMock).toHaveBeenCalledTimes(1));
      expect(screen.queryByText(/add or edit a meal, or change the goal, to run again/)).toBeNull();
    });

    it("runs a new analysis once the goal was changed after the last verdict", async () => {
      summaryMock.mockResolvedValue(
        apiResponse({
          ...GOAL_SUMMARY,
          goal: {
            ...GOAL_SUMMARY.goal,
            createdAt: dayjs().subtract(3, "day").toISOString(),
            updatedAt: dayjs().add(2, "hour").toISOString(),
          },
        })
      );
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      runAnalysisMock.mockResolvedValue(apiResponse(verdict(dayjs().add(3, "hour").toISOString())));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      await waitFor(() => expect(runAnalysisMock).toHaveBeenCalledTimes(1));
    });

    it("keeps a repeat run blocked when the goal was last changed before the verdict", async () => {
      summaryMock.mockResolvedValue(
        apiResponse({
          ...GOAL_SUMMARY,
          goal: {
            ...GOAL_SUMMARY.goal,
            createdAt: dayjs().subtract(3, "day").toISOString(),
            updatedAt: dayjs().subtract(1, "hour").toISOString(),
          },
        })
      );
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      expect(
        await screen.findByText(/add or edit a meal, or change the goal, to run again/)
      ).toBeTruthy();
      expect(runAnalysisMock).not.toHaveBeenCalled();
    });

    it("invites a first analysis when none was run, and runs it", async () => {
      runAnalysisMock.mockResolvedValue(apiResponse(verdict(dayjs().toISOString())));
      const screen = renderTab();

      await screen.findByText("Run analysis");
      expect(screen.queryByText("Analysing today’s intake…")).toBeNull();

      fireEvent.press(await screen.findByText("Run analysis"));

      await waitFor(() => expect(runAnalysisMock).toHaveBeenCalledTimes(1));
      expect(runAnalysisMock.mock.calls[0]?.[0]).toBe(PET_ID);
    });

    it("asks for a meal instead of analysing a day with none, and opens the meal form", async () => {
      logsMock.mockResolvedValue(apiResponse([]));
      const screen = renderTab();

      expect(
        await screen.findByText("Log a meal to run an AI check of today’s intake")
      ).toBeTruthy();
      expect(screen.queryByText("Run analysis")).toBeNull();
      expect(runAnalysisMock).not.toHaveBeenCalled();

      fireEvent.press(await findNthByText(screen, "Log meal", 1));

      expect(await screen.findByTestId("drawer")).toBeTruthy();
    });

    it("asks for calories instead of analysing meals that have none, and does not run", async () => {
      logsMock.mockResolvedValue(apiResponse([{ ...TODAY_LOG, approxCalories: null }]));
      const screen = renderTab();

      expect(
        await screen.findByText("Add calories to all of today’s meals to run an AI check")
      ).toBeTruthy();
      expect(screen.queryByText("Run analysis")).toBeNull();
      expect(runAnalysisMock).not.toHaveBeenCalled();
    });

    it("blocks a repeat run, and says why, when today's meals carry no calories", async () => {
      logsMock.mockResolvedValue(
        apiResponse([
          { ...TODAY_LOG, approxCalories: null, createdAt: dayjs().add(2, "hour").toISOString() },
        ])
      );
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      expect(
        await screen.findByText("Add calories to all of today’s meals to run again")
      ).toBeTruthy();
      expect(runAnalysisMock).not.toHaveBeenCalled();
    });

    it("asks for calories while only some of today's meals have them", async () => {
      logsMock.mockResolvedValue(
        apiResponse([TODAY_LOG, { ...TODAY_LOG, id: "log-2", approxCalories: null }])
      );
      const screen = renderTab();

      expect(
        await screen.findByText("Add calories to all of today’s meals to run an AI check")
      ).toBeTruthy();
      expect(screen.queryByText("Run analysis")).toBeNull();
      expect(runAnalysisMock).not.toHaveBeenCalled();
    });

    it("runs when every meal has calories, a stored 0 included", async () => {
      logsMock.mockResolvedValue(
        apiResponse([TODAY_LOG, { ...TODAY_LOG, id: "log-2", approxCalories: 0 }])
      );
      runAnalysisMock.mockResolvedValue(apiResponse(verdict(dayjs().toISOString())));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run analysis"));

      await waitFor(() => expect(runAnalysisMock).toHaveBeenCalledTimes(1));
    });

    it("blocks a new run when the last verdict is from another day and today has no meal", async () => {
      logsMock.mockResolvedValue(
        apiResponse([{ ...TODAY_LOG, fedAt: dayjs().subtract(2, "day").toISOString() }])
      );
      respondWith({
        ...verdict(dayjs().subtract(1, "day").toISOString()),
        date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
      });
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      expect(
        await screen.findByText(/add or edit a meal, or change the goal, to run again/)
      ).toBeTruthy();
      expect(runAnalysisMock).not.toHaveBeenCalled();
    });

    it("says when the service is rate-limited, and how long to wait", async () => {
      failWith(429, { retryAfterSeconds: 30 });
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run analysis"));

      expect(await screen.findByText("Analysis failed")).toBeTruthy();
      expect(screen.getByText("Too many requests. Try again in 30 seconds.")).toBeTruthy();
      expect(
        screen.getByText("Nothing was lost — please wait about 30 seconds before trying again")
      ).toBeTruthy();
    });

    it("offers no retry for a failure that would repeat identically", async () => {
      failWith(400, { code: "something_unknown", retryable: false });
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run analysis"));

      expect(await screen.findByText("Analysis failed")).toBeTruthy();
      expect(screen.queryByText("Try again")).toBeNull();
    });

    it("lets the user dismiss a failure that cannot be retried, bringing back the first-run invitation", async () => {
      failWith(400, { code: "something_unknown", retryable: false });
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run analysis"));
      fireEvent.press(await screen.findByText("Dismiss"));

      await waitFor(() => expect(screen.queryByText("Analysis failed")).toBeNull());
      expect(await screen.findByText("Run analysis")).toBeTruthy();
    });

    it("keeps the last verdict and its Run button under a failure that cannot be retried", async () => {
      logsMock.mockResolvedValue(
        apiResponse([{ ...TODAY_LOG, createdAt: dayjs().add(2, "hour").toISOString() }])
      );
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      failWith(400, { code: "something_unknown", retryable: false });
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      expect(await screen.findByText("Analysis failed")).toBeTruthy();
      expect(screen.getByText("On target")).toBeTruthy();
      expect(screen.getByText("Run new analysis")).toBeTruthy();
    });

    it("shows the progress card while a first analysis is under way", async () => {
      runAnalysisMock.mockImplementation(() => new Promise(() => undefined));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run analysis"));

      expect(await screen.findByText("Analysing today’s intake…")).toBeTruthy();
    });

    it("keeps the old verdict on screen, with no progress card, while a repeat run is under way", async () => {
      logsMock.mockResolvedValue(
        apiResponse([{ ...TODAY_LOG, createdAt: dayjs().add(2, "hour").toISOString() }])
      );
      respondWith(verdict(dayjs().add(1, "hour").toISOString()));
      runAnalysisMock.mockImplementation(() => new Promise(() => undefined));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      await waitFor(() => expect(runAnalysisMock).toHaveBeenCalledTimes(1));
      expect(screen.queryByText("Analysing today’s intake…")).toBeNull();
      expect(screen.getByText("On target")).toBeTruthy();
    });

    it("lets a verdict from another day be run again as soon as today has a meal with calories", async () => {
      respondWith({
        ...verdict(dayjs().add(1, "hour").toISOString()),
        date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
      });
      runAnalysisMock.mockResolvedValue(apiResponse(verdict(dayjs().add(3, "hour").toISOString())));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Run new analysis"));

      await waitFor(() => expect(runAnalysisMock).toHaveBeenCalledTimes(1));
    });

    it("says the analysis could not load, instead of offering a first run", async () => {
      analysisMock.mockImplementation(() => Promise.reject(new Error("network")));
      const screen = renderTab();

      expect(await screen.findByText("We could not load the analysis")).toBeTruthy();
      expect(screen.queryByText("Run analysis")).toBeNull();
    });
  });

  describe("the feeding schedule", () => {
    const reminder = (type: ReminderType, status: ReminderStatus) =>
      ({
        id: `${type}-${status}-${Math.random()}`,
        petId: PET_ID,
        type,
        status,
      }) as unknown as Awaited<ReturnType<typeof getApiRemindersPetPetId>>["data"][number];

    it("counts only the active Feeding reminders as meals a day", async () => {
      remindersMock.mockResolvedValue(
        apiResponse([
          reminder(ReminderType.Feeding, ReminderStatus.Active),
          reminder(ReminderType.Feeding, ReminderStatus.Active),
          reminder(ReminderType.Feeding, ReminderStatus.Cancelled),
          reminder(ReminderType.Medication, ReminderStatus.Active),
        ])
      );
      const screen = renderTab();

      expect(await screen.findByText("2 meals a day")).toBeTruthy();
    });

    it("says 'meal' for a single reminder", async () => {
      remindersMock.mockResolvedValue(
        apiResponse([reminder(ReminderType.Feeding, ReminderStatus.Active)])
      );
      const screen = renderTab();

      expect(await screen.findByText("1 meal a day")).toBeTruthy();
    });

    it("opens the reminders when the schedule card is tapped", async () => {
      remindersMock.mockResolvedValue(
        apiResponse([reminder(ReminderType.Feeding, ReminderStatus.Active)])
      );
      const screen = renderTab();

      fireEvent.press(await screen.findByLabelText("Feeding schedule"));

      expect(onOpenSchedule).toHaveBeenCalledTimes(1);
    });

    it("invites a schedule when there is no Feeding reminder, and opens the reminders", async () => {
      remindersMock.mockResolvedValue(
        apiResponse([reminder(ReminderType.Medication, ReminderStatus.Active)])
      );
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Set up schedule"));

      expect(onOpenSchedule).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/meals? a day/)).toBeNull();
    });

    it("says the schedule could not load, instead of claiming there is none", async () => {
      remindersMock.mockImplementation(() => Promise.reject(new Error("network")));
      const screen = renderTab();

      expect(await screen.findByText("We could not load the feeding schedule")).toBeTruthy();
      expect(screen.queryByText("No feeding schedule yet")).toBeNull();
    });
  });

  describe("the schedule slots in the meals list", () => {
    const missedSlot = {
      reminderId: "reminder-1",
      petId: PET_ID,
      title: "Dinner",
      type: ReminderType.Feeding,
      scheduledFor: dayjs().startOf("day").toISOString(),
      isOverdue: true,
    } as unknown as Awaited<ReturnType<typeof getApiRemindersOccurrences>>["data"][number];

    it("opens the meal form when a missed slot in the list is tapped", async () => {
      logsMock.mockResolvedValue(apiResponse([]));
      occurrencesMock.mockResolvedValue(apiResponse([missedSlot]));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Dinner"));

      expect(await screen.findByTestId("drawer-title")).toHaveTextContent("Log meal");
    });

    it("records a missed slot at its own time, not at the moment it is tapped", async () => {
      logsMock.mockResolvedValue(apiResponse([]));
      occurrencesMock.mockResolvedValue(apiResponse([missedSlot]));
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Dinner"));

      expect(within(await screen.findByTestId("drawer")).getByText("00:00")).toBeTruthy();
    });

    it("records an upcoming slot as eaten now, not at its planned time", async () => {
      logsMock.mockResolvedValue(apiResponse([]));
      occurrencesMock.mockResolvedValue(
        apiResponse([
          {
            ...missedSlot,
            title: "Supper",
            scheduledFor: dayjs().endOf("day").toISOString(),
            isOverdue: false,
          },
        ])
      );
      const screen = renderTab();

      fireEvent.press(await screen.findByText("Supper"));

      const drawer = await screen.findByTestId("drawer");
      expect(within(drawer).queryByText("23:59")).toBeNull();
    });

    it("labels a slot as missed or upcoming, and a logged meal as neither", async () => {
      const upcomingSlot = {
        ...missedSlot,
        reminderId: "reminder-2",
        title: "Supper",
        scheduledFor: dayjs().endOf("day").toISOString(),
        isOverdue: false,
      };
      occurrencesMock.mockResolvedValue(apiResponse([missedSlot, upcomingSlot]));
      const screen = renderTab();

      expect(await screen.findByText("Supper")).toBeTruthy();
      expect(screen.getByText("Missed")).toBeTruthy();
      expect(screen.getByText("Upcoming")).toBeTruthy();
      expect(screen.getAllByText("Missed")).toHaveLength(1);
      expect(screen.getAllByText("Upcoming")).toHaveLength(1);
    });
  });
});
