/// <reference types="jest" />

import type { WeightLogFormValues } from "../schemas/weight-log.schema";

import { buildWeightLogCreate } from "./buildWeightLogCreate";

const form = (overrides: Partial<WeightLogFormValues> = {}): WeightLogFormValues => ({
  weightKg: "4.1",
  measuredAt: "2026-10-09T09:00:00.000Z",
  notes: "",
  ...overrides,
});

describe("buildWeightLogCreate", () => {
  it("sends the weight as a number, with blank notes as null", () => {
    expect(buildWeightLogCreate(form())).toEqual({
      measuredAt: "2026-10-09T09:00:00.000Z",
      weightKg: 4.1,
      notes: null,
    });
  });

  it("trims notes, and treats whitespace-only notes as blank", () => {
    expect(buildWeightLogCreate(form({ notes: "  after the vet  " })).notes).toBe("after the vet");
    expect(buildWeightLogCreate(form({ notes: "   " })).notes).toBeNull();
  });

  it("leaves the weight out rather than sending NaN or zero when it cannot be read", () => {
    const dto = buildWeightLogCreate(form({ weightKg: "abc" }));

    expect("weightKg" in dto).toBe(false);
  });
});
