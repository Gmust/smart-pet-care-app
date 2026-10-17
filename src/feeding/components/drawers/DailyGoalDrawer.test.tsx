/// <reference types="jest" />

import type { ReactNode } from "react";
import { initReactI18next } from "react-i18next";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";
import i18next from "i18next";

import { type NutritionGoalResponseDto, PortionUnit } from "@/api/generated";
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
  putApiPetsPetIdNutritionGoal: jest.fn(),
}));

import { putApiPetsPetIdNutritionGoal } from "@/api";

import { DailyGoalDrawer } from "./DailyGoalDrawer";

const putMock = jest.mocked(putApiPetsPetIdNutritionGoal);
const toastMock = jest.mocked(Toast.show);

const PET_ID = "pet-1";

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

// Numbers arrive as strings from this API as often as not, so the stored goal
// uses strings on purpose.
const storedGoal = {
  id: "goal-1",
  petId: PET_ID,
  dailyCalorieTarget: "420",
  dailyPortionTarget: "200",
  portionUnit: PortionUnit.Gram,
  mealsPerDay: "3",
} as unknown as NutritionGoalResponseDto;

const clients: QueryClient[] = [];

const renderDrawer = (goal?: NutritionGoalResponseDto | null, onRemove?: () => void) => {
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
    <DailyGoalDrawer isOpen setIsOpen={setIsOpen} petId={PET_ID} goal={goal} onRemove={onRemove} />,
    { wrapper }
  );

  return { ...screen, setIsOpen };
};

beforeEach(() => {
  jest.resetAllMocks();
  putMock.mockResolvedValue(apiResponse(storedGoal));
});

afterEach(() => {
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("DailyGoalDrawer — setting a goal", () => {
  it("sends what was typed, with numbers as numbers", async () => {
    const screen = renderDrawer(null);

    fireEvent.changeText(screen.getByPlaceholderText("420"), "420");
    fireEvent.changeText(screen.getByPlaceholderText("200"), "200");
    fireEvent.press(screen.getByText("g"));
    fireEvent.changeText(screen.getByPlaceholderText("3"), "3");
    fireEvent.press(screen.getByText("Save goal"));

    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(1));
    expect(putMock).toHaveBeenCalledWith(PET_ID, {
      dailyCalorieTarget: 420,
      dailyPortionTarget: 200,
      portionUnit: PortionUnit.Gram,
      mealsPerDay: 3,
    });
  });

  it("confirms to the user and closes the drawer once saved", async () => {
    const screen = renderDrawer(null);

    fireEvent.changeText(screen.getByPlaceholderText("420"), "420");
    fireEvent.press(screen.getByText("Save goal"));

    await waitFor(() => expect(screen.setIsOpen).toHaveBeenCalledWith(false));
    expect(toastMock).toHaveBeenCalledWith({ type: "success", text1: "Goal saved" });
  });

  it("will not save a goal that targets nothing", async () => {
    const screen = renderDrawer(null);

    fireEvent.press(screen.getByText("Save goal"));

    expect(await screen.findByText("Set at least one target")).toBeTruthy();
    expect(putMock).not.toHaveBeenCalled();
  });

  it("will not save a portion target that has no unit", async () => {
    const screen = renderDrawer(null);

    fireEvent.changeText(screen.getByPlaceholderText("200"), "200");
    fireEvent.press(screen.getByText("Save goal"));

    expect(await screen.findByText("Pick a unit for the portion")).toBeTruthy();
    expect(putMock).not.toHaveBeenCalled();
  });

  it("stays open and tells the user when the server refuses", async () => {
    putMock.mockImplementation(() => Promise.reject(new Error("network")));
    const screen = renderDrawer(null);

    fireEvent.changeText(screen.getByPlaceholderText("420"), "420");
    fireEvent.press(screen.getByText("Save goal"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }))
    );
    expect(screen.setIsOpen).not.toHaveBeenCalled();
  });

  it("puts the server's per-field message under that field, and in the toast", async () => {
    putMock.mockImplementation(() =>
      Promise.reject(
        new AxiosError("Bad Request", "ERR_BAD_REQUEST", undefined, undefined, {
          data: {
            code: "request_validation_failed",
            errors: { DailyCalorieTarget: ["request_validation_failed"] },
          },
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: { headers: new AxiosHeaders() },
        })
      )
    );
    const screen = renderDrawer(null);

    fireEvent.changeText(screen.getByPlaceholderText("420"), "420");
    fireEvent.press(screen.getByText("Save goal"));

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

describe("DailyGoalDrawer — changing the current goal", () => {
  it("starts with the current goal filled in", () => {
    const screen = renderDrawer(storedGoal);

    expect(screen.getByDisplayValue("420")).toBeTruthy();
    expect(screen.getByDisplayValue("200")).toBeTruthy();
    expect(screen.getByDisplayValue("3")).toBeTruthy();
  });

  it("clears a target by blanking it, and sends the rest of the goal unchanged", async () => {
    const screen = renderDrawer(storedGoal);

    fireEvent.changeText(screen.getByDisplayValue("3"), "");
    fireEvent.press(screen.getByText("Save goal"));

    await waitFor(() => expect(putMock).toHaveBeenCalledTimes(1));
    expect(putMock).toHaveBeenCalledWith(PET_ID, {
      dailyCalorieTarget: 420,
      dailyPortionTarget: 200,
      portionUnit: PortionUnit.Gram,
      mealsPerDay: null,
    });
  });

  it("offers to remove the goal only when there is one", () => {
    expect(renderDrawer(null, jest.fn()).queryByText("Remove goal")).toBeNull();
  });

  it("hands removal to the parent instead of deleting inside the sheet", () => {
    const onRemove = jest.fn();
    const screen = renderDrawer(storedGoal, onRemove);

    fireEvent.press(screen.getByText("Remove goal"));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(putMock).not.toHaveBeenCalled();
  });
});
