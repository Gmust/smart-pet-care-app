import type { PlannedHealthEvent } from "../../types";
import { createMockCollection } from "./store";
import dayjs from "dayjs";

const collection = createMockCollection<PlannedHealthEvent>();

/**
 * The real backend computes `nextDueAt`. This mirrors that logic client-side
 * only so cards have something to render during development — delete this
 * once the endpoint exists and returns it for real.
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
