import type { DayOfWeek, RecurrenceType } from "../types";
import { WEEK_DAYS } from "../types";
import type { TFunction } from "i18next";
import { z } from "zod";

export type CareRuleFormValues = {
  title: string;
  time: string;
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays: DayOfWeek[];
};

export const careRuleSchema = (t: TFunction<["care", "common"]>) =>
  z
    .object({
      title: z.string().trim().min(1, t("care:forms.careRule.errors.titleRequired")),
      time: z.string().min(1, t("care:forms.careRule.errors.timeRequired")),
      recurrenceType: z.enum(["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"]),
      intervalN: z.number().int().positive().optional(),
      weekDays: z.array(z.enum(WEEK_DAYS)),
    })
    .superRefine((value, ctx) => {
      if (value.recurrenceType === "Weekly" && value.weekDays.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["weekDays"],
          message: t("care:forms.careRule.errors.weekDaysRequired"),
        });
      }

      if (
        (value.recurrenceType === "EveryNWeeks" || value.recurrenceType === "EveryNMonths") &&
        !value.intervalN
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["intervalN"],
          message: t("care:forms.careRule.errors.intervalRequired"),
        });
      }
    });
