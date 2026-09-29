import type { ParsedApiError } from "@/errors/utils/getApiError";

import type { AssistantFailureKind } from "../types";

/** The server already holds a newer state for this message: gone, answered,
 * no longer failed, or still in flight. The page re-reads the transcript
 * instead of showing a failure over it. The other 409s (a stored response that
 * cannot be read back, a client id reused with other text) are real failures. */
export const isStaleMessageError = ({ code }: ParsedApiError): boolean =>
  code === "chat_message_not_found" ||
  code === "chat_message_not_retryable" ||
  code === "chat_message_processing_or_retry_required";

/** Which copy a failed bubble shows. Only the session alias means the chat is
 * gone: any other 404 (the pet, one message) is an ordinary failure. */
export const getAssistantFailureKind = ({ status, code }: ParsedApiError): AssistantFailureKind =>
  code === "chat_session_not_found" ? "not-found" : status === 429 ? "rate-limited" : "unavailable";
