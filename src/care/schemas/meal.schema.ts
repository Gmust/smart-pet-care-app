import type { TFunction } from "i18next";
import { z } from "zod";

export type MealFormValues = {
  title: string;
  time: string;
};

export const mealSchema = (t: TFunction<["care", "common"]>) =>
  z.object({
    title: z.string().trim().min(1, t("care:forms.meal.errors.titleRequired")),
    time: z.string().min(1, t("care:forms.meal.errors.timeRequired")),
  });
