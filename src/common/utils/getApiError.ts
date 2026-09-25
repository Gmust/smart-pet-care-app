import axios from "axios";

type ApiErrorKind = "classifier" | "network" | "problem";

export interface ParsedApiError {
  kind: ApiErrorKind;
  status: number | null;
  /** The backend's stable alias for the error (e.g. "request_validation_failed") —
   * translate on this, not on `message`, which is server-side English. */
  code: string | null;
  /** Values for interpolating the translated `code` message. */
  params: Record<string, unknown> | null;
  message: string | null;
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
  if (!axios.isAxiosError(error)) {
    return {
      kind: "network",
      status: null,
      code: null,
      params: null,
      message: error instanceof Error ? error.message : null,
      messageId: null,
      retryable: true,
      retryAfterSeconds: null,
    };
  }

  const status = error.response?.status ?? null;
  const data: unknown = error.response?.data;
  if (isRecord(data) && typeof data.retryable === "boolean") {
    return {
      kind: "classifier",
      status,
      code: optionalString(data.code),
      params: isRecord(data.params) ? data.params : null,
      message: optionalString(data.message),
      messageId: optionalString(data.messageId),
      retryable: data.retryable,
      retryAfterSeconds: retryDelay(data.retryAfterSeconds),
    };
  }

  if (isRecord(data)) {
    return {
      kind: "problem",
      status,
      code: optionalString(data.code),
      params: isRecord(data.params) ? data.params : null,
      message: optionalString(data.detail) ?? optionalString(data.title),
      messageId: null,
      retryable: status === null || status >= 500,
      retryAfterSeconds: retryDelay(data.retryAfterSeconds),
    };
  }

  return {
    kind: error.response ? "problem" : "network",
    status,
    code: null,
    params: null,
    message: error.message || null,
    messageId: null,
    retryable: status === null || status >= 500,
    retryAfterSeconds: null,
  };
};
