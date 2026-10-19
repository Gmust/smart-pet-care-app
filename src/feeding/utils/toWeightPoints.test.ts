/// <reference types="jest" />

import type { PetWeightLogResponseDto } from "@/api/generated";

import { toWeightPoints } from "./toWeightPoints";

// The DTO types `weightKg` without `null`, but a null weight is exactly what some cases check.
const entry = (measuredAt: string, weightKg: number | string | null): PetWeightLogResponseDto =>
  ({
    id: `w-${measuredAt}`,
    petId: "pet-1",
    measuredAt,
    weightKg,
    createdAt: measuredAt,
  }) as PetWeightLogResponseDto;

describe("toWeightPoints", () => {
  it("returns nothing for empty and undefined input", () => {
    expect(toWeightPoints([])).toEqual([]);
    expect(toWeightPoints(undefined)).toEqual([]);
  });

  it("plots a single measurement", () => {
    expect(toWeightPoints([entry("2026-10-08T10:00:00.000Z", 4.1)])).toEqual([
      { measuredAt: "2026-10-08T10:00:00.000Z", weightKg: 4.1 },
    ]);
  });

  it("orders points oldest first", () => {
    const points = toWeightPoints([
      entry("2026-10-08T10:00:00.000Z", 4.1),
      entry("2026-09-01T10:00:00.000Z", 4.3),
    ]);

    expect(points.map((point) => point.weightKg)).toEqual([4.3, 4.1]);
  });

  it("reads a weight sent as a numeric string", () => {
    expect(toWeightPoints([entry("2026-10-08T10:00:00.000Z", "4.1")])[0].weightKg).toBe(4.1);
  });

  it("drops entries that would plot as a bogus zero point", () => {
    expect(toWeightPoints([entry("2026-10-08T10:00:00.000Z", null)])).toEqual([]);
    expect(toWeightPoints([entry("2026-10-08T10:00:00.000Z", 0)])).toEqual([]);
    expect(toWeightPoints([entry("2026-10-08T10:00:00.000Z", "abc")])).toEqual([]);
  });

  it("drops entries with an unusable date", () => {
    expect(toWeightPoints([entry("", 4.1)])).toEqual([]);
    expect(toWeightPoints([entry("not-a-date", 4.1)])).toEqual([]);
  });
});
