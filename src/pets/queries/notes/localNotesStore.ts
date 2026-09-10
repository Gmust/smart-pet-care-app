// TEMPORARY stand-in for the backend Notes API, which doesn't exist yet
// (docs/openapi.json has no Note entity or /pets/{petId}/notes endpoints).
// Keeps notes in memory per petId so the UI/UX can be built and tested now.
// Once the backend ships the real endpoints: regenerate the client
// (`pnpm api:update`), re-export the new functions from src/api/index.ts
// (see the getApiPetsPetIdHealthRecords-style entries there), delete this
// file, and rewrite the hooks in this folder to call the real client
// instead of localNotesStore. Data here does not survive an app restart.
import type { PetNote } from "../../types";

const store = new Map<string, PetNote[]>();

const generateId = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

type NoteInput = {
  title: string;
  content: string;
};

export const localNotesStore = {
  list: (petId: string): PetNote[] =>
    [...(store.get(petId) ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),

  create: (petId: string, input: NoteInput): PetNote => {
    const now = new Date().toISOString();
    const note: PetNote = {
      id: generateId(),
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
    store.set(petId, [note, ...(store.get(petId) ?? [])]);
    return note;
  },

  update: (petId: string, noteId: string, input: NoteInput): PetNote => {
    const notes = store.get(petId) ?? [];
    const updatedNotes = notes.map((note) =>
      note.id === noteId ? { ...note, ...input, updatedAt: new Date().toISOString() } : note
    );
    store.set(petId, updatedNotes);

    const updatedNote = updatedNotes.find((note) => note.id === noteId);
    if (!updatedNote) throw new Error(`Note ${noteId} not found for pet ${petId}`);
    return updatedNote;
  },

  remove: (petId: string, noteId: string): void => {
    const notes = store.get(petId) ?? [];
    store.set(
      petId,
      notes.filter((note) => note.id !== noteId)
    );
  },
};
