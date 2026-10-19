import type { WeightPoint } from "../types";

export const buildWeightPeriodChange = (points: WeightPoint[]): number | null => {
  const first = points.at(0);
  const last = points.at(-1);
  if (!first || !last || points.length < 2) return null;

  return Number((last.weightKg - first.weightKg).toFixed(2));
};
