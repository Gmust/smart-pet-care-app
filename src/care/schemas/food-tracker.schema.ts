import type { WeightUnit } from "../types";
import type { TFunction } from "i18next";
import { z } from "zod";

export type FoodTrackerFormValues = {
  foodName: string;
  packageWeight: number;
  packageWeightUnit: WeightUnit;
  packageCount: number;
  openedAt: string;
  portionWeight: number;
  portionWeightUnit: "g";
  feedingFrequency: "daily" | "weekly";
  feedingsPerDay?: number;
  feedingsPerWeek?: number;
};

export const foodTrackerSchema = (t: TFunction<["care", "common"]>) =>
  z
    .object({
      foodName: z.string().trim().min(1, t("care:forms.foodTracker.errors.foodNameRequired")),
      packageWeight: z.number().positive(t("care:forms.foodTracker.errors.packageWeightRequired")),
      packageWeightUnit: z.enum(["g", "kg"]),
      packageCount: z
        .number()
        .int()
        .positive(t("care:forms.foodTracker.errors.packageCountRequired")),
      openedAt: z.string().min(1, t("care:forms.foodTracker.errors.openedAtRequired")),
      portionWeight: z.number().positive(t("care:forms.foodTracker.errors.portionWeightRequired")),
      portionWeightUnit: z.literal("g"),
      feedingFrequency: z.enum(["daily", "weekly"]),
      feedingsPerDay: z.number().int().positive().optional(),
      feedingsPerWeek: z.number().int().positive().optional(),
    })
    .superRefine((value, ctx) => {
      if (value.feedingFrequency === "daily" && !value.feedingsPerDay) {
        ctx.addIssue({
          code: "custom",
          path: ["feedingsPerDay"],
          message: t("care:forms.foodTracker.errors.feedingsPerDayRequired"),
        });
      }

      if (value.feedingFrequency === "weekly" && !value.feedingsPerWeek) {
        ctx.addIssue({
          code: "custom",
          path: ["feedingsPerWeek"],
          message: t("care:forms.foodTracker.errors.feedingsPerWeekRequired"),
        });
      }
    });
