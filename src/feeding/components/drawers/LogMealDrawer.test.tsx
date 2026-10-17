/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import i18next from "i18next";

import { type FeedingLogResponseDto, FoodType, PortionUnit } from "@/api/generated";
import enCommon from "@/common/locales/en.json";
import enErrors from "@/errors/locales/en.json";

import enFeeding from "../../locales/en.json";
import type { FeedingSlot } from "../../types";

beforeAll(async () => {
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

jest.mock("@/shadecn/ui/drawer", () => require("../../testing/portalMocks").drawerMock());

jest.mock("@/api", () => ({
  postApiPetsPetIdFeedingLogs: jest.fn(),
  patchApiPetsPetIdFeedingLogsLogId: jest.fn(),
  postApiRemindersIdComplete: jest.fn(),
}));

import {
  patchApiPetsPetIdFeedingLogsLogId,
  postApiPetsPetIdFeedingLogs,
  postApiRemindersIdComplete,
} from "@/api";

import { LogMealDrawer } from "./LogMealDrawer";

const createMock = jest.mocked(postApiPetsPetIdFeedingLogs);
const patchMock = jest.mocked(patchApiPetsPetIdFeedingLogsLogId);
const completeMock = jest.mocked(postApiRemindersIdComplete);
const toastMock = jest.mocked(Toast.show);

const PET_ID = "pet-1";

const validationError = (errors: Record<string, string[]>) =>
  new AxiosError("Bad Request", "ERR_BAD_REQUEST", undefined, undefined, {
    data: { code: "request_validation_failed", errors },
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

// Numbers arrive as strings from this API as often as not (the spec gives them a
// numeric-string pattern), so the stored log uses strings on purpose.
const storedLog = {
  id: "log-1",
  petId: PET_ID,
  fedAt: "2026-10-09T08:05:00.000Z",
  foodType: FoodType.DryFood,
  foodName: "Royal Canin Renal",
  portionAmount: "85",
  portionUnit: PortionUnit.Gram,
  approxCalories: "170",
  notes: null,
} as unknown as FeedingLogResponseDto;

const clients: QueryClient[] = [];

const renderDrawer = (log?: FeedingLogResponseDto, slot?: FeedingSlot) => {
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

  const setIsOpen = jest.fn();
  const screen = render(
    <LogMealDrawer isOpen setIsOpen={setIsOpen} petId={PET_ID} log={log} slot={slot} />,
    { wrapper }
  );

  return { ...screen, setIsOpen };
};

beforeEach(() => {
  // reset, not clear: clearAllMocks leaves implementations in place, so a
  // rejecting mock would bleed into later tests.
  jest.resetAllMocks();
  createMock.mockResolvedValue(apiResponse(storedLog));
  patchMock.mockResolvedValue(apiResponse(storedLog));
});

afterEach(() => {
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("LogMealDrawer — logging a new meal", () => {
  it("sends what was typed, with numbers as numbers and blanks as null", async () => {
    const screen = renderDrawer();

    fireEvent.press(screen.getByText("Dry food"));
    fireEvent.changeText(screen.getByPlaceholderText("e.g. Royal Canin Renal"), "  Royal Canin ");
    fireEvent.changeText(screen.getByPlaceholderText("85"), "85");
    fireEvent.press(screen.getByText("g"));
    fireEvent.changeText(screen.getByPlaceholderText("Needed for the nutrition analysis"), "170");
    fireEvent.press(screen.getByText("Save meal"));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(PET_ID, {
      fedAt: expect.any(String),
      foodType: FoodType.DryFood,
      foodName: "Royal Canin",
      portionAmount: 85,
      portionUnit: PortionUnit.Gram,
      approxCalories: 170,
      notes: null,
    });
    const sentAt = new Date(createMock.mock.calls[0]?.[1].fedAt ?? "").getTime();
    expect(Math.abs(sentAt - Date.now())).toBeLessThan(60_000);
  });

  it("confirms to the user and closes the drawer once saved", async () => {
    const screen = renderDrawer();

    fireEvent.press(screen.getByText("Treat"));
    fireEvent.press(screen.getByText("Save meal"));

    await waitFor(() => expect(screen.setIsOpen).toHaveBeenCalledWith(false));
    expect(toastMock).toHaveBeenCalledWith({ type: "success", text1: "Meal logged" });
  });

  it("will not save until a food type is chosen", async () => {
    const screen = renderDrawer();

    fireEvent.press(screen.getByText("Save meal"));

    expect(await screen.findByText("Pick a food type")).toBeTruthy();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("will not save a portion that has no unit", async () => {
    const screen = renderDrawer();

    fireEvent.press(screen.getByText("Dry food"));
    fireEvent.changeText(screen.getByPlaceholderText("85"), "85");
    fireEvent.press(screen.getByText("Save meal"));

    expect(await screen.findByText("Pick a unit for the portion")).toBeTruthy();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("stays open and tells the user when the server refuses", async () => {
    createMock.mockImplementation(() => Promise.reject(new Error("network")));
    const screen = renderDrawer();

    fireEvent.press(screen.getByText("Dry food"));
    fireEvent.press(screen.getByText("Save meal"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }))
    );
    expect(screen.setIsOpen).not.toHaveBeenCalled();
  });

  it("puts the server's per-field message under that field, and in the toast", async () => {
    createMock.mockImplementation(() =>
      Promise.reject(validationError({ PortionAmount: ["request_validation_failed"] }))
    );
    const screen = renderDrawer();

    fireEvent.press(screen.getByText("Dry food"));
    fireEvent.press(screen.getByText("Save meal"));

    expect(
      await screen.findByText("Some details aren't valid. Check them and try again.")
    ).toBeTruthy();
    expect(toastMock).toHaveBeenCalledWith({
      type: "error",
      text1: "Some details aren't valid. Check them and try again.",
    });
    expect(screen.setIsOpen).not.toHaveBeenCalled();
  });
});

describe("LogMealDrawer — editing a logged meal", () => {
  it("refuses to save a meal that has no id, instead of posting a duplicate", async () => {
    const screen = renderDrawer({ ...storedLog, id: undefined });

    fireEvent.press(screen.getByText("Save meal"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "error",
        text1: "This meal cannot be edited — it has no id.",
      })
    );
    expect(createMock).not.toHaveBeenCalled();
    expect(patchMock).not.toHaveBeenCalled();
  });

  it("starts with the stored values filled in", () => {
    const screen = renderDrawer(storedLog);

    expect(screen.getByDisplayValue("Royal Canin Renal")).toBeTruthy();
    expect(screen.getByDisplayValue("85")).toBeTruthy();
    expect(screen.getByDisplayValue("170")).toBeTruthy();
  });

  it("sends only the field that changed, so untouched ones cannot overwrite a newer edit", async () => {
    const screen = renderDrawer(storedLog);

    fireEvent.changeText(screen.getByDisplayValue("170"), "200");
    fireEvent.press(screen.getByText("Save meal"));

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
    expect(patchMock).toHaveBeenCalledWith(PET_ID, "log-1", { approxCalories: 200 });
  });

  it("sends nothing at all when nothing changed", async () => {
    const screen = renderDrawer(storedLog);

    fireEvent.press(screen.getByText("Save meal"));

    await waitFor(() => expect(screen.setIsOpen).toHaveBeenCalledWith(false));
    expect(patchMock).not.toHaveBeenCalled();
  });

  it("will not let a stored portion be erased, since the API cannot clear it", async () => {
    const screen = renderDrawer(storedLog);

    fireEvent.changeText(screen.getByDisplayValue("85"), "");
    fireEvent.press(screen.getByText("Save meal"));

    expect(
      await screen.findByText("A saved portion cannot be removed — change it instead")
    ).toBeTruthy();
    expect(patchMock).not.toHaveBeenCalled();
  });
});

describe("LogMealDrawer — recording the meal of a schedule slot", () => {
  const MISSED_SLOT: FeedingSlot = {
    reminderId: "reminder-1",
    fedAt: "2026-10-09T18:00:00.000Z",
    title: "Dinner",
  };

  const saveSlotMeal = (screen: ReturnType<typeof renderDrawer>) => {
    fireEvent.press(screen.getByText("Dry food"));
    fireEvent.press(screen.getByText("Save meal"));
  };

  it("logs the meal at the slot's own time, then closes the slot at that same time", async () => {
    completeMock.mockResolvedValue(apiResponse({}));
    const screen = renderDrawer(undefined, MISSED_SLOT);

    saveSlotMeal(screen);

    await waitFor(() => expect(completeMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0]?.[1]).toMatchObject({
      fedAt: MISSED_SLOT.fedAt,
      reminderId: "reminder-1",
    });
    expect(completeMock).toHaveBeenCalledWith("reminder-1", { performedAt: MISSED_SLOT.fedAt });
    expect(toastMock).toHaveBeenCalledWith({ type: "success", text1: "Meal logged" });
  });

  it("names the meal after the reminder when the user types no name", async () => {
    completeMock.mockResolvedValue(apiResponse({}));
    const screen = renderDrawer(undefined, MISSED_SLOT);

    saveSlotMeal(screen);

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0]?.[1]).toMatchObject({ foodName: "Dinner" });
  });

  it("keeps the name the user typed instead of the reminder's, and starts with the field empty", async () => {
    completeMock.mockResolvedValue(apiResponse({}));
    const screen = renderDrawer(undefined, MISSED_SLOT);

    expect(screen.getByPlaceholderText("e.g. Royal Canin Renal").props.value).toBe("");
    fireEvent.changeText(screen.getByPlaceholderText("e.g. Royal Canin Renal"), "Hill's Science");
    saveSlotMeal(screen);

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0]?.[1]).toMatchObject({ foodName: "Hill's Science" });
  });

  it("leaves an ordinary meal unnamed instead of borrowing a reminder's title", async () => {
    const screen = renderDrawer();

    saveSlotMeal(screen);

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0]?.[1]).toMatchObject({ foodName: null });
    expect(createMock.mock.calls[0]?.[1]).not.toHaveProperty("reminderId");
  });

  it("does not close any slot for an ordinary meal", async () => {
    const screen = renderDrawer();

    saveSlotMeal(screen);

    await waitFor(() => expect(screen.setIsOpen).toHaveBeenCalledWith(false));
    expect(completeMock).not.toHaveBeenCalled();
  });

  it("says so when only the slot could not be closed, and does not offer to log the meal again", async () => {
    completeMock.mockImplementation(() => Promise.reject(new Error("nope")));
    const screen = renderDrawer(undefined, MISSED_SLOT);

    saveSlotMeal(screen);

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "error",
        text1: "Meal saved, but its scheduled slot could not be marked done",
      })
    );
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(screen.setIsOpen).toHaveBeenCalledWith(false);
  });
});
