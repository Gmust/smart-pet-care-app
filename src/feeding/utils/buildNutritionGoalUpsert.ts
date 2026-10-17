import type { UpsertNutritionGoalDto } from "@/api/generated";

import type { NutritionGoalFormValues } from "../schemas/nutrition-goal.schema";

import { toApiNumber } from "./toApiNumber";

// PUT replaces the whole goal, so all four keys are sent and a blank becomes `null`: that is how a
// target is cleared. A unit without a portion target is dropped, not sent next to a null amount.
export const buildNutritionGoalUpsert = (
  values: NutritionGoalFormValues
): UpsertNutritionGoalDto => {
  const dailyPortionTarget = toApiNumber(values.dailyPortionTarget);

  return {
    dailyCalorieTarget: toApiNumber(values.dailyCalorieTarget),
    dailyPortionTarget,
    portionUnit: dailyPortionTarget !== null ? values.portionUnit || null : null,
    mealsPerDay: toApiNumber(values.mealsPerDay),
  };
};
