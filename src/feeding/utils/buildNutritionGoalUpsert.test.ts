/// <reference types="jest" />

import { PortionUnit } from "@/api/generated";

import type { NutritionGoalFormValues } from "../schemas/nutrition-goal.schema";

import { buildNutritionGoalUpsert } from "./buildNutritionGoalUpsert";

const form = (overrides: Partial<NutritionGoalFormValues> = {}): NutritionGoalFormValues => ({
  dailyCalorieTarget: "",
  dailyPortionTarget: "",
  portionUnit: "",
  mealsPerDay: "",
  ...overrides,
});

describe("buildNutritionGoalUpsert", () => {
  it("turns the typed numbers into numbers", () => {
    expect(
      buildNutritionGoalUpsert(
        form({
          dailyCalorieTarget: "420",
          dailyPortionTarget: "200.5",
          portionUnit: PortionUnit.Gram,
          mealsPerDay: "3",
        })
      )
    ).toEqual({
      dailyCalorieTarget: 420,
      dailyPortionTarget: 200.5,
      portionUnit: PortionUnit.Gram,
      mealsPerDay: 3,
    });
  });

  it("sends every key, with null for a cleared target, because PUT replaces the whole goal", () => {
    const dto = buildNutritionGoalUpsert(form({ dailyCalorieTarget: "420" }));

    expect(dto).toEqual({
      dailyCalorieTarget: 420,
      dailyPortionTarget: null,
      portionUnit: null,
      mealsPerDay: null,
    });
  });

  it("never turns a blank field into zero", () => {
    const dto = buildNutritionGoalUpsert(form({ mealsPerDay: "  ", dailyCalorieTarget: "420" }));

    expect(dto.mealsPerDay).toBeNull();
  });

  it("drops a unit that has no portion target instead of storing 'g' of nothing", () => {
    const dto = buildNutritionGoalUpsert(
      form({ dailyCalorieTarget: "420", portionUnit: PortionUnit.Gram })
    );

    expect(dto.dailyPortionTarget).toBeNull();
    expect(dto.portionUnit).toBeNull();
  });
});
