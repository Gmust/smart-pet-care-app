/// <reference types="jest" />

import { initReactI18next } from "react-i18next";
import { act, fireEvent, render } from "@testing-library/react-native";
import i18next from "i18next";

import enFeeding from "../locales/en.json";
import type { WeekSummary } from "../types";

import { WeekBarsCard } from "./WeekBarsCard";

beforeAll(async () => {
  await i18next.use(initReactI18next).init({
    lng: "en",
    resources: { en: { feeding: enFeeding } },
  });
});

const week = (overrides: Partial<WeekSummary> = {}): WeekSummary => ({
  metric: "calories",
  bars: [
    { date: "2026-10-05", value: 0, isToday: false },
    { date: "2026-10-06", value: 412.4, isToday: false },
    { date: "2026-10-07", value: 800, isToday: true },
  ],
  average: 404,
  target: 700,
  deviationPct: -42,
  ...overrides,
});

describe("WeekBarsCard", () => {
  it("shows no values until the card is tapped", () => {
    const screen = render(<WeekBarsCard week={week()} />);

    expect(screen.queryByText("412")).toBeNull();
    expect(screen.queryByText("800")).toBeNull();
  });

  it("does not flash the values on a bare touch, which may turn into a scroll", () => {
    const screen = render(<WeekBarsCard week={week()} />);

    fireEvent(screen.getByTestId("week-card"), "pressIn");

    expect(screen.queryByText("800")).toBeNull();
  });

  it("shows the value of every bar above zero on a tap, and hides them on the next", () => {
    const screen = render(<WeekBarsCard week={week()} />);
    const card = screen.getByTestId("week-card");

    fireEvent.press(card);

    expect(screen.getByText("412")).toBeTruthy();
    expect(screen.getByText("800")).toBeTruthy();
    expect(screen.queryByText("0")).toBeNull();

    fireEvent.press(card);

    expect(screen.queryByText("412")).toBeNull();
  });

  it("hides the values by itself a few seconds after a tap", () => {
    jest.useFakeTimers();
    try {
      const screen = render(<WeekBarsCard week={week()} />);

      fireEvent.press(screen.getByTestId("week-card"));
      act(() => jest.advanceTimersByTime(2900));
      expect(screen.getByText("800")).toBeTruthy();

      act(() => jest.advanceTimersByTime(200));
      expect(screen.queryByText("800")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("restarts the countdown when the values are shown again", () => {
    jest.useFakeTimers();
    try {
      const screen = render(<WeekBarsCard week={week()} />);
      const card = screen.getByTestId("week-card");

      fireEvent.press(card);
      act(() => jest.advanceTimersByTime(2000));
      fireEvent.press(card);
      fireEvent.press(card);
      act(() => jest.advanceTimersByTime(1500));

      expect(screen.getByText("800")).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it("keeps the values for as long as a finger is held, then hides them on release", () => {
    jest.useFakeTimers();
    try {
      const screen = render(<WeekBarsCard week={week()} />);
      const card = screen.getByTestId("week-card");

      fireEvent(card, "pressIn");
      fireEvent(card, "longPress");
      act(() => jest.advanceTimersByTime(10_000));
      expect(screen.getByText("800")).toBeTruthy();

      fireEvent(card, "pressOut");
      expect(screen.queryByText("800")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it.each([
    ["release first", ["pressOut", "press"]],
    ["tap first", ["press", "pressOut"]],
  ] as const)(
    "does not drop the values from a tap when its own release arrives (%s)",
    (_, order) => {
      const screen = render(<WeekBarsCard week={week()} />);
      const card = screen.getByTestId("week-card");

      fireEvent(card, "pressIn");
      for (const event of order) fireEvent(card, event);

      expect(screen.getByText("800")).toBeTruthy();
    }
  );

  it("describes each bar to a screen reader, in the unit the chart measures", () => {
    const calories = render(<WeekBarsCard week={week()} />);

    expect(calories.getByLabelText("Today, 800 kcal")).toBeTruthy();
    expect(calories.getByLabelText(/, 412 kcal$/)).toBeTruthy();

    const meals = render(
      <WeekBarsCard
        week={week({
          metric: "meals",
          bars: [{ date: "2026-10-07", value: 3, isToday: true }],
          target: null,
        })}
      />
    );

    expect(meals.getByLabelText("Today, 3 meals")).toBeTruthy();
  });
});
