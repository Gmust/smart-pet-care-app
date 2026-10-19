import dayjs from "dayjs";

import type { NutritionAnalysisResponseDto } from "@/api/generated";

import { toApiNumber } from "./toApiNumber";

export const describeAnalysis = (analysis: NutritionAnalysisResponseDto) => {
  const deviation = Math.round(toApiNumber(analysis.deviationPct) ?? 0);

  return {
    actual: Math.round(toApiNumber(analysis.actualCalories) ?? 0),
    target: Math.round(toApiNumber(analysis.targetCalories) ?? 0),
    deviationLabel: `${deviation > 0 ? "+" : deviation < 0 ? "−" : ""}${Math.abs(deviation)}%`,
    mealCount: toApiNumber(analysis.mealCount) ?? 0,
    dateLabel: dayjs(analysis.date).format("MMM D"),
  };
};
