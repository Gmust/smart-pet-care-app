import { SymptomType } from "@/api/generated";

import type { TFunction } from "i18next";
import { z } from "zod";

export type HealthRecordFormValues = {
  title: string;
  performedAt: string;
  description: string;
  nextDueAt: string;
  dosage: string;
  provider: string;
  symptoms: SymptomType[];
};

const SYMPTOM_TYPE_VALUES = Object.values(SymptomType) as [SymptomType, ...SymptomType[]];

export const healthRecordSchema = (t: TFunction<["health", "common"]>) =>
  z.object({
    title: z.string().min(1, t("health:forms.healthRecord.errors.titleRequired")),
    performedAt: z.string().min(1, t("health:forms.healthRecord.errors.performedAtRequired")),
    description: z.string(),
    nextDueAt: z.string(),
    dosage: z.string(),
    provider: z.string(),
    symptoms: z.array(z.enum(SYMPTOM_TYPE_VALUES)),
  });
