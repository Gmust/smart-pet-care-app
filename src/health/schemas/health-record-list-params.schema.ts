import { z } from "zod";

import { HealthRecordType } from "@/api/generated";

import type { HealthHistoryCategory } from "../types";

// Kept in sync manually with HEALTH_HISTORY_CATEGORIES in ../constants.ts —
// zod needs a literal tuple for z.enum, so it can't just read the array.
const HISTORY_CATEGORIES = [
  HealthRecordType.VetVisit,
  HealthRecordType.Vaccination,
  HealthRecordType.Deworming,
  HealthRecordType.AntiParasiteTreatment,
] as const satisfies readonly HealthHistoryCategory[];

export const healthRecordListParamsSchema = z.object({
  petId: z.uuid(),
  type: z.enum(HISTORY_CATEGORIES),
});

export type HealthRecordListParams = z.infer<typeof healthRecordListParamsSchema>;
