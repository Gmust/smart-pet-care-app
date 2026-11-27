import type { FeedingStatus } from "@/api/generated";
import { FeedingStatus as FeedingStatusValue, FoodType, PortionUnit } from "@/api/generated";
import { CanIcon } from "@/icons/can";
import { CookieIcon } from "@/icons/cookie";
import { DropletsIcon } from "@/icons/droplets";
import type { Icon } from "@/icons/icons";
import { PillBottleIcon } from "@/icons/pill-bottle";
import { SoupIcon } from "@/icons/soup";
import { UtensilsIcon } from "@/icons/utensils";
import type { ChipTone } from "@/shadecn/ui/chip";

export const FOOD_TYPES: FoodType[] = [
  FoodType.DryFood,
  FoodType.WetFood,
  FoodType.Homemade,
  FoodType.Treat,
  FoodType.Supplement,
  FoodType.Other,
];

export const FOOD_TYPE_ICONS: Record<FoodType, Icon> = {
  [FoodType.DryFood]: CanIcon,
  [FoodType.WetFood]: DropletsIcon,
  [FoodType.Homemade]: SoupIcon,
  [FoodType.Treat]: CookieIcon,
  [FoodType.Supplement]: PillBottleIcon,
  [FoodType.Other]: UtensilsIcon,
};

// `PortionUnit` has `null` as an enum member in responses but not in `PatchFieldOfPortionUnit`,
// so the list is spelled out rather than derived from `Object.values`.
export const PORTION_UNITS = [
  PortionUnit.Gram,
  PortionUnit.Milliliter,
  PortionUnit.Cup,
  PortionUnit.Piece,
] as const;

export const QUERY_STALE_TIME_MS = 60_000;

export const WEIGHT_WINDOW_DAYS = 90;

export const WEEK_LENGTH_DAYS = 7;

// `GET /feeding-logs` takes no date range, so this only bounds the occurrences request and the
// client-side grouping window.
export const DEFAULT_RANGE_DAYS = 30;

export const ANALYSIS_STATUS_TONE = {
  [FeedingStatusValue.ExtremeUnderTarget]: "danger",
  [FeedingStatusValue.UnderTarget]: "warn",
  [FeedingStatusValue.OnTarget]: "ok",
  [FeedingStatusValue.OverTarget]: "warn",
  [FeedingStatusValue.ExtremeOverTarget]: "danger",
} satisfies Record<FeedingStatus, ChipTone>;

export const WEIGHT_PERIODS = {
  month: { amount: 1, unit: "month" },
  quarter: { amount: 3, unit: "month" },
  year: { amount: 1, unit: "year" },
} as const;

export type WeightPeriod = keyof typeof WEIGHT_PERIODS;

export const WEIGHT_PERIOD_KEYS: WeightPeriod[] = ["month", "quarter", "year"];
