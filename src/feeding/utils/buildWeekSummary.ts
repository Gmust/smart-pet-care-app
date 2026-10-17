import type { DailyNutritionSummaryResponseDto } from "@/api/generated";

import type { WeekMetric, WeekSummary } from "../types";

import { toApiNumber } from "./toApiNumber";

export type WeekDayInput = {
  date: string;
  summary?: DailyNutritionSummaryResponseDto;
};

// Days must be oldest-first: the last one is today. A day that has not loaded draws as a zero bar
// but stays out of the average, or it would drag the figure down.
export const buildWeekSummary = (days: WeekDayInput[]): WeekSummary => {
  const hasCalories = days.some((day) => (toApiNumber(day.summary?.totalCalories) ?? 0) > 0);
  const metric: WeekMetric = hasCalories ? "calories" : "meals";

  const valueOf = (summary?: DailyNutritionSummaryResponseDto) =>
    toApiNumber(metric === "calories" ? summary?.totalCalories : summary?.mealCount);

  const bars = days.map((day, index) => ({
    date: day.date,
    value: valueOf(day.summary) ?? 0,
    isToday: index === days.length - 1,
  }));

  const loaded = days.filter((day) => day.summary !== undefined);
  const mean =
    loaded.length > 0
      ? loaded.reduce((sum, day) => sum + (valueOf(day.summary) ?? 0), 0) / loaded.length
      : null;
  const average =
    mean === null ? null : metric === "calories" ? Math.round(mean) : Math.round(mean * 10) / 10;

  // The goal can be set or cleared mid-week, so the newest loaded day decides: a
  // day with no goal means it was removed, not "keep the older one".
  const newestGoal = loaded.at(-1)?.summary?.goal;
  const target = toApiNumber(
    metric === "calories" ? newestGoal?.dailyCalorieTarget : newestGoal?.mealsPerDay
  );

  const deviationPct =
    average !== null && target !== null && target > 0
      ? Math.round(((average - target) / target) * 100)
      : null;

  return { metric, bars, average, target, deviationPct };
};
