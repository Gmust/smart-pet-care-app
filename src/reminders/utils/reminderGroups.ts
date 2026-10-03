import i18next from "i18next";

import type { ReminderResponseDto } from "@/api/generated";
import { ReminderStatus, ReminderType } from "@/api/generated";
import { getLocalTimeOfDay } from "@/common/utils/getLocalTimeOfDay";
import { BathIcon } from "@/icons/bath";
import { BellIcon } from "@/icons/bell";
import { BrushCleaningIcon } from "@/icons/brush-cleaning";
import { EarIcon } from "@/icons/ear";
import type { Icon } from "@/icons/icons";
import { PawPrintIcon } from "@/icons/paw-print";
import { ScaleIcon } from "@/icons/scale";
import { ScissorsIcon } from "@/icons/scissors";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { UtensilsIcon } from "@/icons/utensils";
import { WormIcon } from "@/icons/worm";

import type { Reminder, ReminderTone } from "../types";

export type ReminderGroupKey =
  | "overdue"
  | "today"
  | "tomorrow"
  | "soon"
  | "nextWeek"
  | "later"
  | "passed";

const REMINDER_TONE: Record<ReminderType, ReminderTone> = {
  [ReminderType.Medication]: "warn",
  [ReminderType.Vaccination]: "warn",
  [ReminderType.ParasiteTreatment]: "warn",
  [ReminderType.Deworming]: "warn",
  [ReminderType.VetVisit]: "warn",
  [ReminderType.Feeding]: "peach",
  [ReminderType.Weighing]: "peach",
  [ReminderType.Grooming]: "primary",
  [ReminderType.Activity]: "primary",
  [ReminderType.Bathing]: "primary",
  [ReminderType.Brushing]: "primary",
  [ReminderType.EarCleaning]: "primary",
  [ReminderType.NailTrimming]: "primary",
  [ReminderType.PawCare]: "primary",
  [ReminderType.TeethCleaning]: "primary",
};

const getReminderTone = (type: ReminderResponseDto["type"]): ReminderTone =>
  type ? REMINDER_TONE[type] : "primary";

const isReminderOverdue = (reminder: ReminderResponseDto): boolean => {
  if (reminder.status === ReminderStatus.Missed) return true;

  if (reminder.status !== ReminderStatus.Active) return false;

  if (reminder.overdueSince) {
    return new Date(reminder.overdueSince).getTime() <= Date.now();
  }

  if (!reminder.nextTriggerAt) return false;

  return new Date(reminder.nextTriggerAt).getTime() < Date.now();
};

/**
 * The status a reminder is *shown* with, which is not always the one the API
 * stores: a reminder still `Active` server-side reads as `Missed` here once its
 * `overdueSince` has passed. Exported so list filtering agrees with the badge —
 * filtering on the raw `status` instead put an overdue reminder under "Active"
 * while its own card said "Missed", and left it out of "Missed" entirely.
 */
export const getReminderStatus = (reminder: ReminderResponseDto): ReminderStatus => {
  if (isReminderOverdue(reminder)) {
    return ReminderStatus.Missed;
  }

  return reminder.status ?? ReminderStatus.Active;
};

const REMINDER_ICON: Record<ReminderType, Icon> = {
  [ReminderType.Feeding]: UtensilsIcon,
  [ReminderType.Activity]: BellIcon,
  [ReminderType.Medication]: SyringeIcon,
  [ReminderType.Vaccination]: SyringeIcon,
  [ReminderType.ParasiteTreatment]: SyringeIcon,
  [ReminderType.Deworming]: WormIcon,
  [ReminderType.VetVisit]: StethoscopeIcon,
  [ReminderType.Grooming]: ScissorsIcon,
  [ReminderType.Weighing]: ScaleIcon,
  [ReminderType.Bathing]: BathIcon,
  [ReminderType.Brushing]: BrushCleaningIcon,
  [ReminderType.EarCleaning]: EarIcon,
  [ReminderType.NailTrimming]: ScissorsIcon,
  [ReminderType.PawCare]: PawPrintIcon,
  [ReminderType.TeethCleaning]: BrushCleaningIcon,
};

const formatReminderTime = (reminder: ReminderResponseDto): string => {
  // An overdue reminder is shown for the occurrence it actually missed, not for
  // its next one. `nextTriggerAt` has already rolled forward by then, so using
  // it here paired the "Missed" badge with a date in the future — the card read
  // "Sep 14 · Missed" on Sep 13, while the run history showed the real miss at
  // Sep 13 19:55.
  const shownAt =
    isReminderOverdue(reminder) && reminder.overdueSince
      ? reminder.overdueSince
      : reminder.nextTriggerAt;

  if (shownAt) {
    const shownDate = new Date(shownAt);

    if (!Number.isNaN(shownDate.getTime())) {
      return shownDate.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return getLocalTimeOfDay(reminder) ?? i18next.t("reminders:noTime");
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const calendarDayOffset = (target: Date): number =>
  Math.round((startOfDay(target) - startOfDay(new Date())) / MS_PER_DAY);

const getReminderGroupKey = (reminder: ReminderResponseDto): ReminderGroupKey => {
  if (isReminderOverdue(reminder) && reminder.status === ReminderStatus.Active) {
    return "overdue";
  }

  if (!reminder.nextTriggerAt) {
    return "passed";
  }

  const trigger = new Date(reminder.nextTriggerAt);

  if (Number.isNaN(trigger.getTime())) {
    return "passed";
  }

  const offset = calendarDayOffset(trigger);

  if (offset < 0) {
    return "overdue";
  }
  if (offset === 0) {
    return "today";
  }
  if (offset === 1) {
    return "tomorrow";
  }
  if (offset <= 6) {
    return "soon";
  }
  if (offset <= 13) {
    return "nextWeek";
  }

  return "later";
};

const GROUP_ORDER: readonly ReminderGroupKey[] = [
  "overdue",
  "today",
  "tomorrow",
  "soon",
  "nextWeek",
  "later",
  "passed",
];

const getTriggerTimestamp = (reminder: ReminderResponseDto): number => {
  if (!reminder.nextTriggerAt) {
    return Number.POSITIVE_INFINITY;
  }

  const trigger = new Date(reminder.nextTriggerAt).getTime();

  return Number.isNaN(trigger) ? Number.POSITIVE_INFINITY : trigger;
};

export type ReminderGroup = { key: ReminderGroupKey; reminders: Reminder[] };

export const toReminderGroups = (reminders: ReminderResponseDto[]): ReminderGroup[] => {
  const buckets = new Map<ReminderGroupKey, Reminder[]>();

  const ordered = [...reminders].sort(
    (left, right) => getTriggerTimestamp(left) - getTriggerTimestamp(right)
  );

  for (const reminder of ordered) {
    const key = getReminderGroupKey(reminder);
    const bucket = buckets.get(key) ?? [];
    bucket.push({
      id: reminder.id ?? "",
      icon: REMINDER_ICON[reminder.type ?? "Activity"],
      tone: getReminderTone(reminder.type),
      title: reminder.title ?? "",
      time: formatReminderTime(reminder),
      status: getReminderStatus(reminder),
    });
    buckets.set(key, bucket);
  }

  return GROUP_ORDER.flatMap((key) => {
    const grouped = buckets.get(key);

    return grouped && grouped.length > 0 ? [{ key, reminders: grouped }] : [];
  });
};
