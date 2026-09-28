import axios from "axios";

/** A failed request in the backend's error contract (`ApiErrorResponse`). */
export interface ParsedApiError {
  /** HTTP status; `null` when no response arrived (offline, timeout) or the
   * failure was not a request at all. */
  status: number | null;
  /** The backend's stable alias (e.g. "pet_not_found") — branch and translate
   * on this, never on `message`. */
  code: string | null;
  /** Values for interpolating the translated `code` message. */
  params: Record<string, unknown> | null;
  /** Server-side English. Show only for a `code` this build cannot translate. */
  message: string | null;
  /** Chat only: the message the failure belongs to. */
  messageId: string | null;
  retryable: boolean;
  retryAfterSeconds: number | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const optionalString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const retryDelay = (value: unknown): number | null => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const getApiError = (error: unknown): ParsedApiError => {
  const status = axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
  const data: unknown = axios.isAxiosError(error) ? error.response?.data : null;
  const body = isRecord(data) ? data : {};

  return {
    status,
    code: optionalString(body.code),
    params: isRecord(body.params) ? body.params : null,
    message: optionalString(body.message),
    messageId: optionalString(body.messageId),
    // The server only sends `retryable` on dependency failures. Without it, a
    // missing response and a rate limit are worth repeating; a 500 is a bug
    // and fails identically, and a 4xx needs a different request.
    retryable:
      typeof body.retryable === "boolean"
        ? body.retryable
        : status === null || status === 429 || status === 503,
    retryAfterSeconds: retryDelay(body.retryAfterSeconds),
  };
};
