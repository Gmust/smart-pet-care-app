/// <reference types="jest" />

import type { DailyNutritionSummaryResponseDto } from "@/api/generated";

import { buildWeekSummary, type WeekDayInput } from "./buildWeekSummary";

const summary = (
  totalCalories: number | string,
  dailyCalorieTarget?: number | string | null
): DailyNutritionSummaryResponseDto => ({
  totalCalories,
  ...(dailyCalorieTarget === undefined ? {} : { goal: { dailyCalorieTarget } }),
});

const meals = (
  mealCount: number | string,
  mealsPerDay?: number | string | null
): DailyNutritionSummaryResponseDto => ({
  totalCalories: 0,
  mealCount,
  ...(mealsPerDay === undefined ? {} : { goal: { mealsPerDay } }),
});

const day = (date: string, dto?: DailyNutritionSummaryResponseDto): WeekDayInput => ({
  date,
  summary: dto,
});

describe("buildWeekSummary", () => {
  it("returns no bars and no aggregates for an empty week", () => {
    expect(buildWeekSummary([])).toEqual({
      metric: "meals",
      bars: [],
      average: null,
      target: null,
      deviationPct: null,
    });
  });

  it("marks only the last day as today", () => {
    const { bars } = buildWeekSummary([
      day("2026-10-06", summary(100)),
      day("2026-10-07", summary(200)),
      day("2026-10-08", summary(300)),
    ]);

    expect(bars.map((bar) => bar.isToday)).toEqual([false, false, true]);
  });

  it("reads calories whether the API sends a number or a numeric string", () => {
    const { bars, average } = buildWeekSummary([
      day("2026-10-07", summary("200")),
      day("2026-10-08", summary(400)),
    ]);

    expect(bars.map((bar) => bar.value)).toEqual([200, 400]);
    expect(average).toBe(300);
  });

  it("draws a day that has not loaded as zero but leaves it out of the average", () => {
    const { bars, average } = buildWeekSummary([
      day("2026-10-07", summary(300)),
      day("2026-10-08"),
    ]);

    expect(bars.map((bar) => bar.value)).toEqual([300, 0]);
    expect(average).toBe(300);
  });

  it("has no average when nothing loaded", () => {
    expect(buildWeekSummary([day("2026-10-08")]).average).toBeNull();
  });

  it("reports the signed deviation against the goal", () => {
    const below = buildWeekSummary([day("2026-10-08", summary(380, 420))]);
    expect(below.deviationPct).toBe(-10);

    const above = buildWeekSummary([day("2026-10-08", summary(462, 420))]);
    expect(above.deviationPct).toBe(10);
  });

  it("takes the newest goal when it changed mid-week", () => {
    const { deviationPct, target } = buildWeekSummary([
      day("2026-10-07", summary(400, 800)),
      day("2026-10-08", summary(400, 400)),
    ]);

    expect(target).toBe(400);
    expect(deviationPct).toBe(0);
  });

  it("has no deviation without a goal", () => {
    const result = buildWeekSummary([day("2026-10-08", summary(380))]);

    expect(result.target).toBeNull();
    expect(result.deviationPct).toBeNull();
  });

  it("has no deviation when the target is zero, rather than dividing by it", () => {
    const { deviationPct } = buildWeekSummary([day("2026-10-08", summary(380, 0))]);

    expect(deviationPct).toBeNull();
  });

  describe("when no logged meal has calories", () => {
    it("counts meals instead of drawing a week of flat zeros", () => {
      const { metric, bars } = buildWeekSummary([
        day("2026-10-07", meals(2)),
        day("2026-10-08", meals("3")),
      ]);

      expect(metric).toBe("meals");
      expect(bars.map((bar) => bar.value)).toEqual([2, 3]);
    });

    it("measures the goal in meals per day, not calories", () => {
      const { target, deviationPct } = buildWeekSummary([
        day("2026-10-07", meals(2, 4)),
        day("2026-10-08", meals(2, 4)),
      ]);

      expect(target).toBe(4);
      expect(deviationPct).toBe(-50);
    });

    it("keeps one decimal on the average", () => {
      const { average } = buildWeekSummary([
        day("2026-10-06", meals(2)),
        day("2026-10-07", meals(2)),
        day("2026-10-08", meals(3)),
      ]);

      expect(average).toBe(2.3);
    });
  });

  it("stays on calories as soon as one day has them", () => {
    const { metric, bars } = buildWeekSummary([
      day("2026-10-07", meals(2)),
      day("2026-10-08", summary(300)),
    ]);

    expect(metric).toBe("calories");
    expect(bars.map((bar) => bar.value)).toEqual([0, 300]);
  });

  it("has no target once the newest day shows the goal was removed", () => {
    const { target, deviationPct } = buildWeekSummary([
      day("2026-10-07", summary(400, 800)),
      day("2026-10-08", summary(400)),
    ]);

    expect(target).toBeNull();
    expect(deviationPct).toBeNull();
  });

  it("keeps the goal when the newest day has not loaded", () => {
    expect(buildWeekSummary([day("2026-10-07", summary(400, 800)), day("2026-10-08")]).target).toBe(
      800
    );
  });

  it("rounds the calorie average to the nearest kcal, not down", () => {
    const { average } = buildWeekSummary([
      day("2026-10-07", summary(400)),
      day("2026-10-08", summary(409)),
    ]);

    expect(average).toBe(405);
  });

  it("rounds the meal average to one decimal, not down", () => {
    const { average } = buildWeekSummary([
      day("2026-10-05", meals(2)),
      day("2026-10-06", meals(2)),
      day("2026-10-07", meals(2)),
      day("2026-10-08", meals(3)),
    ]);

    expect(average).toBe(2.3);
  });

  it("rounds the deviation to the nearest percent, not down", () => {
    const { deviationPct } = buildWeekSummary([
      day("2026-10-07", summary(400, 700)),
      day("2026-10-08", summary(410, 700)),
    ]);

    expect(deviationPct).toBe(-42);
  });
});
