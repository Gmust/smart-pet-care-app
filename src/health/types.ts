import type { HealthRecordType } from "@/api/generated";

/** Subset of the backend enum in scope for this ticket. Medication, Surgery, and
 * HealthNote have their own dedicated tabs/tickets (Meds, Symptoms) and aren't
 * part of the History grid. */
export type HealthHistoryCategory = Extract<
  HealthRecordType,
  "VetVisit" | "Vaccination" | "Deworming" | "AntiParasiteTreatment"
>;
