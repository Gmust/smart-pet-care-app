import type { HealthRecordType } from "@/api/generated";

import type healthEn from "./locales/en.json";

/** Subset of the backend enum in scope for this ticket. Medication, Surgery, and
 * HealthNote have their own dedicated tabs/tickets (Meds, Symptoms) and aren't
 * part of the History grid. */
export type HealthHistoryCategory = Extract<
  HealthRecordType,
  "VetVisit" | "Vaccination" | "Deworming" | "AntiParasiteTreatment"
>;

/** Recursively extracts every leaf dot-path key from the "health" translation JSON. */
type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends object
      ? `${K}.${DotPaths<T[K]>}`
      : never;
}[keyof T & string];

export type HealthTranslationKey = DotPaths<typeof healthEn>;
