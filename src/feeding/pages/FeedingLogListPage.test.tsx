/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";
import dayjs from "dayjs";
import i18next from "i18next";

import { FoodType } from "@/api/generated";
import enCommon from "@/common/locales/en.json";

import enFeeding from "../locales/en.json";

const PET_ID = "11111111-1111-4111-8111-111111111111";

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
  getApiRemindersOccurrences: jest.fn(),
  deleteApiPetsPetIdFeedingLogsLogId: jest.fn(),
  postApiPetsPetIdFeedingLogs: jest.fn(),
  patchApiPetsPetIdFeedingLogsLogId: jest.fn(),
}));

import { Redirect, useLocalSearchParams } from "expo-router";

import {
  deleteApiPetsPetIdFeedingLogsLogId,
  getApiPetsId,
  getApiPetsPetIdFeedingLogs,
  getApiRemindersOccurrences,
} from "@/api";

import FeedingLogListPage from "./FeedingLogListPage";

const petMock = jest.mocked(getApiPetsId);
const logsMock = jest.mocked(getApiPetsPetIdFeedingLogs);
const occurrencesMock = jest.mocked(getApiRemindersOccurrences);
const deleteMock = jest.mocked(deleteApiPetsPetIdFeedingLogsLogId);

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

const meal = (id: string, foodName: string, foodType: FoodType, fedAt: string, calories: number) =>
  ({
    id,
    petId: PET_ID,
    foodName,
    foodType,
    fedAt,
    approxCalories: calories,
  }) as unknown as Awaited<ReturnType<typeof getApiPetsPetIdFeedingLogs>>["data"][number];

// Midnight keeps "today" and "yesterday" stable whatever time the suite runs.
const TODAY = dayjs().startOf("day").toISOString();
const YESTERDAY = dayjs().subtract(1, "day").startOf("day").toISOString();

const clients: QueryClient[] = [];

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
  return render(<FeedingLogListPage />, { wrapper });
};

const deleteItem = (screen: ReturnType<typeof renderPage>, index: number) => {
  const item = screen.getAllByText("Delete").at(index);
  if (!item) throw new Error(`No Delete item at ${index}`);
  return item;
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({ petId: PET_ID });
  jest.mocked(Redirect).mockReturnValue(null);
  petMock.mockResolvedValue(apiResponse({ id: PET_ID, name: "Miso" }));
  occurrencesMock.mockResolvedValue(apiResponse([]));
  logsMock.mockResolvedValue(
    apiResponse([
      meal("log-dry", "Royal Canin", FoodType.DryFood, TODAY, 170),
      meal("log-treat", "Renal treats", FoodType.Treat, TODAY, 22),
      meal("log-wet", "Renal wet", FoodType.WetFood, YESTERDAY, 95),
    ])
  );
});

afterEach(() => {
  onlineManager.setOnline(true);
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("FeedingLogListPage", () => {
  it("groups meals by day, newest day first, with each day's calories", async () => {
    const screen = renderPage();

    expect(await screen.findByText("Today · 192 kcal")).toBeTruthy();
    expect(screen.getByText("Yesterday · 95 kcal")).toBeTruthy();
    expect(screen.getByText("Royal Canin")).toBeTruthy();
    expect(screen.getByText("Renal wet")).toBeTruthy();
  });

  it("narrows the list to one food type, and brings everything back on All", async () => {
    const screen = renderPage();
    await screen.findByText("Royal Canin");

    fireEvent.press(screen.getByText("Wet food"));

    expect(screen.getByText("Renal wet")).toBeTruthy();
    expect(screen.queryByText("Royal Canin")).toBeNull();
    expect(screen.queryByText("Renal treats")).toBeNull();

    fireEvent.press(screen.getByText("All"));

    expect(screen.getByText("Royal Canin")).toBeTruthy();
  });

  it("offers to clear a filter that matches nothing, instead of claiming no meals exist", async () => {
    const screen = renderPage();
    await screen.findByText("Royal Canin");

    fireEvent.press(screen.getByText("Supplement"));

    expect(screen.getByText("No meals of this type")).toBeTruthy();
    expect(screen.queryByText("No meals logged today")).toBeNull();
    fireEvent.press(screen.getByText("Show all"));
    expect(screen.getByText("Royal Canin")).toBeTruthy();
  });

  it("deletes exactly the chosen meal, after a confirmation naming it", async () => {
    deleteMock.mockResolvedValue(apiResponse(undefined));
    const screen = renderPage();
    await screen.findByText("Renal wet");

    fireEvent.press(deleteItem(screen, 2));

    expect(deleteMock).not.toHaveBeenCalled();
    expect(await screen.findByText("Renal wet will be removed from the feeding log.")).toBeTruthy();

    fireEvent.press(deleteItem(screen, -1));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(PET_ID, "log-wet"));
  });

  it("invites a first meal when nothing was ever logged", async () => {
    logsMock.mockResolvedValue(apiResponse([]));
    const screen = renderPage();

    expect(await screen.findByText("No meals logged today")).toBeTruthy();
  });

  it("does not claim an empty log when the request failed", async () => {
    logsMock.mockImplementation(() => Promise.reject(new Error("network")));
    const screen = renderPage();

    expect(await screen.findByText("Something went wrong")).toBeTruthy();
    expect(screen.queryByText("No meals logged today")).toBeNull();
  });

  it("sends a deep link with a bad pet id back to the pets list, fetching nothing", () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ petId: "not-a-uuid" });

    renderPage();

    expect(jest.mocked(Redirect).mock.calls[0]?.[0]).toEqual({ href: "/(tabs)/pets" });
    expect(logsMock).not.toHaveBeenCalled();
  });
});
