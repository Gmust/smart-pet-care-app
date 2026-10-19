export const feedingQueryKeys = {
  all: () => ["feeding"] as const,
  logs: (petId: string) => ["feeding", "logs", petId] as const,
  summary: (petId: string) => ["feeding", "summary", petId] as const,
  summaryForDate: (petId: string, date: string) => ["feeding", "summary", petId, date] as const,
  analysis: (petId: string) => ["feeding", "analysis", petId] as const,
  weight: (petId: string) => ["feeding", "weight", petId] as const,
  weightInRange: (petId: string, from?: string, to?: string) =>
    ["feeding", "weight", petId, from, to] as const,
};
