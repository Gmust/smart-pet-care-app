// Backend rejects empty title/content on create (note_title_required /
// note_content_required) despite both being optional in the spec. A
// zero-width space satisfies it while staying invisible to the user.
export const EMPTY_NOTE_FIELD = "\u200B";

export const encodeNoteField = (trimmedValue: string): string => trimmedValue || EMPTY_NOTE_FIELD;

export const decodeNoteField = (value: string | undefined): string =>
  value === EMPTY_NOTE_FIELD ? "" : (value ?? "");
