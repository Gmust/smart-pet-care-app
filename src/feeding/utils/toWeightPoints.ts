import type { PetWeightLogResponseDto } from "@/api/generated";

import type { WeightPoint } from "../types";

import { toApiNumber } from "./toApiNumber";

// Entries without a usable weight or date are dropped: a 0 kg point would rescale the whole axis.
export const toWeightPoints = (logs: PetWeightLogResponseDto[] | undefined): WeightPoint[] =>
  (logs ?? [])
    .flatMap((entry) => {
      const weightKg = toApiNumber(entry.weightKg);
      if (weightKg === null || weightKg <= 0 || !entry.measuredAt) return [];

      const time = new Date(entry.measuredAt).getTime();
      if (Number.isNaN(time)) return [];

      return [{ measuredAt: entry.measuredAt, weightKg }];
    })
    .sort(
      (left, right) => new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime()
    );
