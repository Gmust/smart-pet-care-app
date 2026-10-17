import type { WeightPoint } from "../types";

import { buildWeightPeriodChange } from "./buildWeightPeriodChange";

const point = (weightKg: number, day: number): WeightPoint => ({
  measuredAt: `2026-09-${String(day).padStart(2, "0")}T09:00:00.000Z`,
  weightKg,
});

describe("buildWeightPeriodChange", () => {
  it("is the latest weight minus the first of the period, not minus the one before", () => {
    expect(buildWeightPeriodChange([point(4.4, 1), point(4.9, 2), point(4.1, 3)])).toBe(-0.3);
  });

  it("drops the float noise of subtracting decimals", () => {
    expect(buildWeightPeriodChange([point(4.3, 1), point(4.1, 2)])).toBe(-0.2);
  });

  it("has nothing to compare below two measurements", () => {
    expect(buildWeightPeriodChange([])).toBeNull();
    expect(buildWeightPeriodChange([point(4.1, 1)])).toBeNull();
  });
});
