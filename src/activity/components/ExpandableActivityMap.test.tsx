/// <reference types="jest" />

import { Platform } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { ExpandableActivityMap } from "./ExpandableActivityMap";

const mockMapProps: Record<string, unknown>[] = [];
const mockEndNativeActivity = jest.fn();
const mockBeginNativeActivity = jest.fn(() => mockEndNativeActivity);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return { SafeAreaView: View };
});

// Records what each map instance receives; the native view itself is not under test.
jest.mock("./ActivityMap", () => ({
  ActivityMap: (props: Record<string, unknown>) => {
    mockMapProps.push(props);
    return null;
  },
}));

jest.mock("@/shadecn/ui/drawer", () => ({
  useDrawerNativeActivity: () => mockBeginNativeActivity,
}));

const coordinates = { latitude: 50.4501, longitude: 30.5234 };
const markers = [{ id: "a", title: "Walk", coordinates }];

beforeEach(() => {
  Platform.OS = "android";
  mockMapProps.length = 0;
  jest.clearAllMocks();
});

describe("ExpandableActivityMap", () => {
  it("keeps the preview from placing pins and gives the fullscreen map the handler", () => {
    const onMapClick = jest.fn();
    const { getByLabelText } = render(
      <ExpandableActivityMap markers={markers} onMapClick={onMapClick} />
    );

    expect(mockMapProps.every((props) => props.onMapClick === undefined)).toBe(true);

    fireEvent.press(getByLabelText("activity:map.expand"));

    expect(mockMapProps.some((props) => props.onMapClick === onMapClick)).toBe(true);
  });

  it("ends the drawer's native activity when the fullscreen map closes", () => {
    const { getByLabelText } = render(<ExpandableActivityMap markers={markers} />);

    fireEvent.press(getByLabelText("activity:map.expand"));
    expect(mockBeginNativeActivity).toHaveBeenCalledTimes(1);
    expect(mockEndNativeActivity).not.toHaveBeenCalled();

    fireEvent.press(getByLabelText("common:actions.close"));
    expect(mockEndNativeActivity).toHaveBeenCalledTimes(1);
  });

  it("ends the native activity if it unmounts while open", () => {
    const { getByLabelText, unmount } = render(<ExpandableActivityMap markers={markers} />);

    fireEvent.press(getByLabelText("activity:map.expand"));
    unmount();

    expect(mockEndNativeActivity).toHaveBeenCalledTimes(1);
  });
});
