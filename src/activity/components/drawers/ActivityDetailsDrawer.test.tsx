/// <reference types="jest" />

import { render } from "@testing-library/react-native";

import {
  ActivityIntensity,
  type ActivityLogResponseDto,
  ActivitySource,
  ActivityType,
} from "@/api/generated";

const mockTranslate = (key: string, opts?: Record<string, unknown>) => {
  if (opts && typeof opts.count === "number") return `${key}:${opts.count}`;
  return key;
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

// The drawer primitives wrap @gorhom/bottom-sheet, which needs the real
// Reanimated at import time.
jest.mock("@/shadecn/ui/drawer", () => {
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
    DrawerScrollView: passthrough("drawer-scroll"),
    DrawerCloseButton: () => null,
  };
});

// Stand-in for the native map so the marker payload is assertable.
const mapProps: Record<string, unknown>[] = [];
jest.mock("../ActivityMap", () => {
  const React = require("react");
  const { View } = require("react-native");
  const ActivityMap = (props: Record<string, unknown>) => {
    mapProps.push(props);
    return React.createElement(View, { testID: "activity-map" });
  };
  return { ActivityMap };
});

import { ActivityDetailsDrawer } from "./ActivityDetailsDrawer";

const base: ActivityLogResponseDto = {
  id: "activity-1",
  recordedAt: "2026-09-01T09:30:00.000Z",
  type: ActivityType.Walk,
  intensity: ActivityIntensity.Moderate,
  durationMinutes: 30,
  steps: 2400,
  source: ActivitySource.Manual,
};

beforeEach(() => {
  mapProps.length = 0;
});

describe("ActivityDetailsDrawer", () => {
  it("shows a map with just this activity when the location has coordinates", () => {
    const { getByTestId } = render(
      <ActivityDetailsDrawer
        activity={{ ...base, location: "Riverside Park@50.450100,30.523400" }}
        onClose={jest.fn()}
      />
    );

    expect(getByTestId("activity-map")).toBeTruthy();
    expect(mapProps[0].markers).toEqual([
      {
        id: "activity-1",
        title: "Riverside Park",
        coordinates: { latitude: 50.4501, longitude: 30.5234 },
      },
    ]);
    expect(mapProps[0].center).toEqual({ latitude: 50.4501, longitude: 30.5234 });
  });

  it("shows no map when the location is only a text label", () => {
    const { queryByTestId } = render(
      <ActivityDetailsDrawer
        activity={{ ...base, location: "Riverside Park" }}
        onClose={jest.fn()}
      />
    );

    expect(queryByTestId("activity-map")).toBeNull();
  });

  it("shows no map when there is no location at all", () => {
    const { queryByTestId } = render(
      <ActivityDetailsDrawer activity={{ ...base, location: null }} onClose={jest.fn()} />
    );

    expect(queryByTestId("activity-map")).toBeNull();
  });

  it("renders every field the entry carries", () => {
    const { getByText } = render(
      <ActivityDetailsDrawer activity={{ ...base, note: "Muddy trail" }} onClose={jest.fn()} />
    );

    expect(getByText("activity:details.recordedAt")).toBeTruthy();
    expect(getByText("activity:intensities.Moderate")).toBeTruthy();
    expect(getByText("activity:metrics.duration:30")).toBeTruthy();
    expect(getByText("activity:metrics.steps:2400")).toBeTruthy();
    expect(getByText("Muddy trail")).toBeTruthy();
  });

  it("omits rows for fields the entry does not have", () => {
    const { queryByText } = render(
      <ActivityDetailsDrawer
        activity={{ id: "a", type: ActivityType.Walk, recordedAt: base.recordedAt }}
        onClose={jest.fn()}
      />
    );

    expect(queryByText("activity:details.steps")).toBeNull();
    expect(queryByText("activity:details.intensity")).toBeNull();
    expect(queryByText("activity:details.note")).toBeNull();
  });
});
