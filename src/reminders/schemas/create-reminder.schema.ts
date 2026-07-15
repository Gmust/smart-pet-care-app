import { DaysOfWeek, ReminderType, RepeatType } from "@/api/generated";

import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { z } from "zod/v4";

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
      days: z.array(z.enum(DaysOfWeek)).default([]),
      date: z.iso.date(t("validation.dateInvalid")).nullish(),
      time: z.string().regex(/^\d{2}:\d{2}$/, t("validation.timeInvalid")),
      endAt: z.iso.datetime(t("validation.endAtInvalid")).nullish(),
    })
    .superRefine((value, ctx) => {
      if (value.repeatType === RepeatType.Weekly && value.days.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.daysRequired"),
          path: ["days"],
        });
      }

      const needsDate =
        value.repeatType === RepeatType.Once || value.repeatType === RepeatType.Monthly;

      if (needsDate && !value.date) {
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
