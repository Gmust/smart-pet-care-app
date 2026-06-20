import { DaysOfWeek, ReminderType } from "@/api/generated";

import type { TFunction } from "i18next";
import { z } from "zod/v4";

const DAY_INDEX: Record<DaysOfWeek, number> = {
  [DaysOfWeek.Sunday]: 0,
  [DaysOfWeek.Monday]: 1,
  [DaysOfWeek.Tuesday]: 2,
  [DaysOfWeek.Wednesday]: 3,
  [DaysOfWeek.Thursday]: 4,
  [DaysOfWeek.Friday]: 5,
  [DaysOfWeek.Saturday]: 6,
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

const hasFutureOccurrence = ({
  days,
  isRepeatable,
  now,
  time,
}: {
  days: DaysOfWeek[];
  isRepeatable: boolean;
  now: Date;
  time: string;
}) => {
  if (days.length === 0) {
    return true;
  }

  const parsed = parseReminderTime(time);

  if (!parsed) {
    return true;
  }

  return days.some((day) => {
    let dayOffset = DAY_INDEX[day] - now.getDay();

    if (!isRepeatable && dayOffset < 0) {
      return false;
    }

    if (isRepeatable && dayOffset < 0) {
      dayOffset += 7;
    }

    const occurrence = new Date(now);
    occurrence.setDate(now.getDate() + dayOffset);
    occurrence.setHours(parsed.hours, parsed.minutes, 0, 0);

    if (isRepeatable && dayOffset === 0 && occurrence.getTime() <= now.getTime()) {
      occurrence.setDate(occurrence.getDate() + 7);
    }

    return occurrence.getTime() > now.getTime();
  });
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
      days: z.array(z.enum(DaysOfWeek)).min(1, t("validation.daysRequired")),
      isRepeatable: z.boolean().default(false),
      time: z.string().regex(/^\d{2}:\d{2}$/, t("validation.timeInvalid")),
      endAt: z.iso.datetime(t("validation.endAtInvalid")).nullish(),
    })
    .superRefine((value, ctx) => {
      if (
        !hasFutureOccurrence({
          days: value.days,
          isRepeatable: value.isRepeatable,
          now: new Date(),
          time: value.time,
        })
      ) {
        ctx.addIssue({
          code: "custom",
          message: t("validation.timePast"),
          path: ["time"],
        });
      }
    });

type CreateReminderSchema = ReturnType<typeof createReminderSchema>;
export type CreateReminderForm = z.input<CreateReminderSchema>;
