/// <reference types="jest" />

import type { TFunction } from "i18next";

import { FoodType, PortionUnit } from "@/api/generated";

import { feedingLogSchema } from "./feeding-log.schema";

// Passthrough so assertions can match on the translation key itself.
// `as unknown as TFunction` is unavoidable here: TFunction's overloads model the
// full i18next key/interpolation surface, which a one-line identity stub cannot
// structurally satisfy. Mirrors the existing repo test convention.
const t = ((key: string) => key) as unknown as TFunction<["feeding", "common"]>;

const schema = feedingLogSchema(t);

const valid = {
  fedAt: "2026-10-08T08:05:00.000Z",
  foodType: FoodType.DryFood,
  foodName: "Royal Canin Renal",
  portionAmount: "85",
  portionUnit: PortionUnit.Gram,
  approxCalories: "170",
  notes: "morning",
};

const firstMessage = (result: ReturnType<typeof schema.safeParse>): string | undefined =>
  result.success ? undefined : result.error.issues[0]?.message;

describe("feedingLogSchema", () => {
  it("accepts a filled-in meal", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("accepts a meal with only the required fields", () => {
    const result = schema.safeParse({
      ...valid,
      foodName: "",
      portionAmount: "",
      portionUnit: "",
      approxCalories: "",
      notes: "",
    });

    expect(result.success).toBe(true);
  });

  it("requires a food type", () => {
    expect(firstMessage(schema.safeParse({ ...valid, foodType: "" }))).toBe(
      "feeding:forms.meal.errors.foodTypeRequired"
    );
  });

  it("requires a time and rejects the future", () => {
    expect(firstMessage(schema.safeParse({ ...valid, fedAt: "" }))).toBe(
      "feeding:forms.meal.errors.fedAtRequired"
    );

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(firstMessage(schema.safeParse({ ...valid, fedAt: tomorrow }))).toBe(
      "feeding:forms.meal.errors.fedAtFuture"
    );
  });

  it("rejects a non-positive or non-numeric portion", () => {
    expect(firstMessage(schema.safeParse({ ...valid, portionAmount: "0" }))).toBe(
      "feeding:forms.meal.errors.portionInvalid"
    );
    expect(firstMessage(schema.safeParse({ ...valid, portionAmount: "-5" }))).toBe(
      "feeding:forms.meal.errors.portionInvalid"
    );
    expect(firstMessage(schema.safeParse({ ...valid, portionAmount: "abc" }))).toBe(
      "feeding:forms.meal.errors.portionInvalid"
    );
  });

  it("rejects fractional calories", () => {
    expect(firstMessage(schema.safeParse({ ...valid, approxCalories: "170.5" }))).toBe(
      "feeding:forms.meal.errors.caloriesInvalid"
    );
  });

  it("rejects a portion with no unit — 85 of what?", () => {
    expect(firstMessage(schema.safeParse({ ...valid, portionUnit: "" }))).toBe(
      "feeding:forms.meal.errors.portionUnitRequired"
    );
  });

  describe("editing a meal that already stores a portion", () => {
    const editSchema = feedingLogSchema(t, { requirePortion: true });

    it("refuses to clear the portion, because PATCH cannot persist that", () => {
      const result = editSchema.safeParse({ ...valid, portionAmount: "", portionUnit: "" });

      expect(result.success).toBe(false);
    });

    it("still allows changing the portion to another value", () => {
      expect(editSchema.safeParse({ ...valid, portionAmount: "100" }).success).toBe(true);
    });
  });

  it("accepts a decimal comma in the portion", () => {
    expect(schema.safeParse({ ...valid, portionAmount: "7,5" }).success).toBe(true);
  });

  it("ignores spaces around a number and treats a spaces-only optional field as blank", () => {
    expect(
      schema.safeParse({ ...valid, portionAmount: " 85 ", approxCalories: " 170 " }).success
    ).toBe(true);
    expect(
      schema.safeParse({
        ...valid,
        portionAmount: "   ",
        portionUnit: "",
        approxCalories: "   ",
      }).success
    ).toBe(true);
  });

  it("accepts only plain decimals as a portion, not exponents, hex or a bare dot", () => {
    for (const portionAmount of ["1e3", "0x10", ".5", "5."]) {
      expect(firstMessage(schema.safeParse({ ...valid, portionAmount }))).toBe(
        "feeding:forms.meal.errors.portionInvalid"
      );
    }
  });

  it("does not count a spaces-only portion as given when editing a log that has one", () => {
    const editSchema = feedingLogSchema(t, { requirePortion: true });

    expect(firstMessage(editSchema.safeParse({ ...valid, portionAmount: "   " }))).toBe(
      "feeding:forms.meal.errors.portionRequired"
    );
  });
});
