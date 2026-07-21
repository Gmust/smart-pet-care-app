import { HealthRecordType } from "@/api/generated";

import type { HealthHistoryCategory } from "./types";

export const HEALTH_HISTORY_CATEGORIES: HealthHistoryCategory[] = [
  HealthRecordType.VetVisit,
  HealthRecordType.Vaccination,
  HealthRecordType.Deworming,
  HealthRecordType.AntiParasiteTreatment,
];
