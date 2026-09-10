/// <reference types="jest" />

import { fireEvent, render } from "@testing-library/react-native";

import { ActivityIntensity, type ActivityLogResponseDto, ActivityType } from "@/api/generated";

const mockTranslate = (key: string, opts?: Record<string, unknown>) => {
  if (opts && typeof opts.count === "number") return `${key}:${opts.count}`;
  return key;
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

import { ActivityCard } from "./ActivityCard";

const base: ActivityLogResponseDto = {
  id: "activity-1",
  recordedAt: "2026-09-01T09:30:00.000Z",
  type: ActivityType.Walk,
};

describe("ActivityCard", () => {
  it("shows only summary information", () => {
    const { queryByText } = render(
      <ActivityCard
        activity={{
          ...base,
          intensity: ActivityIntensity.High,
          steps: 2400,
          durationMinutes: 30,
          note: "Muddy trail",
          location: "Riverside Park@50.450100,30.523400",
        }}
        onPress={jest.fn()}
      />
    );

    // Headline metric only; the rest belongs to the details drawer.
    expect(queryByText("activity:metrics.duration:30")).toBeTruthy();
    expect(queryByText("Muddy trail")).toBeNull();
    expect(queryByText("Riverside Park")).toBeNull();
    expect(queryByText("activity:intensities.High")).toBeNull();
    expect(queryByText("activity:metrics.steps:2400")).toBeNull();
  });

  it("falls back to steps when there is no duration", () => {
    const { queryByText } = render(
      <ActivityCard activity={{ ...base, steps: 2400 }} onPress={jest.fn()} />
    );

    expect(queryByText("activity:metrics.steps:2400")).toBeTruthy();
  });

  it("renders no metric line when nothing was measured", () => {
    const { queryByText } = render(<ActivityCard activity={base} onPress={jest.fn()} />);

    expect(queryByText("activity:metrics.duration:0")).toBeNull();
    expect(queryByText("activity:metrics.steps:0")).toBeNull();
  });

  it("hands the activity to onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByRole } = render(<ActivityCard activity={base} onPress={onPress} />);

    fireEvent.press(getByRole("button"));

    expect(onPress).toHaveBeenCalledWith(base);
  });

  it("exposes no inline delete control", () => {
    const { queryAllByRole } = render(<ActivityCard activity={base} onPress={jest.fn()} />);

    // The card itself is the only pressable — deletion moved into the drawer.
    expect(queryAllByRole("button")).toHaveLength(1);
  });
});
