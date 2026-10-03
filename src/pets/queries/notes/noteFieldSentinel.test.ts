import { decodeNoteField, EMPTY_NOTE_FIELD, encodeNoteField } from "./noteFieldSentinel";

describe("noteFieldSentinel", () => {
  it("encodes a blank field as the sentinel", () => {
    expect(encodeNoteField("")).toBe(EMPTY_NOTE_FIELD);
  });

  it("encodes a non-blank field unchanged", () => {
    expect(encodeNoteField("Vet visit")).toBe("Vet visit");
  });

  it("decodes the sentinel back to an empty string", () => {
    expect(decodeNoteField(EMPTY_NOTE_FIELD)).toBe("");
  });

  it("decodes a real value unchanged", () => {
    expect(decodeNoteField("Vet visit")).toBe("Vet visit");
  });

  it("decodes a missing value as an empty string", () => {
    expect(decodeNoteField(undefined)).toBe("");
  });
});
