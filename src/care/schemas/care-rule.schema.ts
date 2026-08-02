import type { TFunction } from "i18next";
import { z } from "zod";

import type { DayOfWeek, RecurrenceType } from "../types";
import { WEEK_DAYS } from "../types";

export type CareRuleFormValues = {
  title: string;
  time: string;
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays: DayOfWeek[];
  startDate?: string; // ISO date, anchor for EveryNMonths / Yearly
};

export const careRuleSchema = (t: TFunction<["care", "common"]>) =>
  z
    .object({
      title: z.string().trim().min(1, t("care:forms.careRule.errors.titleRequired")),
      time: z.string().min(1, t("care:forms.careRule.errors.timeRequired")),
      recurrenceType: z.enum(["Daily", "Weekly", "EveryNWeeks", "EveryNMonths", "Yearly"]),
      intervalN: z.number().int().positive().optional(),
      weekDays: z.array(z.enum(WEEK_DAYS)),
      startDate: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (
        (value.recurrenceType === "Weekly" || value.recurrenceType === "EveryNWeeks") &&
        value.weekDays.length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["weekDays"],
          message: t(
            value.recurrenceType === "Weekly"
              ? "care:forms.careRule.errors.weekDaysRequired"
              : "care:forms.careRule.errors.anchorWeekDayRequired"
          ),
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

      if (
        (value.recurrenceType === "EveryNMonths" || value.recurrenceType === "Yearly") &&
        !value.startDate
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: t("care:forms.careRule.errors.startDateRequired"),
        });
      }
    });
