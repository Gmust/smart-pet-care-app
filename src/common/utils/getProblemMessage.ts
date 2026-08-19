import { isAxiosError } from "axios";

/**
 * Extracts a user-facing message from an API error. The backend returns
 * `{ message }` (e.g. "Email is already taken" or "Once reminders must not
 * include days."), some endpoints return `{ title }` or a bare string; falls
 * back to a caller-provided message.
 */
export const getProblemMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError(error)) return fallback;

  const data: unknown = error.response?.data;

  if (typeof data === "string") return data.trim() || fallback;

  if (typeof data !== "object" || data === null) return fallback;

  if ("message" in data && typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if ("title" in data && typeof data.title === "string" && data.title.trim()) {
    return data.title;
  }

  return fallback;
};
