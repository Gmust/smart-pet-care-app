import type { TFunction } from "i18next";
import { z } from "zod";

import type { PortionUnit } from "@/api/generated";
import { FoodType } from "@/api/generated";

import { PORTION_UNITS } from "../constants";

import { optionalPositiveNumber, optionalWholeNumber } from "./number-fields";

const FOOD_TYPE_VALUES = Object.values(FoodType);

export type FeedingLogFormValues = {
  fedAt: string;
  foodType: FoodType | "";
  foodName: string;
  portionAmount: string;
  portionUnit: PortionUnit | "";
  approxCalories: string;
  notes: string;
};

type Options = {
  // A stored portion cannot be cleared: neither `PatchFieldOfdecimal` nor `PatchFieldOfPortionUnit`
  // has a `null` member. Requiring it keeps the form from offering a change it cannot persist.
  requirePortion?: boolean;
};

export const feedingLogSchema = (
  t: TFunction<["feeding", "common"]>,
  { requirePortion = false }: Options = {}
) =>
  z
    .object({
      fedAt: z
        .string()
        .min(1, t("feeding:forms.meal.errors.fedAtRequired"))
        .refine((value) => !value || new Date(value).getTime() <= Date.now(), {
          message: t("feeding:forms.meal.errors.fedAtFuture"),
        }),
      foodType: z.union([z.literal(""), z.enum(FOOD_TYPE_VALUES)]).refine((value) => value !== "", {
        message: t("feeding:forms.meal.errors.foodTypeRequired"),
      }),
      foodName: z.string(),
      portionAmount: optionalPositiveNumber(t("feeding:forms.meal.errors.portionInvalid")),
      portionUnit: z.union([z.literal(""), z.enum(PORTION_UNITS)]),
      approxCalories: optionalWholeNumber(t("feeding:forms.meal.errors.caloriesInvalid")),
      notes: z.string(),
    })
    .refine(
      (value) =>
        !(value.portionAmount.trim() !== "" && value.portionUnit === "") &&
        !(requirePortion && value.portionUnit === ""),
      {
        message: t("feeding:forms.meal.errors.portionUnitRequired"),
        path: ["portionUnit"],
      }
    )
    .refine((value) => !requirePortion || value.portionAmount.trim() !== "", {
      message: t("feeding:forms.meal.errors.portionRequired"),
      path: ["portionAmount"],
    });
