// What a spoken phrase resolves to. The rule-based parser fills it today; an on-device model can
// fill the same shape later without touching the screens that act on it.
export type VoiceCommand =
  // `weightKg` is a form string ("12.5"), or "" when the phrase named no number.
  | { action: "logWeight"; petId: string | null; weightKg: string }
  | { action: "addNote"; petId: string | null; content: string };

export type VoiceParseResult =
  | { kind: "command"; command: VoiceCommand }
  | { kind: "unrecognized" };

export type VoiceFailure = "unrecognized" | "noSpeech" | "notAllowed" | "unavailable";
