/// <reference types="jest" />

import { FoodType, PortionUnit } from "@/api/generated";

import type { FeedingLogFormValues } from "../schemas/feeding-log.schema";

import { buildFeedingLogCreate } from "./buildFeedingLogCreate";

const form = (overrides: Partial<FeedingLogFormValues> = {}): FeedingLogFormValues => ({
  fedAt: "2026-10-09T08:05:00.000Z",
  foodType: FoodType.DryFood,
  foodName: "",
  portionAmount: "",
  portionUnit: "",
  approxCalories: "",
  notes: "",
  ...overrides,
});

describe("buildFeedingLogCreate", () => {
  it("sends the required fields and nulls everything the user left blank", () => {
    expect(buildFeedingLogCreate(form())).toEqual({
      fedAt: "2026-10-09T08:05:00.000Z",
      foodType: FoodType.DryFood,
      foodName: null,
      portionAmount: null,
      portionUnit: null,
      approxCalories: null,
      notes: null,
    });
  });

  it("turns the typed numbers into numbers", () => {
    const dto = buildFeedingLogCreate(
      form({ portionAmount: "85.5", portionUnit: PortionUnit.Gram, approxCalories: "170" })
    );

    expect(dto.portionAmount).toBe(85.5);
    expect(dto.portionUnit).toBe(PortionUnit.Gram);
    expect(dto.approxCalories).toBe(170);
  });

  it("trims text, and treats whitespace-only text as blank", () => {
    const dto = buildFeedingLogCreate(form({ foodName: "  Royal Canin  ", notes: "   " }));

    expect(dto.foodName).toBe("Royal Canin");
    expect(dto.notes).toBeNull();
  });

  it("drops a unit that has no amount instead of storing 'g' of nothing", () => {
    const dto = buildFeedingLogCreate(form({ portionAmount: "", portionUnit: PortionUnit.Gram }));

    expect(dto.portionAmount).toBeNull();
    expect(dto.portionUnit).toBeNull();
  });

  it("never sends a zero for a field left empty", () => {
    const dto = buildFeedingLogCreate(form({ approxCalories: "  " }));

    expect(dto.approxCalories).toBeNull();
  });

  it("omits the food type when none is chosen, since the API takes no null for it", () => {
    const dto = buildFeedingLogCreate(form({ foodType: "" }));

    expect("foodType" in dto).toBe(false);
  });
});
