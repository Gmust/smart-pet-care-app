import type { TFunction } from "i18next";
import { z } from "zod";

export type PlannedHealthEventFormValues = {
  title: string;
  time: string;
  intervalN: number;
  lastDoneAt?: string;
  productName?: string;
  notes?: string;
};

export const plannedHealthEventSchema = (t: TFunction<["care", "common"]>) =>
  z.object({
    title: z.string().trim().min(1, t("care:forms.plannedHealthEvent.errors.titleRequired")),
    time: z.string().min(1, t("care:forms.plannedHealthEvent.errors.timeRequired")),
    intervalN: z
      .number()
      .int()
      .positive(t("care:forms.plannedHealthEvent.errors.intervalRequired")),
    lastDoneAt: z.string().optional(),
    productName: z.string().optional(),
    notes: z.string().optional(),
  });
