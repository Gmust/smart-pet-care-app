/// <reference types="jest" />

import type { PetWeightLogResponseDto } from "@/api/generated";

import type { WeightLogFormValues } from "../schemas/weight-log.schema";

import { buildWeightLogPatch } from "./buildWeightLogPatch";

// Numbers arrive as strings from this API as often as not, so the stored log
// uses a string on purpose.
const log = {
  id: "w-1",
  weightKg: "4.1",
  measuredAt: "2026-10-09T09:00:00.000Z",
  notes: "after the vet",
};

const form = (overrides: Partial<WeightLogFormValues> = {}): WeightLogFormValues => ({
  weightKg: "4.1",
  measuredAt: "2026-10-09T09:00:00.000Z",
  notes: "after the vet",
  ...overrides,
});

describe("buildWeightLogPatch", () => {
  it("sends nothing when nothing changed, even though the API stored the weight as a string", () => {
    expect(buildWeightLogPatch(form(), log)).toEqual({});
  });

  it("sends only the weight when only the weight changed", () => {
    expect(buildWeightLogPatch(form({ weightKg: "4.3" }), log)).toEqual({ weightKg: 4.3 });
  });

  it("treats the same number typed another way as unchanged", () => {
    expect(buildWeightLogPatch(form({ weightKg: "4.10" }), log)).toEqual({});
  });

  it("sends the new time when only the time changed", () => {
    expect(buildWeightLogPatch(form({ measuredAt: "2026-10-09T10:30:00.000Z" }), log)).toEqual({
      measuredAt: "2026-10-09T10:30:00.000Z",
    });
  });

  it("clears the notes with null when they are emptied", () => {
    expect(buildWeightLogPatch(form({ notes: "  " }), log)).toEqual({ notes: null });
  });

  it("does not send an unreadable weight, since the field cannot be cleared", () => {
    expect(buildWeightLogPatch(form({ weightKg: "" }), log)).toEqual({});
  });

  it("sends nothing for a stored log without notes when the notes stay empty", () => {
    const withoutNotes: PetWeightLogResponseDto = { ...log, notes: undefined };

    expect(buildWeightLogPatch(form({ notes: "" }), withoutNotes)).toEqual({});
  });
});
