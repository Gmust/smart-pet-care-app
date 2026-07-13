/**
 * Describes how much of an assistant conversation actually survives, so disclosure
 * copy can be truthful rather than promising retention the runtime does not provide.
 *
 * - `encrypted`: bounded conversation is restored from encrypted on-device storage.
 * - `session`: conversation lives only for the active session and is not restored.
 * - `unavailable`: persistence was expected but a write failed; state may not restore.
 */
export type AssistantPersistenceStatus = "encrypted" | "session" | "unavailable";

// Conversation messages are held in memory only; the backend history endpoint is the
// planned source of truth. Until encrypted message persistence ships, state is session-only.
// TODO(backend-history): report `encrypted` once restored conversations are backed by storage.
export const ASSISTANT_PERSISTENCE_STATUS: AssistantPersistenceStatus = "session";
