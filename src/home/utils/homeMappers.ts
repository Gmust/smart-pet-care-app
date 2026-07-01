import type { PetResponseDto, ReminderResponseDto } from "@/api/generated";
import { ReminderStatus, ReminderType } from "@/api/generated";
import { extractTimeOfDay } from "@/common/utils/extractTimeOfDay";
import { BellIcon } from "@/icons/bell";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { UtensilsIcon } from "@/icons/utensils";

import type { ReminderGroupKey } from "../components/RemindersSection";
import type { PetHealth, Reminder, ReminderTone } from "../types";

const getPetScore = (pet: PetResponseDto): number => {
  if (pet.allergies || pet.chronicConditions) {
    return 68;
  }

  return 88;
};

export const toPetHealth = (pet: PetResponseDto): PetHealth => {
  const hasCareNotes = Boolean(pet.allergies || pet.chronicConditions || pet.behavioralNotes);
  const weight =
    pet.weightKg !== null && pet.weightKg !== undefined ? `${pet.weightKg} kg` : "Not added";

  return {
    id: pet.id ?? pet.name ?? "pet",
    petName: pet.name ?? "Unnamed pet",
    score: getPetScore(pet),
    status: hasCareNotes ? "Needs attention — review care notes" : "Stable — no issues logged",
    trendLabel: hasCareNotes ? "Watch" : "Stable",
    signals: {
      weight: { value: weight, status: pet.weightKg ? "ok" : "warn" },
      appetite: { value: "Not tracked", status: "warn" },
      activity: {
        value: pet.updatedAt ? "Updated" : "Not tracked",
        status: pet.updatedAt ? "ok" : "warn",
      },
    },
  };
};

const REMINDER_TONE: Record<ReminderType, ReminderTone> = {
  [ReminderType.Medication]: "warn",
  [ReminderType.Vaccination]: "warn",
  [ReminderType.ParasiteTreatment]: "warn",
  [ReminderType.VetVisit]: "warn",
  [ReminderType.Feeding]: "peach",
  [ReminderType.Grooming]: "primary",
  [ReminderType.Activity]: "primary",
};

const getReminderTone = (type: ReminderResponseDto["type"]): ReminderTone =>
  type ? REMINDER_TONE[type] : "primary";

const isReminderOverdue = (reminder: ReminderResponseDto): boolean => {
  if (reminder.status === ReminderStatus.Missed) {
    return true;
  }

  if (reminder.status !== ReminderStatus.Active || !reminder.nextTriggerAt) {
    return false;
  }

  return new Date(reminder.nextTriggerAt).getTime() < Date.now();
};

const getReminderStatus = (reminder: ReminderResponseDto): ReminderStatus => {
  if (isReminderOverdue(reminder)) {
    return ReminderStatus.Missed;
  }

  return reminder.status ?? ReminderStatus.Active;
};

const getReminderIcon = (type: ReminderResponseDto["type"]) => {
  switch (type) {
    case ReminderType.Feeding:
      return UtensilsIcon;
    case ReminderType.Medication:
    case ReminderType.Vaccination:
    case ReminderType.ParasiteTreatment:
      return SyringeIcon;
    case ReminderType.VetVisit:
    case ReminderType.Grooming:
      return StethoscopeIcon;
    default:
      return BellIcon;
  }
};

const formatReminderTime = (reminder: ReminderResponseDto): string => {
  if (reminder.nextTriggerAt) {
    const triggerDate = new Date(reminder.nextTriggerAt);

    if (!Number.isNaN(triggerDate.getTime())) {
      return triggerDate.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  // Fallback to the recurring time-of-day (HH:MM:SS), trimmed to hours and minutes.
  return extractTimeOfDay(reminder.timeOfDay) ?? "No time";
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// Whole calendar days between `target` and now, ignoring the time of day.
const calendarDayOffset = (target: Date): number =>
  Math.round((startOfDay(target) - startOfDay(new Date())) / MS_PER_DAY);

const getReminderGroupKey = (reminder: ReminderResponseDto): ReminderGroupKey => {
  // No next trigger means the reminder is finished (completed/missed, non-repeatable)
  // and will not fire again, so it belongs in the historical "passed" group.
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
      icon: getReminderIcon(reminder.type),
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
