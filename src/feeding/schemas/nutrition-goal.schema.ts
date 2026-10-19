import type { TFunction } from "i18next";
import { z } from "zod";

import type { PortionUnit } from "@/api/generated";

import { PORTION_UNITS } from "../constants";

import { optionalPositiveNumber, optionalPositiveWholeNumber } from "./number-fields";

export type NutritionGoalFormValues = {
  dailyCalorieTarget: string;
  dailyPortionTarget: string;
  portionUnit: PortionUnit | "";
  mealsPerDay: string;
};

// PUT takes the whole goal and accepts `null` for every target, so any field can be cleared.
export const nutritionGoalSchema = (t: TFunction<["feeding", "common"]>) =>
  z
    .object({
      dailyCalorieTarget: optionalPositiveWholeNumber(
        t("feeding:forms.goal.errors.calorieInvalid")
      ),
      dailyPortionTarget: optionalPositiveNumber(t("feeding:forms.goal.errors.portionInvalid")),
      portionUnit: z.union([z.literal(""), z.enum(PORTION_UNITS)]),
      mealsPerDay: optionalPositiveWholeNumber(t("feeding:forms.goal.errors.mealsInvalid")),
    })
    .refine((value) => !(value.dailyPortionTarget.trim() !== "" && value.portionUnit === ""), {
      message: t("feeding:forms.goal.errors.portionUnitRequired"),
      path: ["portionUnit"],
    })
    // An all-blank goal would store a row that targets nothing.
    .refine(
      (value) =>
        value.dailyCalorieTarget.trim() !== "" ||
        value.dailyPortionTarget.trim() !== "" ||
        value.mealsPerDay.trim() !== "",
      {
        message: t("feeding:forms.goal.errors.empty"),
        path: ["dailyCalorieTarget"],
      }
    );
