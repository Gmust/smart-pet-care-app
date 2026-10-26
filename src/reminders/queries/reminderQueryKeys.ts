import type { GetApiRemindersParams } from "@/api/generated";

export const reminderQueryKeys = {
  all: () => ["reminders"] as const,
  list: (params?: GetApiRemindersParams) => ["reminders", params] as const,
  detail: (id: string | undefined) => ["reminders", "detail", id] as const,
  byPet: (petId: string | undefined) => ["reminders", "pet", petId] as const,
  runs: (id: string) => ["reminders", "runs", id] as const,
  occurrences: (petId: string | undefined, from?: string, to?: string) =>
    ["reminders", "occurrences", petId, from, to] as const,
};
