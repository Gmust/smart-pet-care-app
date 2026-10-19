import type { TFunction } from "i18next";
import { z } from "zod";

import { isPositiveDecimal } from "./number-fields";

export type WeightLogFormValues = {
  weightKg: string;
  measuredAt: string;
  notes: string;
};

export const weightLogSchema = (t: TFunction<["feeding", "common"]>) =>
  z.object({
    weightKg: z
      .string()
      .min(1, t("feeding:forms.weight.errors.weightRequired"))
      .refine((value) => {
        // An empty field is already reported as required; do not add a second message.
        if (value === "") return true;
        const trimmed = value.trim();
        return isPositiveDecimal(trimmed);
      }, t("feeding:forms.weight.errors.weightInvalid")),
    measuredAt: z
      .string()
      .min(1, t("feeding:forms.weight.errors.measuredAtRequired"))
      .refine((value) => !value || new Date(value).getTime() <= Date.now(), {
        message: t("feeding:forms.weight.errors.measuredAtFuture"),
      }),
    notes: z.string(),
  });
