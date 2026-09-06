export const activityQueryKeys = {
  all: () => ["activity"] as const,
  logs: (petId: string) => ["activity", "logs", petId] as const,
  logsInRange: (petId: string, from?: string, to?: string) =>
    ["activity", "logs", petId, from, to] as const,
};
