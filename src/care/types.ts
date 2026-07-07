import { DaysOfWeek } from "@/api/generated";
import type careEn from "@/care/locales/en.json";

export type DayOfWeek = DaysOfWeek;
export const WEEK_DAYS = Object.values(DaysOfWeek) as DayOfWeek[];

export type RecurrenceType = "Daily" | "Weekly" | "EveryNWeeks" | "EveryNMonths";

/**
 * Categories backed by CareRule. Vaccination / Deworming / Antiparasite are
 * NOT here — they're PlannedHealthEvent categories (see below), since they
 * carry history (lastDoneAt, productName) that plain CareRule doesn't need.
 */
export type CareCategory =
  | "VetVisit"
  | "Weighing"
  | "Walking"
  | "Bathing"
  | "Brushing"
  | "EarCleaning"
  | "NailTrimming"
  | "PawCare"
  | "TeethCleaning";

export type PlannedHealthEventCategory = "Vaccination" | "Deworming" | "Antiparasite";

export type WeightUnit = "g" | "kg";

export type FeedingFrequency = "daily" | "weekly";

/**
 * Meal — a feeding time. Today the UI only exposes title + time (recurrence
 * is always sent as "Daily"). weekDays / non-"Daily" recurrenceType are
 * already modeled so the future "advanced settings" (per-weekday feeding)
 * doesn't require a schema/type migration — only new form fields + a new
 * RecurrenceChip branch.
 */
export type MealRule = {
  id: string;
  petId: string;
  title: string;
  time: string; // "HH:mm"
  recurrenceType: RecurrenceType;
  weekDays?: DayOfWeek[];
};

/** A regular care rule: Vet Visit, Weighing, Walking, Grooming sub-categories. */
export type CareRule = {
  id: string;
  petId: string;
  category: CareCategory;
  title: string;
  reminderTime: string; // "HH:mm"
  recurrenceType: RecurrenceType;
  intervalN?: number; // for EveryNWeeks / EveryNMonths
  weekDays?: DayOfWeek[]; // Weekly (several) or EveryNWeeks (one)
  startDate?: string; // ISO date, for EveryNMonths anchor
};

/** A planned event with history: Vaccination, Deworming, Antiparasite. */
export type PlannedHealthEvent = {
  id: string;
  petId: string;
  category: PlannedHealthEventCategory;
  title: string;
  reminderTime: string;
  intervalN: number; // every N months
  lastDoneAt?: string;
  productName?: string;
  notes?: string;
  nextDueAt?: string; // computed server-side (mocked client-side for now)
};

/** Food stock tracker — separate entity, not a reminder rule. */
export type FoodTracker = {
  id: string;
  petId: string;
  foodName: string;
  packageWeight: number;
  packageWeightUnit: WeightUnit;
  packageCount: number;
  openedAt: string; // ISO date
  portionWeight: number;
  portionWeightUnit: WeightUnit;
  feedingFrequency: FeedingFrequency;
  feedingsPerDay?: number;
  feedingsPerWeek?: number;
  remainingWeight?: number; // computed
  remainingWeightUnit?: WeightUnit; // computed
  restockDate?: string; // computed
};

export type CareSectionKey =
  | "meals"
  | "foodTracker"
  | "vetVisit"
  | "vaccination"
  | "treatments"
  | "weighing"
  | "walking"
  | "grooming";

/** Recursively extracts every leaf dot-path key from the "care" translation JSON. */
type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends object
      ? `${K}.${DotPaths<T[K]>}`
      : never;
}[keyof T & string];

export type CareTranslationKey = DotPaths<typeof careEn>;
