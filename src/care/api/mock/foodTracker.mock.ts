import type { FoodTracker } from "../../types";
import { toGrams } from "../../utils/weight";
import { createMockCollection } from "./store";
import dayjs from "dayjs";

const collection = createMockCollection<FoodTracker>();

/**
 * The real backend computes remainingWeight / restockDate from consumption.
 * This mirrors that logic client-side only so the card has real-looking
 * numbers during development — delete this once the endpoint returns them.
 */
function withComputedFields(input: Omit<FoodTracker, "id">): Omit<FoodTracker, "id"> {
  const totalGrams = toGrams(input.packageWeight, input.packageWeightUnit) * input.packageCount;
  const portionGrams = toGrams(input.portionWeight, input.portionWeightUnit);

  const dailyConsumptionGrams =
    input.feedingFrequency === "daily"
      ? portionGrams * (input.feedingsPerDay ?? 1)
      : (portionGrams * (input.feedingsPerWeek ?? 1)) / 7;

  const daysSinceOpened = Math.max(0, dayjs().diff(dayjs(input.openedAt), "day"));
  const consumedGrams = dailyConsumptionGrams * daysSinceOpened;
  const remainingGrams = Math.max(0, totalGrams - consumedGrams);

  const daysUntilEmpty =
    dailyConsumptionGrams > 0 ? Math.floor(remainingGrams / dailyConsumptionGrams) : null;

  return {
    ...input,
    remainingWeight: remainingGrams,
    remainingWeightUnit: "g",
    restockDate:
      daysUntilEmpty === null ? undefined : dayjs().add(daysUntilEmpty, "day").toISOString(),
  };
}

export const foodTrackerMock = {
  list: (petId: string) => collection.list(petId),
  create: (input: Omit<FoodTracker, "id">) => collection.create(withComputedFields(input)),
  update: async (id: string, patch: Partial<Omit<FoodTracker, "id" | "petId">>) => {
    const merged = await collection.update(id, patch);
    return collection.update(id, withComputedFields(merged));
  },
  remove: (id: string) => collection.remove(id),
};
