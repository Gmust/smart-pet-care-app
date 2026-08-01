import dayjs from "dayjs";

import type { PlannedHealthEvent } from "../../types";

import { createMockCollection } from "./store";

// TODO(care-backend): replace with real API once the PlannedHealthEvents endpoint exists.
const collection = createMockCollection<PlannedHealthEvent>();

/**
 * TODO(care-backend): The real backend computes `nextDueAt`. This mirrors
 * that logic client-side only so cards have something to render during
 * development — delete this once the endpoint exists and returns it for
 * real.
 */
function withComputedNextDueAt(
  event: Omit<PlannedHealthEvent, "id">
): Omit<PlannedHealthEvent, "id"> {
  if (!event.lastDoneAt) {
    return { ...event, nextDueAt: undefined };
  }
  return {
    ...event,
    nextDueAt: dayjs(event.lastDoneAt).add(event.intervalN, "month").toISOString(),
  };
}

export const plannedHealthEventsMock = {
  list: (petId: string) => collection.list(petId),
  create: (input: Omit<PlannedHealthEvent, "id">) =>
    collection.create(withComputedNextDueAt(input)),
  update: async (id: string, patch: Partial<Omit<PlannedHealthEvent, "id" | "petId">>) => {
    const merged = await collection.update(id, patch);
    return collection.update(id, withComputedNextDueAt(merged));
  },
  remove: (id: string) => collection.remove(id),
};
