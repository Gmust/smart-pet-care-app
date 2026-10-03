export const notesQueryKeys = {
  notes: (petId: string) => ["pets", petId, "notes"] as const,
};
