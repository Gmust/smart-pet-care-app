export const healthQueryKeys = {
  records: (petId: string) => ["health", "records", petId] as const,
};
