/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import i18next from "i18next";

import type { PetWeightLogResponseDto } from "@/api/generated";
import enCommon from "@/common/locales/en.json";
import enErrors from "@/errors/locales/en.json";

import enFeeding from "../../locales/en.json";

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
  postApiPetsPetIdWeightHistory: jest.fn(),
  patchApiPetsPetIdWeightHistoryWeightLogId: jest.fn(),
}));

import { patchApiPetsPetIdWeightHistoryWeightLogId, postApiPetsPetIdWeightHistory } from "@/api";

import { LogWeightDrawer } from "./LogWeightDrawer";

const createMock = jest.mocked(postApiPetsPetIdWeightHistory);
const patchMock = jest.mocked(patchApiPetsPetIdWeightHistoryWeightLogId);
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

// Numbers arrive as strings from this API as often as not, so the stored entry
// uses a string on purpose.
const storedLog = {
  id: "weight-1",
  petId: PET_ID,
  weightKg: "4.1",
  measuredAt: "2026-10-09T09:00:00.000Z",
  notes: "after the vet",
} as unknown as PetWeightLogResponseDto;

const clients: QueryClient[] = [];

const renderDrawer = (log?: PetWeightLogResponseDto, prefill?: { weightKg: string }) => {
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
    <LogWeightDrawer isOpen setIsOpen={setIsOpen} petId={PET_ID} log={log} prefill={prefill} />,
    { wrapper }
  );

  return { ...screen, setIsOpen };
};

beforeEach(() => {
  jest.resetAllMocks();
  createMock.mockResolvedValue(apiResponse(storedLog));
  patchMock.mockResolvedValue(apiResponse(storedLog));
});

afterEach(() => {
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("LogWeightDrawer — logging a new weight", () => {
  it("sends the weight as a number and leaves blank notes null", async () => {
    const screen = renderDrawer();

    fireEvent.changeText(screen.getByPlaceholderText("4.1"), "4.1");
    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(PET_ID, {
      measuredAt: expect.any(String),
      weightKg: 4.1,
      notes: null,
    });
    const sentAt = new Date(createMock.mock.calls[0]?.[1].measuredAt ?? "").getTime();
    expect(Math.abs(sentAt - Date.now())).toBeLessThan(60_000);
  });

  it("confirms to the user and closes the drawer once saved", async () => {
    const screen = renderDrawer();

    fireEvent.changeText(screen.getByPlaceholderText("4.1"), "4.1");
    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() => expect(screen.setIsOpen).toHaveBeenCalledWith(false));
    expect(toastMock).toHaveBeenCalledWith({ type: "success", text1: "Weight logged" });
  });

  it("will not save without a weight", async () => {
    const screen = renderDrawer();

    fireEvent.press(screen.getByText("Save weight"));

    expect(await screen.findByText("Enter a weight")).toBeTruthy();
    expect(screen.queryByText("Enter a positive number")).toBeNull();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("will not save a weight that is not a positive number", async () => {
    const screen = renderDrawer();

    fireEvent.changeText(screen.getByPlaceholderText("4.1"), "0");
    fireEvent.press(screen.getByText("Save weight"));

    expect(await screen.findByText("Enter a positive number")).toBeTruthy();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("stays open and tells the user when the server refuses", async () => {
    createMock.mockImplementation(() => Promise.reject(new Error("network")));
    const screen = renderDrawer();

    fireEvent.changeText(screen.getByPlaceholderText("4.1"), "4.1");
    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }))
    );
    expect(screen.setIsOpen).not.toHaveBeenCalled();
  });

  it("puts the server's per-field message under that field, and in the toast", async () => {
    createMock.mockImplementation(() =>
      Promise.reject(validationError({ WeightKg: ["request_validation_failed"] }))
    );
    const screen = renderDrawer();

    fireEvent.changeText(screen.getByPlaceholderText("4.1"), "4.1");
    fireEvent.press(screen.getByText("Save weight"));

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

describe("LogWeightDrawer — prefilled by a voice command", () => {
  it("saves the spoken weight without any typing", async () => {
    const screen = renderDrawer(undefined, { weightKg: "12.5" });

    expect(screen.getByDisplayValue("12.5")).toBeTruthy();
    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(PET_ID, {
      measuredAt: expect.any(String),
      weightKg: 12.5,
      notes: null,
    });
  });
});

describe("LogWeightDrawer — editing a logged weight", () => {
  it("refuses to save an entry that has no id, instead of posting a duplicate", async () => {
    const screen = renderDrawer({ ...storedLog, id: undefined });

    fireEvent.changeText(screen.getByDisplayValue("4.1"), "4.3");
    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "error",
        text1: "This entry cannot be edited — it has no id.",
      })
    );
    expect(createMock).not.toHaveBeenCalled();
    expect(patchMock).not.toHaveBeenCalled();
  });

  it("starts with the stored values filled in", () => {
    const screen = renderDrawer(storedLog);

    expect(screen.getByDisplayValue("4.1")).toBeTruthy();
    expect(screen.getByDisplayValue("after the vet")).toBeTruthy();
  });

  it("sends only the field that changed, so untouched ones cannot overwrite a newer edit", async () => {
    const screen = renderDrawer(storedLog);

    fireEvent.changeText(screen.getByDisplayValue("4.1"), "4.3");
    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
    expect(patchMock).toHaveBeenCalledWith(PET_ID, "weight-1", { weightKg: 4.3 });
  });

  it("sends nothing at all when nothing changed", async () => {
    const screen = renderDrawer(storedLog);

    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() => expect(screen.setIsOpen).toHaveBeenCalledWith(false));
    expect(patchMock).not.toHaveBeenCalled();
  });

  it("clears the notes when they are emptied", async () => {
    const screen = renderDrawer(storedLog);

    fireEvent.changeText(screen.getByDisplayValue("after the vet"), "");
    fireEvent.press(screen.getByText("Save weight"));

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
    expect(patchMock).toHaveBeenCalledWith(PET_ID, "weight-1", { notes: null });
  });
});
