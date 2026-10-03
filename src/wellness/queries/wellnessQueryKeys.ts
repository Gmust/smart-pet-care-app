export const wellnessQueryKeys = {
  all: () => ["wellness"] as const,
  evaluation: (petId: string) => ["wellness", "evaluation", petId] as const,
};
