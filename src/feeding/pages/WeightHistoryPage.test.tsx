/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import Toast from "react-native-toast-message";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";
import i18next from "i18next";

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
  getApiPetsPetIdWeightHistory: jest.fn(),
  deleteApiPetsPetIdWeightHistoryWeightLogId: jest.fn(),
  postApiPetsPetIdWeightHistory: jest.fn(),
  patchApiPetsPetIdWeightHistoryWeightLogId: jest.fn(),
}));

import { Redirect, useLocalSearchParams } from "expo-router";

import {
  deleteApiPetsPetIdWeightHistoryWeightLogId,
  getApiPetsId,
  getApiPetsPetIdWeightHistory,
} from "@/api";

import WeightHistoryPage from "./WeightHistoryPage";

const petMock = jest.mocked(getApiPetsId);
const weightMock = jest.mocked(getApiPetsPetIdWeightHistory);
const deleteMock = jest.mocked(deleteApiPetsPetIdWeightHistoryWeightLogId);

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

// Numbers arrive as strings from this API as often as not.
const weighed = (id: string, weightKg: string, measuredAt: string) =>
  ({ id, petId: PET_ID, weightKg, measuredAt }) as unknown as Awaited<
    ReturnType<typeof getApiPetsPetIdWeightHistory>
  >["data"][number];

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
  return render(<WeightHistoryPage />, { wrapper });
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
  weightMock.mockResolvedValue(
    apiResponse([
      weighed("w-new", "4.1", "2026-10-09T09:00:00.000Z"),
      weighed("w-old", "4.3", "2026-09-01T09:00:00.000Z"),
    ])
  );
});

afterEach(() => {
  onlineManager.setOnline(true);
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("WeightHistoryPage", () => {
  it("lists the entries newest first, with the change over the period", async () => {
    const screen = renderPage();

    await screen.findByText("Oct 09, 2026");
    const dates = screen.getAllByText(/^[A-Z][a-z]{2} \d{2}, \d{4}$/);
    expect(dates.map((node) => node.props.children)).toEqual(["Oct 09, 2026", "Sep 01, 2026"]);
    expect(screen.getByText("−0.2 kg in 3 months")).toBeTruthy();
    expect(screen.getByText("Miso")).toBeTruthy();
  });

  it("asks for the chosen period from the server, not the whole history", async () => {
    const screen = renderPage();
    await screen.findByText("Oct 09, 2026");
    weightMock.mockClear();

    fireEvent.press(screen.getByText("1 year"));

    await waitFor(() => expect(weightMock).toHaveBeenCalledTimes(1));
    const [, params] = weightMock.mock.calls[0] ?? [];
    const spanDays = (Date.parse(params?.to ?? "") - Date.parse(params?.from ?? "")) / 86_400_000;
    expect(Math.round(spanDays)).toBeGreaterThanOrEqual(365);
    // Let the answer land before the test ends, or its update arrives unwrapped in the next one.
    await screen.findByText("Oct 09, 2026");
  });

  it("deletes exactly the chosen entry, after a confirmation", async () => {
    deleteMock.mockResolvedValue(apiResponse(undefined));
    const screen = renderPage();
    await screen.findByText("Oct 09, 2026");

    fireEvent.press(deleteItem(screen, 1));

    expect(deleteMock).not.toHaveBeenCalled();
    expect(await screen.findByText("Delete this entry?")).toBeTruthy();

    fireEvent.press(deleteItem(screen, -1));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith(PET_ID, "w-old"));
    await waitFor(() =>
      expect(jest.mocked(Toast.show)).toHaveBeenCalledWith({
        type: "success",
        text1: "Weight entry deleted",
      })
    );
  });

  it("says the history could not load, instead of claiming nothing was weighed", async () => {
    weightMock.mockImplementation(() => Promise.reject(new Error("network")));
    const screen = renderPage();

    // The failure card first: before the request settles the empty card is absent too.
    expect(await screen.findByText("Something went wrong")).toBeTruthy();
    expect(screen.queryByText("No weight entries yet")).toBeNull();
  });

  it("sends a deep link with a bad pet id back to the pets list, fetching nothing", () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ petId: "not-a-uuid" });

    renderPage();

    expect(jest.mocked(Redirect).mock.calls[0]?.[0]).toEqual({ href: "/(tabs)/pets" });
    expect(weightMock).not.toHaveBeenCalled();
  });
});
