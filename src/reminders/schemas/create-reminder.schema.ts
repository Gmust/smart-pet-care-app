import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { z } from "zod/v4";

import { DaysOfWeek, RecalcStrategy, ReminderType, RepeatType } from "@/api/generated";

export const REPEAT_TYPE_RULES: Record<
  RepeatType,
  {
    usesDays: boolean;
    usesDate: boolean;
    intervalUnit?: "Daily" | "Weekly" | "Monthly";
    recalcStrategies: readonly RecalcStrategy[];
  }
> = {
  [RepeatType.Once]: {
    usesDays: false,
    usesDate: true,
    recalcStrategies: [],
  },
  [RepeatType.Daily]: {
    usesDays: false,
    usesDate: false,
    intervalUnit: "Daily",
    recalcStrategies: [RecalcStrategy.Calendar, RecalcStrategy.FromCompletion],
  },
  [RepeatType.Weekly]: {
    usesDays: true,
    usesDate: false,
    intervalUnit: "Weekly",
    recalcStrategies: [
      RecalcStrategy.Calendar,
      RecalcStrategy.FromCompletion,
      RecalcStrategy.FromCompletionAlignedToWeekday,
    ],
  },
  [RepeatType.Monthly]: {
    usesDays: false,
    usesDate: true,
    intervalUnit: "Monthly",
    recalcStrategies: [RecalcStrategy.Calendar, RecalcStrategy.FromCompletion],
  },
};

const parseReminderTime = (value: string) => {
  const [hoursValue, minutesValue] = value.split(":");
  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
};

export const createReminderSchema = (t: TFunction<"reminders">) =>
  z
    .object({
      petId: z.uuid(t("validation.petRequired")),
      title: z.string().trim().min(1, t("validation.titleRequired")),
      description: z.string().trim().nullish(),
      type: z.enum(ReminderType, {
        error: t("validation.typeRequired"),
      }),
      repeatType: z.enum(RepeatType, {
        error: t("validation.repeatTypeRequired"),
      }),
      intervalN: z
        .string()
        .regex(/^\d+$/, t("validation.intervalInvalid"))
        .refine((value) => Number(value) >= 1, t("validation.intervalInvalid")),
      recalcStrategy: z.enum(RecalcStrategy, {
        error: t("validation.recalcStrategyRequired"),
      }),
      days: z.array(z.enum(DaysOfWeek)).default([]),
      date: z.iso.date(t("validation.dateInvalid")).nullish(),
      time: z.string().regex(/^\d{2}:\d{2}$/, t("validation.timeInvalid")),
      endAt: z.iso.datetime(t("validation.endAtInvalid")).nullish(),
    })
    .superRefine((value, ctx) => {
      const rules = REPEAT_TYPE_RULES[value.repeatType];

      if (rules.usesDays && value.days.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.daysRequired"),
          path: ["days"],
        });
      }

      if (
        rules.recalcStrategies.length > 0 &&
        !rules.recalcStrategies.includes(value.recalcStrategy)
      ) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.recalcStrategyWeekdayRequiresDays"),
          path: ["recalcStrategy"],
        });
      }

      if (rules.usesDate && !value.date) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.dateRequired"),
          path: ["date"],
        });
      }

      const parsedTime = parseReminderTime(value.time);

      if (value.repeatType === RepeatType.Once && value.date && parsedTime) {
        const occurrence = dayjs(value.date)
          .hour(parsedTime.hours)
          .minute(parsedTime.minutes)
          .second(0)
          .millisecond(0);

        if (occurrence.valueOf() <= Date.now()) {
          ctx.addIssue({
            code: "custom",
            message: t("validation.timePast"),
            path: ["time"],
          });
        }
      }
    });

type CreateReminderSchema = ReturnType<typeof createReminderSchema>;
export type CreateReminderForm = z.input<CreateReminderSchema>;
