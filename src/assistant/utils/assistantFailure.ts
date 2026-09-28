import type { ParsedApiError } from "@/errors/utils/getApiError";

import type { AssistantFailureKind } from "../types";

/** Which copy a failed bubble shows. Only the session alias means the chat is
 * gone: any other 404 (the pet, one message) is an ordinary failure. A 409
 * never gets a bubble: the page re-reads the transcript instead. */
export const getAssistantFailureKind = ({ status, code }: ParsedApiError): AssistantFailureKind =>
  code === "chat_session_not_found" ? "not-found" : status === 429 ? "rate-limited" : "unavailable";
