import { HealthRecordType } from "@/api/generated";
import { BugOffIcon } from "@/icons/bug-off";
import type { Icon } from "@/icons/icons";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { WormIcon } from "@/icons/worm";

import type { HealthHistoryCategory, HealthTranslationKey } from "./types";

export const HEALTH_HISTORY_CATEGORIES: HealthHistoryCategory[] = [
  HealthRecordType.VetVisit,
  HealthRecordType.Vaccination,
  HealthRecordType.Deworming,
  HealthRecordType.AntiParasiteTreatment,
];

export const HEALTH_CATEGORY_ICON: Record<HealthHistoryCategory, Icon> = {
  VetVisit: StethoscopeIcon,
  Vaccination: SyringeIcon,
  Deworming: WormIcon,
  AntiParasiteTreatment: BugOffIcon,
};

export const HEALTH_CATEGORY_TITLE_PLACEHOLDER_KEYS: Record<
  HealthHistoryCategory,
  HealthTranslationKey
> = {
  VetVisit: "forms.healthRecord.placeholders.titleVetVisit",
  Vaccination: "forms.healthRecord.placeholders.titleVaccination",
  Deworming: "forms.healthRecord.placeholders.titleDeworming",
  AntiParasiteTreatment: "forms.healthRecord.placeholders.titleAntiParasiteTreatment",
};
