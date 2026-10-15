/// <reference types="jest" />

import { fireEvent, render } from "@testing-library/react-native";

import { ExpandableActivityMap } from "./ExpandableActivityMap";

const mockMapProps: Record<string, unknown>[] = [];
let mockMounts = 0;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return { SafeAreaView: View };
});

// Records what each map instance receives and how often one mounts; the native
// view itself is not under test.
jest.mock("./ActivityMap", () => {
  const React = require("react");
  return {
    ActivityMap: (props: Record<string, unknown>) => {
      React.useEffect(() => {
        mockMounts += 1;
      }, []);
      mockMapProps.push(props);
      return null;
    },
  };
});

const pinA = { latitude: 50.4501, longitude: 30.5234 };
const pinB = { latitude: 49.8397, longitude: 24.0297 };
const markersAt = (coordinates: typeof pinA) => [{ id: "a", title: "Walk", coordinates }];

beforeEach(() => {
  mockMapProps.length = 0;
  mockMounts = 0;
});

describe("ExpandableActivityMap", () => {
  it("keeps the preview from placing pins and gives the fullscreen map the handler", () => {
    const onMapClick = jest.fn();
    const { getByLabelText } = render(
      <ExpandableActivityMap markers={markersAt(pinA)} onMapClick={onMapClick} />
    );

    expect(mockMapProps.every((props) => props.onMapClick === undefined)).toBe(true);

    fireEvent.press(getByLabelText("activity:map.expand"));

    expect(mockMapProps.some((props) => props.onMapClick === onMapClick)).toBe(true);
  });

  it("keeps the fullscreen camera still while pins are placed", () => {
    const { getByLabelText, rerender } = render(
      <ExpandableActivityMap markers={markersAt(pinA)} center={pinA} onMapClick={jest.fn()} />
    );
    fireEvent.press(getByLabelText("activity:map.expand"));

    // Placing a pin moves the caller's center to it.
    mockMapProps.length = 0;
    rerender(
      <ExpandableActivityMap markers={markersAt(pinB)} center={pinB} onMapClick={jest.fn()} />
    );

    const fullscreen = mockMapProps.find((props) => props.onMapClick !== undefined);
    expect(fullscreen?.center).toEqual(pinA);
    expect(fullscreen?.markers).toEqual(markersAt(pinB));
  });

  it("keeps the camera unset when fullscreen opened with nothing to centre on", () => {
    const { getByLabelText, rerender } = render(
      <ExpandableActivityMap markers={[]} center={null} onMapClick={jest.fn()} />
    );
    fireEvent.press(getByLabelText("activity:map.expand"));

    mockMapProps.length = 0;
    rerender(
      <ExpandableActivityMap markers={markersAt(pinB)} center={pinB} onMapClick={jest.fn()} />
    );

    const fullscreen = mockMapProps.find((props) => props.onMapClick !== undefined);
    expect(fullscreen?.center).toBeNull();
  });

  it("renders only the fullscreen map while it is open", () => {
    const { getByLabelText, rerender } = render(
      <ExpandableActivityMap markers={markersAt(pinA)} onMapClick={jest.fn()} />
    );
    fireEvent.press(getByLabelText("activity:map.expand"));

    mockMapProps.length = 0;
    rerender(<ExpandableActivityMap markers={markersAt(pinA)} onMapClick={jest.fn()} />);

    expect(mockMapProps.length).toBeGreaterThan(0);
    expect(mockMapProps.every((props) => props.onMapClick !== undefined)).toBe(true);
  });

  it("remounts the preview when fullscreen closes, retrying a map that timed out", () => {
    const { getByLabelText } = render(<ExpandableActivityMap markers={markersAt(pinA)} />);
    fireEvent.press(getByLabelText("activity:map.expand"));
    const mountsWhileOpen = mockMounts;

    fireEvent.press(getByLabelText("common:actions.close"));

    expect(mockMounts).toBeGreaterThan(mountsWhileOpen);
  });
});
