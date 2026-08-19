export const healthQueryKeys = {
  allRecords: () => ["health", "records"] as const,
  records: (petId: string) => ["health", "records", petId] as const,
  recordsByType: (petId: string, type: string, from?: string, to?: string) =>
    ["health", "records", petId, type, from, to] as const,
  symptoms: () => ["health", "symptoms"] as const,
};
