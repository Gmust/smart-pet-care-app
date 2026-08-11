import type { TFunction } from "i18next";
import { z } from "zod";

import { SymptomType } from "@/api/generated";

import type { HealthHistoryCategory } from "../types";

import { HISTORY_CATEGORIES } from "./health-record-list-params.schema";

export type HealthRecordFormValues = {
  petId: string;
  type: HealthHistoryCategory | "";
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
    petId: z.string().min(1, t("health:forms.healthRecord.errors.petRequired")),
    // "" stands for "not chosen yet" (the pet/type picker steps) — literal-union
    // with HISTORY_CATEGORIES so the field's Input type matches
    // HealthRecordFormValues.type exactly, which TanStack Form's Standard
    // Schema typing requires.
    type: z.union([z.literal(""), z.enum(HISTORY_CATEGORIES)]).refine((value) => value !== "", {
      message: t("health:forms.healthRecord.errors.typeRequired"),
    }),
    title: z.string().min(1, t("health:forms.healthRecord.errors.titleRequired")),
    performedAt: z.string().min(1, t("health:forms.healthRecord.errors.performedAtRequired")),
    description: z.string(),
    nextDueAt: z.string(),
    dosage: z.string(),
    provider: z.string(),
    symptoms: z.array(z.enum(SYMPTOM_TYPE_VALUES)),
  });
