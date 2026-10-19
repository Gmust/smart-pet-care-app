import type { WeightPoint } from "../types";

export type WeightChange = {
  deltaKg: number;
  since: string;
};

// Rounded: subtracting two decimals leaves float noise (`4.1 - 4.3` is `-0.19999999999999996`).
export const buildWeightChange = (points: WeightPoint[]): WeightChange | null => {
  const latest = points.at(-1);
  const previous = points.at(-2);
  if (!latest || !previous) return null;

  return {
    deltaKg: Number((latest.weightKg - previous.weightKg).toFixed(2)),
    since: previous.measuredAt,
  };
};
