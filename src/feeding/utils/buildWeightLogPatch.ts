import type { PatchPetWeightLogDto, PetWeightLogResponseDto } from "@/api/generated";

import type { WeightLogFormValues } from "../schemas/weight-log.schema";

import { toApiNumber } from "./toApiNumber";

// PATCH: send only what changed, or a stale form overwrites a concurrent edit. The weight is
// compared as a number (`4.1` equals `"4.1"`). `weightKg` and `measuredAt` cannot be cleared: their
// `PatchFieldOf*` types carry no `null`, so the form requires them.
export const buildWeightLogPatch = (
  values: WeightLogFormValues,
  log: PetWeightLogResponseDto
): PatchPetWeightLogDto => {
  const dto: PatchPetWeightLogDto = {};

  if (values.measuredAt !== log.measuredAt) dto.measuredAt = values.measuredAt;

  const weightKg = toApiNumber(values.weightKg);
  if (weightKg !== null && weightKg !== toApiNumber(log.weightKg)) dto.weightKg = weightKg;

  const notes = values.notes.trim() || null;
  if (notes !== (log.notes ?? null)) dto.notes = notes;

  return dto;
};
