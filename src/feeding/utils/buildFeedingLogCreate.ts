import type { CreateFeedingLogDto } from "@/api/generated";

import type { FeedingLogFormValues } from "../schemas/feeding-log.schema";

import { toApiNumber } from "./toApiNumber";
import { trimmedOrNull } from "./trimmedOrNull";

// Blank optional fields become `null`, never `0` or `""`: a stored `0` would skew the daily totals.
// A unit without an amount is dropped, not sent next to a null amount.
export const buildFeedingLogCreate = (values: FeedingLogFormValues): CreateFeedingLogDto => {
  const portionAmount = toApiNumber(values.portionAmount);

  return {
    fedAt: values.fedAt,
    ...(values.foodType ? { foodType: values.foodType } : {}),
    foodName: trimmedOrNull(values.foodName),
    portionAmount,
    portionUnit: portionAmount !== null ? values.portionUnit || null : null,
    approxCalories: toApiNumber(values.approxCalories),
    notes: trimmedOrNull(values.notes),
  };
};
