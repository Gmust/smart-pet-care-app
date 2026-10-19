import type { CreatePetWeightLogDto } from "@/api/generated";

import type { WeightLogFormValues } from "../schemas/weight-log.schema";

import { toApiNumber } from "./toApiNumber";

// `weightKg` takes no null, so an unreadable weight is left out rather than sent.
export const buildWeightLogCreate = (values: WeightLogFormValues): CreatePetWeightLogDto => {
  const weightKg = toApiNumber(values.weightKg);

  return {
    measuredAt: values.measuredAt,
    ...(weightKg !== null ? { weightKg } : {}),
    notes: values.notes.trim() || null,
  };
};
