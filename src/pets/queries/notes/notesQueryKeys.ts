export const notesQueryKeys = {
  notes: (petId: string) => ["pets", petId, "notes"] as const,
};

// Lets a screen ask whether a note is mid-save; the note is in the variables,
// so the key stays constant and callers filter with a predicate.
export const notesMutationKeys = {
  updateNote: ["notes", "update"] as const,
};
