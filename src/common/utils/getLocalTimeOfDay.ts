import dayjs from "dayjs";

import type { ReminderResponseDto } from "@/api/generated";

import { getUtcOffsetMinutes } from "./getUtcOffsetMinutes";

const MINUTES_PER_DAY = 24 * 60;

type ReminderTime = Pick<ReminderResponseDto, "timeOfDay" | "nextTriggerAt">;

/**
 * The API stores `timeOfDay` in UTC, so it cannot be displayed as-is.
 * `nextTriggerAt` is an absolute instant and survives DST, so prefer it and
 * fall back to shifting `timeOfDay` by the current device offset.
 */
export const getLocalTimeOfDay = (reminder?: ReminderTime): string | undefined => {
  const trigger = dayjs(reminder?.nextTriggerAt);

  if (reminder?.nextTriggerAt && trigger.isValid()) {
    return trigger.format("HH:mm");
  }

  const match = reminder?.timeOfDay?.match(/(\d{1,2}):(\d{2})/);
  if (!match) return undefined;

  const utcMinutes = Number(match[1]) * 60 + Number(match[2]);
  const localMinutes =
    (((utcMinutes + getUtcOffsetMinutes()) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const hours = String(Math.floor(localMinutes / 60)).padStart(2, "0");
  const minutes = String(localMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
};
