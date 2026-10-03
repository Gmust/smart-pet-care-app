import { HealthRecordType } from "@/api/generated";
import { BugOffIcon } from "@/icons/bug-off";
import { HeartPulseIcon } from "@/icons/heart";
import type { Icon } from "@/icons/icons";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { WormIcon } from "@/icons/worm";

import type {
  HealthHistoryCategory,
  HealthRecordFormCategory,
  HealthTranslationKey,
} from "./types";

// Literal tuples (`as const`) so the zod schemas can use them directly with
// z.enum — one list per concept, nothing to keep in sync by hand.
export const HEALTH_HISTORY_CATEGORIES = [
  HealthRecordType.VetVisit,
  HealthRecordType.Vaccination,
  HealthRecordType.Deworming,
  HealthRecordType.AntiParasiteTreatment,
] as const satisfies readonly HealthHistoryCategory[];

/** Types the add/edit form offers and the record list can show, in picker order.
 * The History grid stays on HEALTH_HISTORY_CATEGORIES — symptoms are opened from
 * the Symptoms overview row instead of a tile. */
export const HEALTH_FORM_CATEGORIES = [
  ...HEALTH_HISTORY_CATEGORIES,
  HealthRecordType.Symptom,
] as const satisfies readonly HealthRecordFormCategory[];

export const HEALTH_CATEGORY_ICON: Record<HealthRecordFormCategory, Icon> = {
  VetVisit: StethoscopeIcon,
  Vaccination: SyringeIcon,
  Deworming: WormIcon,
  AntiParasiteTreatment: BugOffIcon,
  Symptom: HeartPulseIcon,
};

export const HEALTH_CATEGORY_TITLE_PLACEHOLDER_KEYS: Record<
  HealthRecordFormCategory,
  HealthTranslationKey
> = {
  VetVisit: "forms.healthRecord.placeholders.titleVetVisit",
  Vaccination: "forms.healthRecord.placeholders.titleVaccination",
  Deworming: "forms.healthRecord.placeholders.titleDeworming",
  AntiParasiteTreatment: "forms.healthRecord.placeholders.titleAntiParasiteTreatment",
  Symptom: "forms.healthRecord.placeholders.titleSymptom",
};
