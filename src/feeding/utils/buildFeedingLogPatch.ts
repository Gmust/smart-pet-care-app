import type { FeedingLogResponseDto, PatchFeedingLogDto } from "@/api/generated";

import type { FeedingLogFormValues } from "../schemas/feeding-log.schema";

import { toApiNumber } from "./toApiNumber";
import { trimmedOrNull } from "./trimmedOrNull";

// PATCH: an omitted key is left unchanged, `null` clears. Send only what changed, or a stale form
// overwrites a concurrent edit. Numbers are compared as numbers: the API types them `number |
// string`, so `85` and `"85"` are the same value. `foodType`, `portionUnit` and `portionAmount` can
// never be cleared: their `PatchFieldOf*` types carry no `null`, so the form requires them.
export const buildFeedingLogPatch = (
  values: FeedingLogFormValues,
  log: FeedingLogResponseDto
): PatchFeedingLogDto => {
  const dto: PatchFeedingLogDto = {};

  if (values.fedAt !== log.fedAt) dto.fedAt = values.fedAt;

  if (values.foodType && values.foodType !== log.foodType) dto.foodType = values.foodType;

  const foodName = trimmedOrNull(values.foodName);
  if (foodName !== (log.foodName ?? null)) dto.foodName = foodName;

  const portionAmount = toApiNumber(values.portionAmount);
  if (portionAmount !== null && portionAmount !== toApiNumber(log.portionAmount)) {
    dto.portionAmount = portionAmount;
  }

  // Create drops a unit that has no amount; do the same instead of storing "g" of nothing.
  const hasPortion = portionAmount !== null || toApiNumber(log.portionAmount) !== null;
  if (hasPortion && values.portionUnit && values.portionUnit !== log.portionUnit) {
    dto.portionUnit = values.portionUnit;
  }

  const approxCalories = toApiNumber(values.approxCalories);
  if (approxCalories !== toApiNumber(log.approxCalories)) dto.approxCalories = approxCalories;

  const notes = trimmedOrNull(values.notes);
  if (notes !== (log.notes ?? null)) dto.notes = notes;

  return dto;
};
