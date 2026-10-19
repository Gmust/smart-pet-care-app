/// <reference types="jest" />

import type { WeightPoint } from "../types";

import { buildWeightChange } from "./buildWeightChange";

const point = (measuredAt: string, weightKg: number): WeightPoint => ({ measuredAt, weightKg });

describe("buildWeightChange", () => {
  it("has nothing to compare with fewer than two measurements", () => {
    expect(buildWeightChange([])).toBeNull();
    expect(buildWeightChange([point("2026-10-01T09:00:00.000Z", 4.1)])).toBeNull();
  });

  it("compares the latest with the one before it, and names that earlier date", () => {
    const change = buildWeightChange([
      point("2026-08-01T09:00:00.000Z", 5.0),
      point("2026-08-28T09:00:00.000Z", 4.3),
      point("2026-10-09T09:00:00.000Z", 4.1),
    ]);

    expect(change).toEqual({ deltaKg: -0.2, since: "2026-08-28T09:00:00.000Z" });
  });

  it("does not print floating-point noise", () => {
    const change = buildWeightChange([
      point("2026-08-28T09:00:00.000Z", 4.3),
      point("2026-10-09T09:00:00.000Z", 4.1),
    ]);

    expect(change?.deltaKg).toBe(-0.2);
  });

  it("reports a gain as positive and no change as zero", () => {
    expect(
      buildWeightChange([
        point("2026-09-01T00:00:00.000Z", 4.0),
        point("2026-10-01T00:00:00.000Z", 4.5),
      ])?.deltaKg
    ).toBe(0.5);
    expect(
      buildWeightChange([
        point("2026-09-01T00:00:00.000Z", 4.0),
        point("2026-10-01T00:00:00.000Z", 4.0),
      ])?.deltaKg
    ).toBe(0);
  });
});
