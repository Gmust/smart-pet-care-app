/**
 * Describes how much of an assistant conversation actually survives, so disclosure
 * copy can be truthful rather than promising retention the runtime does not provide.
 *
 * - `server`: authenticated backend sessions restore the conversation.
 * - `encrypted`: bounded conversation is restored from encrypted on-device storage.
 * - `session`: conversation lives only for the active session and is not restored.
 * - `unavailable`: persistence was expected but a write failed; state may not restore.
 */
export type AssistantPersistenceStatus = "server" | "encrypted" | "session" | "unavailable";

// Authenticated backend sessions are the conversation source of truth. Rich urgency metadata
// from the latest response remains runtime-only until the history DTO exposes those fields.
export const ASSISTANT_PERSISTENCE_STATUS: AssistantPersistenceStatus = "server";
