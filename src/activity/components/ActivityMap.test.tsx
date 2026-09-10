/// <reference types="jest" />

import { Platform } from "react-native";
import { render } from "@testing-library/react-native";

const mockTranslate = (key: string) => key;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

// Mutable so each test can model a different native-module state.
const mockMaps: { GoogleMaps: { View: unknown } } = { GoogleMaps: { View: () => null } };

// Captures the props the native view actually receives.
const viewProps: Record<string, unknown>[] = [];
const recordingView = (props: Record<string, unknown>) => {
  viewProps.push(props);
  return null;
};

jest.mock("expo-maps", () => ({
  get GoogleMaps() {
    return mockMaps.GoogleMaps;
  },
}));

import { ActivityMap } from "./ActivityMap";

const coordinates = { latitude: 50.4501, longitude: 30.5234 };
const markers = [{ id: "a", title: "Walk", coordinates }];

beforeEach(() => {
  Platform.OS = "android";
  mockMaps.GoogleMaps = { View: () => null };
  viewProps.length = 0;
});

describe("ActivityMap", () => {
  it("renders the map when the native view is available", () => {
    const { queryByText } = render(<ActivityMap markers={markers} />);
    expect(queryByText("activity:map.unavailable")).toBeNull();
  });

  it("falls back instead of crashing when the native module is missing", () => {
    // A binary built before expo-maps was installed: the module resolves but
    // exposes no view.
    mockMaps.GoogleMaps = { View: undefined };

    const { getByText } = render(<ActivityMap markers={markers} />);

    expect(getByText("activity:map.unavailable")).toBeTruthy();
  });

  it("falls back when rendering the native view throws", () => {
    mockMaps.GoogleMaps = {
      View: () => {
        throw new Error("requireNativeViewManager: ExpoGoogleMapsView not found");
      },
    };

    // The boundary logs the failure; keep the expected noise out of the output.
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

    const { getByText } = render(<ActivityMap markers={markers} />);

    expect(getByText("activity:map.unavailable")).toBeTruthy();
    consoleError.mockRestore();
  });

  it("omits cameraPosition entirely when there is nothing to centre on", () => {
    // Passing `cameraPosition={undefined}` makes the native view throw
    // "Could not cast dynamic value to ReadableMap" — the prop has to be absent.
    mockMaps.GoogleMaps = { View: recordingView };

    render(<ActivityMap markers={[]} />);

    expect(viewProps).toHaveLength(1);
    expect("cameraPosition" in viewProps[0]).toBe(false);
  });

  it("sets cameraPosition when a centre is available", () => {
    mockMaps.GoogleMaps = { View: recordingView };

    render(<ActivityMap markers={markers} />);

    expect(viewProps[0].cameraPosition).toEqual({
      coordinates: { latitude: 50.4501, longitude: 30.5234 },
      zoom: 14,
    });
  });

  it("centres on the first marker when no explicit centre is given", () => {
    mockMaps.GoogleMaps = { View: recordingView };

    render(<ActivityMap markers={markers} center={null} />);

    expect(viewProps[0].cameraPosition).toBeDefined();
  });

  it("falls back on platforms the map does not support", () => {
    Platform.OS = "ios";

    const { getByText } = render(<ActivityMap markers={markers} />);

    expect(getByText("activity:map.unavailable")).toBeTruthy();
  });
});
