import type { FeedingLogResponseDto, ReminderOccurrenceDto } from "@/api/generated";

// `isOverdue` is not reliable yet, so `buildFeedingRows` also calls a slot missed once its time has
// passed on the device clock.
export type FeedingListRow =
  | { kind: "log"; key: string; log: FeedingLogResponseDto }
  | { kind: "scheduled"; key: string; occurrence: ReminderOccurrenceDto }
  | { kind: "missed"; key: string; occurrence: ReminderOccurrenceDto };

export type FeedingDaySection = {
  key: string;
  dayIso: string;
  rows: FeedingListRow[];
};

export type WeekMetric = "calories" | "meals";

export type WeekDayBar = {
  date: string;
  value: number;
  isToday: boolean;
};

export type WeekSummary = {
  metric: WeekMetric;
  bars: WeekDayBar[];
  average: number | null;
  target: number | null;
  deviationPct: number | null;
};

export type WeightPoint = {
  measuredAt: string;
  weightKg: number;
};

export type FeedingSlot = {
  reminderId: string;
  fedAt: string;
  title: string | null;
};
