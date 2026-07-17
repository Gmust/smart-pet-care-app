import axios from "axios";

type AssistantApiErrorKind = "classifier" | "network" | "problem";

export interface AssistantApiError {
  kind: AssistantApiErrorKind;
  status: number | null;
  code: string | null;
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

export const getAssistantApiError = (error: unknown): AssistantApiError => {
  if (!axios.isAxiosError(error)) {
    return {
      kind: "network",
      status: null,
      code: null,
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
      code: null,
      message: optionalString(data.detail) ?? optionalString(data.title),
      messageId: null,
      retryable: status === null || status >= 500,
      retryAfterSeconds: null,
    };
  }

  return {
    kind: error.response ? "problem" : "network",
    status,
    code: null,
    message: error.message || null,
    messageId: null,
    retryable: status === null || status >= 500,
    retryAfterSeconds: null,
  };
};

export const isAssistantNotFoundError = (error: unknown): boolean =>
  getAssistantApiError(error).status === 404;
