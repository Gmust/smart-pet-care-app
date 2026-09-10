/// <reference types="jest" />

import type { ReactNode } from "react";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";
import * as Location from "expo-location";

import {
  ActivityIntensity,
  type ActivityLogResponseDto,
  ActivitySource,
  ActivityType,
} from "@/api/generated";

// Interpolating passthrough so keys are directly assertable.
const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

jest.mock("expo-location", () => ({
  PermissionStatus: { GRANTED: "granted", DENIED: "denied", UNDETERMINED: "undetermined" },
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: "undetermined" })),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve(null)),
}));

// expo-maps is a native module; it renders nothing under jest. The map's real
// behavior is verified on a device, not here.
jest.mock("expo-maps", () => ({
  GoogleMaps: { View: () => null },
}));

// The drawer primitives wrap @gorhom/bottom-sheet, which needs the real
// Reanimated at import time. This test is about form submission, not sheet
// mechanics, so the primitives become plain views.
jest.mock("@/shadecn/ui/drawer", () => {
  // No JSX in here: Babel registers named components with an out-of-scope
  // helper, which jest.mock factories reject. createElement sidesteps that.
  const React = require("react");
  const { View } = require("react-native");
  const passthrough = (testID: string) => {
    const Passthrough = ({ children }: { children?: React.ReactNode }) =>
      React.createElement(View, { testID }, children);
    Passthrough.displayName = `Mock(${testID})`;
    return Passthrough;
  };
  return {
    Drawer: passthrough("drawer"),
    DrawerContent: passthrough("drawer-content"),
    DrawerHeader: passthrough("drawer-header"),
    DrawerTitle: passthrough("drawer-title"),
    DrawerFooter: passthrough("drawer-footer"),
    DrawerScrollView: passthrough("drawer-scroll"),
    DrawerCloseButton: () => null,
    // DateTimeField reaches for these when opening its native picker.
    useDrawerNativeActivity: () => () => undefined,
    useDrawerSetOpen: () => () => undefined,
    useDrawerClose: () => () => undefined,
    DRAWER_FOOTER_FADE_SPACING: 30,
  };
});

jest.mock("@/api", () => ({
  postApiPetsPetIdActivityLogs: jest.fn(),
  patchApiPetsPetIdActivityLogsActivityLogId: jest.fn(),
}));

import { patchApiPetsPetIdActivityLogsActivityLogId, postApiPetsPetIdActivityLogs } from "@/api";

import { CreateActivityDrawer } from "./CreateActivityDrawer";

const createMock = jest.mocked(postApiPetsPetIdActivityLogs);
const patchMock = jest.mocked(patchApiPetsPetIdActivityLogsActivityLogId);
const toastMock = jest.mocked(Toast.show);
const requestPermissionMock = jest.mocked(Location.requestForegroundPermissionsAsync);
const getPositionMock = jest.mocked(Location.getCurrentPositionAsync);

const PET_ID = "pet-1";

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return { data, status: 200, statusText: "OK", headers, config: { headers } };
};

const clients: QueryClient[] = [];

const existing: ActivityLogResponseDto = {
  id: "activity-1",
  petId: PET_ID,
  recordedAt: "2026-09-01T09:00:00.000Z",
  type: ActivityType.Walk,
  intensity: ActivityIntensity.Moderate,
  durationMinutes: 30,
  steps: 2400,
  location: "Riverside Park@50.450100,30.523400",
  note: "Muddy trail",
};

const renderDrawer = (setIsOpen = jest.fn(), activity?: ActivityLogResponseDto) => {
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

  const utils = render(
    <CreateActivityDrawer isOpen setIsOpen={setIsOpen} petId={PET_ID} activity={activity} />,
    { wrapper }
  );

  return { ...utils, setIsOpen, queryClient };
};

/** Choose an activity type — the one required field with no default. */
const chooseWalk = (getByText: ReturnType<typeof renderDrawer>["getByText"]) => {
  fireEvent.press(getByText("activity:types.Walk"));
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // A retained cache keeps React Query's notify timer alive and jest never exits.
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("CreateActivityDrawer", () => {
  it("sends null for blank optional fields rather than 0 or empty string", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "activity-1" }));
    const { getByText } = renderDrawer();

    chooseWalk(getByText);
    await act(async () => {
      fireEvent.press(getByText("activity:forms.activity.submit"));
    });

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));

    const [petId, dto] = createMock.mock.calls[0];
    expect(petId).toBe(PET_ID);
    expect(dto.type).toBe(ActivityType.Walk);
    expect(dto.durationMinutes).toBeNull();
    expect(dto.steps).toBeNull();
    expect(dto.note).toBeNull();
    expect(dto.location).toBeNull();
    expect(dto.intensity).toBeNull();
  });

  it("always records source as Manual", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "activity-1" }));
    const { getByText } = renderDrawer();

    chooseWalk(getByText);
    await act(async () => {
      fireEvent.press(getByText("activity:forms.activity.submit"));
    });

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][1].source).toBe(ActivitySource.Manual);
  });

  it("shows a success toast, resets, and closes on success", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "activity-1" }));
    const setIsOpen = jest.fn();
    const { getByText } = renderDrawer(setIsOpen);

    chooseWalk(getByText);
    await act(async () => {
      fireEvent.press(getByText("activity:forms.activity.submit"));
    });

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "success",
        text1: "activity:forms.activity.createSuccess",
      })
    );
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("shows an error toast and keeps the drawer open when create fails", async () => {
    createMock.mockRejectedValue(new Error("boom"));
    const setIsOpen = jest.fn();
    const { getByText } = renderDrawer(setIsOpen);

    chooseWalk(getByText);
    await act(async () => {
      fireEvent.press(getByText("activity:forms.activity.submit"));
    });

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "error",
        text1: "common:errors.somethingWentWrong",
      })
    );
    expect(setIsOpen).not.toHaveBeenCalledWith(false);
  });

  it("does not submit while the required type is missing", async () => {
    const { getByText } = renderDrawer();

    await act(async () => {
      fireEvent.press(getByText("activity:forms.activity.submit"));
    });

    expect(createMock).not.toHaveBeenCalled();
  });

  it("encodes a picked coordinate into the location string", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "activity-1" }));
    // The real PermissionResponse / LocationObject carry many fields the code
    // under test never reads. Asserting the partial shape keeps the fixture to
    // what matters; building the full objects would add noise, not safety.
    requestPermissionMock.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    } as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);
    getPositionMock.mockResolvedValue({
      coords: { latitude: 50.4501, longitude: 30.5234 },
    } as Awaited<ReturnType<typeof Location.getCurrentPositionAsync>>);

    const { getByText } = renderDrawer();

    chooseWalk(getByText);
    await act(async () => {
      fireEvent.press(getByText("activity:location.useCurrent"));
    });
    await act(async () => {
      fireEvent.press(getByText("activity:forms.activity.submit"));
    });

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][1].location).toBe("@50.450100,30.523400");
  });

  it("still allows saving when location permission is denied", async () => {
    createMock.mockResolvedValue(apiResponse({ id: "activity-1" }));
    // Partial fixture — see the note above on PermissionResponse.
    requestPermissionMock.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    } as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);

    const { getByText } = renderDrawer();

    chooseWalk(getByText);
    await act(async () => {
      fireEvent.press(getByText("activity:location.useCurrent"));
    });

    // The denial explains itself and never blocks the form.
    expect(getByText("activity:location.permissionDenied")).toBeTruthy();
    expect(getPositionMock).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(getByText("activity:forms.activity.submit"));
    });

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock.mock.calls[0][1].location).toBeNull();
  });

  describe("edit mode", () => {
    it("sends nothing when nothing was changed", async () => {
      patchMock.mockResolvedValue(apiResponse(existing));
      const { getByText } = renderDrawer(jest.fn(), existing);

      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));

      // PATCH leaves omitted keys untouched, so an untouched form sends {}.
      expect(patchMock.mock.calls[0][0]).toBe(PET_ID);
      expect(patchMock.mock.calls[0][1]).toBe("activity-1");
      expect(patchMock.mock.calls[0][2]).toEqual({});
      expect(createMock).not.toHaveBeenCalled();
    });

    it("does not resend an untouched location written in another spelling", async () => {
      patchMock.mockResolvedValue(apiResponse(existing));
      // Same place, fewer decimals: encoding normalises it, so a raw string
      // compare would call this a change and clobber a concurrent edit.
      const { getByText } = renderDrawer(jest.fn(), {
        ...existing,
        location: "Riverside Park@50.4501,30.5234",
      });

      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
      expect(patchMock.mock.calls[0][2]).toEqual({});
    });

    it("refuses to save an entry that has no id instead of creating a duplicate", async () => {
      const { getByText } = renderDrawer(jest.fn(), { ...existing, id: undefined });

      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      expect(patchMock).not.toHaveBeenCalled();
      expect(createMock).not.toHaveBeenCalled();
    });

    it("sends only the field that changed", async () => {
      patchMock.mockResolvedValue(apiResponse(existing));
      const { getByText } = renderDrawer(jest.fn(), existing);

      fireEvent.press(getByText("activity:types.Run"));
      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
      expect(patchMock.mock.calls[0][2]).toEqual({ type: ActivityType.Run });
    });

    it("clears a nullable field with null rather than omitting it", async () => {
      patchMock.mockResolvedValue(apiResponse(existing));
      const { getByText, getByDisplayValue } = renderDrawer(jest.fn(), existing);

      fireEvent.changeText(getByDisplayValue("2400"), "");
      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
      expect(patchMock.mock.calls[0][2]).toEqual({ steps: null });
    });

    it("prefills the form from the existing activity", () => {
      const { getByDisplayValue } = renderDrawer(jest.fn(), existing);

      expect(getByDisplayValue("30")).toBeTruthy();
      expect(getByDisplayValue("2400")).toBeTruthy();
      expect(getByDisplayValue("Muddy trail")).toBeTruthy();
      expect(getByDisplayValue("Riverside Park")).toBeTruthy();
    });

    it("shows the update toast and closes on success", async () => {
      patchMock.mockResolvedValue(apiResponse(existing));
      const setIsOpen = jest.fn();
      const { getByText } = renderDrawer(setIsOpen, existing);

      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() =>
        expect(toastMock).toHaveBeenCalledWith({
          type: "success",
          text1: "activity:forms.activity.updateSuccess",
        })
      );
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("keeps the drawer open and warns when the update fails", async () => {
      patchMock.mockImplementation(() => Promise.reject(new Error("boom")));
      const setIsOpen = jest.fn();
      const { getByText } = renderDrawer(setIsOpen, existing);

      fireEvent.press(getByText("activity:types.Run"));
      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() =>
        expect(toastMock).toHaveBeenCalledWith({
          type: "error",
          text1: "common:errors.somethingWentWrong",
        })
      );
      expect(setIsOpen).not.toHaveBeenCalledWith(false);
    });
    it("does not deselect the already-selected intensity", async () => {
      patchMock.mockResolvedValue(apiResponse(existing));
      const { getByText } = renderDrawer(jest.fn(), existing);

      // Tapping the selected chip must leave it selected: the API cannot express
      // a cleared intensity, so the form never offers that state. Were it to
      // deselect, the now-required field would block submission entirely.
      fireEvent.press(getByText("activity:intensities.Moderate"));

      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
      expect(patchMock.mock.calls[0][2]).toEqual({});
    });

    it("switches intensity to another value", async () => {
      patchMock.mockResolvedValue(apiResponse(existing));
      const { getByText } = renderDrawer(jest.fn(), existing);

      fireEvent.press(getByText("activity:intensities.High"));

      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
      expect(patchMock.mock.calls[0][2]).toEqual({ intensity: ActivityIntensity.High });
    });

    it("blocks saving an entry that has no intensity yet until one is chosen", async () => {
      const withoutIntensity = { ...existing, intensity: null };
      const { getByText } = renderDrawer(jest.fn(), withoutIntensity);

      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      expect(patchMock).not.toHaveBeenCalled();

      fireEvent.press(getByText("activity:intensities.Low"));
      patchMock.mockResolvedValue(apiResponse(withoutIntensity));
      await act(async () => {
        fireEvent.press(getByText("activity:forms.activity.submit"));
      });

      await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
      expect(patchMock.mock.calls[0][2]).toEqual({ intensity: ActivityIntensity.Low });
    });
  });
});
