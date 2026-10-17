import type { TFunction } from "i18next";
import { z } from "zod";

import type { PortionUnit } from "@/api/generated";

import { PORTION_UNITS } from "../constants";

import { optionalPositiveNumber } from "./number-fields";

export type NutritionGoalFormValues = {
  dailyCalorieTarget: string;
  dailyPortionTarget: string;
  portionUnit: PortionUnit | "";
  mealsPerDay: string;
};

const optionalWholeNumber = (message: string) =>
  z.string().refine((value) => {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    return /^\d+$/.test(trimmed) && Number(trimmed) > 0;
  }, message);

// PUT takes the whole goal and accepts `null` for every target, so any field can be cleared.
export const nutritionGoalSchema = (t: TFunction<["feeding", "common"]>) =>
  z
    .object({
      dailyCalorieTarget: optionalWholeNumber(t("feeding:forms.goal.errors.calorieInvalid")),
      dailyPortionTarget: optionalPositiveNumber(t("feeding:forms.goal.errors.portionInvalid")),
      portionUnit: z.union([z.literal(""), z.enum(PORTION_UNITS)]),
      mealsPerDay: optionalWholeNumber(t("feeding:forms.goal.errors.mealsInvalid")),
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
